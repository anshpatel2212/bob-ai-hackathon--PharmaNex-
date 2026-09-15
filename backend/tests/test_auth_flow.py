import sys
import uuid
from starlette.testclient import TestClient
from backend.main import app, extract_registered_routes
from backend.database import SessionLocal
from backend.models import User

client = TestClient(app)

def run_tests():
    print("=== STARTING BACKEND AUTHENTICATION TEST SUITE ===")
    
    # 0. Verify Programmatic Routes
    all_routes = extract_registered_routes(app)
    routes_map = {}
    for r in all_routes:
        methods = r.get("methods") or []
        path = r.get("path")
        if path:
            for m in methods:
                routes_map.setdefault(m, set()).add(path)

    expected_routes = [
        ("GET", "/"),
        ("GET", "/health"),
        ("GET", "/api/health"),
        ("GET", "/api/debug/routes"),
        ("POST", "/api/auth/register"),
        ("POST", "/api/auth/login"),
        ("GET", "/api/auth/me"),
        ("POST", "/api/auth/logout"),
    ]
    for method, path in expected_routes:
        assert path in routes_map.get(method, set()), f"Missing expected route: {method} {path}"
    print("[PASS] Programmatic routes inspection passed")

    # 1. Health & Root Checks
    r = client.get("/")
    assert r.status_code == 200, f"GET / failed: {r.status_code} - {r.text}"
    root_data = r.json()
    assert root_data["status"] == "ok"
    assert root_data["service"] == "PharmaGuard AI Backend"
    assert root_data["version"] == "1.0.0"
    assert root_data["message"] == "FastAPI backend is running"
    print("[PASS] Root check GET /")

    r = client.get("/health")
    assert r.status_code == 200, f"/health failed: {r.status_code}"
    assert r.json() == {"status": "ok"}, f"Unexpected health response: {r.json()}"
    print("[PASS] Health check /health")

    r = client.get("/api/health")
    assert r.status_code == 200, f"/api/health failed: {r.status_code}"
    api_health = r.json()
    assert api_health["status"] == "healthy"
    assert api_health["service"] == "PharmaGuard AI API"
    assert api_health["version"] == "1.0.0"
    print("[PASS] Health check /api/health")

    r = client.get("/api/debug/routes")
    assert r.status_code == 200, f"/api/debug/routes failed: {r.status_code}"
    assert "routes" in r.json()
    print("[PASS] Diagnostic endpoint /api/debug/routes")

    # 2. Registration with full prompt payload (camelCase + confirmPassword + agreeTerms)
    test_id = str(uuid.uuid4())[:8]
    prompt_email = f"prompt_user_{test_id}@example.com"
    prompt_payload = {
        "fullName": "Test User",
        "email": prompt_email,
        "organization": "Test Organization",
        "role": "Research",
        "password": "TestPassword123",
        "confirmPassword": "TestPassword123",
        "agreeTerms": True,
    }
    r_prompt = client.post("/api/auth/register", json=prompt_payload)
    assert r_prompt.status_code == 201, f"Register with prompt payload failed: {r_prompt.status_code} - {r_prompt.text}"
    prompt_data = r_prompt.json()
    assert prompt_data["user"]["full_name"] == "Test User"
    assert prompt_data["user"]["email"] == prompt_email.lower()
    assert prompt_data["user"]["organization"] == "Test Organization"
    assert prompt_data["user"]["role"] == "Research"
    assert "password_hash" not in prompt_data["user"]
    print("[PASS] Registration with prompt payload (camelCase, confirmPassword, agreeTerms)")

    # 3. Registration with snake_case payload
    test_email = f"testuser_{test_id}@pharmaguard.ai"
    test_password = "SecurePassword123"
    
    reg_payload = {
        "full_name": "Dr. Automated Test",
        "email": test_email,
        "organization": "PharmaGuard Global",
        "role": "Pharmacovigilance",
        "password": test_password,
    }
    r = client.post("/api/auth/register", json=reg_payload)
    assert r.status_code == 201, f"Register failed: {r.status_code} - {r.text}"
    data = r.json()
    assert "access_token" in data and data["access_token"], "Missing access_token in register response"
    assert "user" in data, "Missing user object in register response"
    assert data["user"]["email"] == test_email.lower(), "User email mismatch"
    assert "password_hash" not in data["user"], "SECURITY VIOLATION: password_hash exposed in user response!"
    assert "password" not in data["user"], "SECURITY VIOLATION: password exposed in user response!"
    
    # Verify cookie was set
    cookies = r.cookies
    assert "access_token" in cookies or "pharmaguard_access_token" in cookies, "Auth cookie not set in register response"
    print("[PASS] Registration with valid snake_case payload")

    # 4. Duplicate Registration Rejection (HTTP 409)
    r_dup = client.post("/api/auth/register", json=reg_payload)
    assert r_dup.status_code == 409, f"Duplicate register should return 409, got {r_dup.status_code}"
    assert "already exists" in r_dup.json().get("detail", ""), f"Unexpected 409 detail: {r_dup.text}"
    print("[PASS] Duplicate email rejection (HTTP 409)")

    # 5. Weak Password Rejection (HTTP 422)
    weak_payload = {
        "full_name": "Weak User",
        "email": f"weak_{test_id}@pharmaguard.ai",
        "organization": "Testing Corp",
        "role": "Other",
        "password": "weak",  # too short, no uppercase, no number
    }
    r_weak = client.post("/api/auth/register", json=weak_payload)
    assert r_weak.status_code == 422, f"Weak password should return 422, got {r_weak.status_code}"
    print("[PASS] Weak password validation rejection (HTTP 422)")

    # 6. Login with correct credentials
    login_client = TestClient(app)
    login_payload = {
        "email": test_email,
        "password": test_password,
    }
    r_login = login_client.post("/api/auth/login", json=login_payload)
    assert r_login.status_code == 200, f"Login failed: {r_login.status_code} - {r_login.text}"
    login_data = r_login.json()
    assert "access_token" in login_data and login_data["access_token"], "Missing access_token in login response"
    assert "password_hash" not in login_data["user"], "SECURITY VIOLATION: password_hash returned in login response!"
    assert "access_token" in login_client.cookies or "pharmaguard_access_token" in login_client.cookies, "Cookie not set on client"
    print("[PASS] Login with valid credentials (HTTP 200 + cookies)")

    # 7. Login with invalid password
    bad_pwd_client = TestClient(app)
    r_bad_pwd = bad_pwd_client.post("/api/auth/login", json={"email": test_email, "password": "WrongPassword999"})
    assert r_bad_pwd.status_code == 401, f"Expected 401 on wrong password, got {r_bad_pwd.status_code}"
    assert r_bad_pwd.json().get("detail") == "Invalid email or password.", f"Unexpected error detail: {r_bad_pwd.text}"
    print("[PASS] Login with wrong password (HTTP 401 generic error)")

    # 8. Login with non-existent user
    r_no_user = bad_pwd_client.post("/api/auth/login", json={"email": "nonexistent_999@pharmaguard.ai", "password": "AnyPassword123"})
    assert r_no_user.status_code == 401, f"Expected 401 on nonexistent user, got {r_no_user.status_code}"
    assert r_no_user.json().get("detail") == "Invalid email or password.", f"Unexpected error detail: {r_no_user.text}"
    print("[PASS] Login with nonexistent email (HTTP 401 generic error)")

    # 9. Current User session check (GET /api/auth/me) with cookie
    r_me = login_client.get("/api/auth/me")
    assert r_me.status_code == 200, f"/api/auth/me failed: {r_me.status_code} - {r_me.text}"
    me_data = r_me.json()
    assert me_data["email"] == test_email.lower(), "Current user email mismatch"
    assert me_data["full_name"] == "Dr. Automated Test", "Current user name mismatch"
    assert "password_hash" not in me_data, "SECURITY VIOLATION: password_hash returned in /api/auth/me!"
    print("[PASS] Current user session retrieval (GET /api/auth/me)")

    # 10. Unauthenticated /api/auth/me check
    anon_client = TestClient(app)
    r_anon = anon_client.get("/api/auth/me")
    assert r_anon.status_code == 401, f"Unauthenticated /api/auth/me should return 401, got {r_anon.status_code}"
    print("[PASS] Unauthenticated session rejection (HTTP 401)")

    # 11. Logout (POST /api/auth/logout)
    r_logout = login_client.post("/api/auth/logout")
    assert r_logout.status_code == 200, f"Logout failed: {r_logout.status_code} - {r_logout.text}"
    assert r_logout.json().get("message") == "Logged out successfully"
    print("[PASS] Logout endpoint (HTTP 200)")

    # 12. Session check after logout
    r_after_logout = login_client.get("/api/auth/me")
    assert r_after_logout.status_code == 401, f"Session should be invalid after logout, got {r_after_logout.status_code}"
    print("[PASS] Post-logout protected access rejection")

    print("\n=== ALL BACKEND AUTHENTICATION TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_tests()
