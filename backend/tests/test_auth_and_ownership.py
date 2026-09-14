import os
import sys
import unittest

# Ensure project root is in PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from fastapi.testclient import TestClient
from backend.main import app
from backend.database import SessionLocal, engine
from backend.models import Base, User, AdverseEvent
from backend.migrations.runner import run_migrations


class TestAuthAndOwnership(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Run migrations to setup database schema
        run_migrations()
        cls.client = TestClient(app)

    def setUp(self):
        # Clean up database records between tests
        db = SessionLocal()
        db.query(AdverseEvent).delete()
        db.query(User).delete()
        db.commit()
        db.close()

    def test_01_user_registration_and_password_hashing(self):
        """Verify registration saves user with bcrypt hash, never plaintext."""
        payload = {
            "full_name": "Ansh Patel",
            "email": "ansh@example.com",
            "organization": "PharmaNex",
            "role": "Research",
            "password": "SecurePassword123"
        }
        res = self.client.post("/api/auth/register", json=payload)
        self.assertEqual(res.status_code, 201, res.text)
        data = res.json()
        self.assertIn("user", data)
        self.assertEqual(data["user"]["email"], "ansh@example.com")
        self.assertEqual(data["user"]["full_name"], "Ansh Patel")
        self.assertNotIn("password", data["user"])
        self.assertNotIn("password_hash", data["user"])

        # Check database record directly
        db = SessionLocal()
        user_in_db = db.query(User).filter(User.email == "ansh@example.com").first()
        self.assertIsNotNone(user_in_db)
        self.assertNotEqual(user_in_db.password_hash, "SecurePassword123")
        self.assertTrue(user_in_db.password_hash.startswith("$2b$") or user_in_db.password_hash.startswith("$2a$"))
        self.assertTrue(user_in_db.is_active)
        db.close()

        # Check HttpOnly cookie is set
        self.assertIn("access_token", res.cookies)

    def test_02_duplicate_email_rejected(self):
        """Verify duplicate email returns safe 400 error without internal leak."""
        payload = {
            "full_name": "Ansh Patel",
            "email": "duplicate@example.com",
            "organization": "PharmaNex",
            "role": "Research",
            "password": "SecurePassword123"
        }
        res1 = self.client.post("/api/auth/register", json=payload)
        self.assertEqual(res1.status_code, 201)

        # Attempt registering same email again
        res2 = self.client.post("/api/auth/register", json=payload)
        self.assertEqual(res2.status_code, 400)
        self.assertEqual(res2.json()["detail"], "An account with this email already exists.")

    def test_03_login_workflow_and_session(self):
        """Verify login with correct and incorrect credentials."""
        # 1. Register user
        reg_payload = {
            "full_name": "Demo User",
            "email": "demo@example.com",
            "organization": "PharmaNex",
            "role": "Research",
            "password": "SecurePassword123"
        }
        self.client.post("/api/auth/register", json=reg_payload)

        # 2. Login with wrong password -> 401
        bad_login = self.client.post("/api/auth/login", json={
            "email": "demo@example.com",
            "password": "WrongPassword999"
        })
        self.assertEqual(bad_login.status_code, 401)
        self.assertEqual(bad_login.json()["detail"], "Invalid email or password.")

        # 3. Login with correct password -> 200 & cookie
        good_login = self.client.post("/api/auth/login", json={
            "email": "demo@example.com",
            "password": "SecurePassword123"
        })
        self.assertEqual(good_login.status_code, 200)
        self.assertIn("access_token", good_login.cookies)

        # 4. Access protected /api/auth/me using session cookie
        me_res = self.client.get("/api/auth/me", cookies=good_login.cookies)
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.json()["email"], "demo@example.com")
        self.assertEqual(me_res.json()["role"], "Research")

        # 5. Logout
        logout_res = self.client.post("/api/auth/logout")
        self.assertEqual(logout_res.status_code, 200)

    def test_04_user_data_ownership_and_demo_isolation(self):
        """Verify User A cannot access User B's data, and clear demo preserves real data."""
        # Register User A
        res_a = self.client.post("/api/auth/register", json={
            "full_name": "User A",
            "email": "usera@example.com",
            "organization": "Company A",
            "role": "Pharmacovigilance",
            "password": "SecurePassword123"
        })
        cookies_a = res_a.cookies

        # Register User B
        res_b = self.client.post("/api/auth/register", json={
            "full_name": "User B",
            "email": "userb@example.com",
            "organization": "Company B",
            "role": "Regulatory Affairs",
            "password": "SecurePassword123"
        })
        cookies_b = res_b.cookies

        # User A creates a real adverse event
        ae_real = self.client.post("/api/adverse-events", json={
            "case_id": "CASE-REAL-001",
            "product_name": "RealDrug-X",
            "adverse_event": "Cardiac arrest",
            "seriousness": "Serious",
            "is_demo": False
        }, cookies=cookies_a)
        self.assertEqual(ae_real.status_code, 201)

        # User A creates a demo adverse event
        ae_demo = self.client.post("/api/adverse-events", json={
            "case_id": "CASE-DEMO-001",
            "patient_id": "DEMO-001",
            "product_name": "DemoDrug-100",
            "adverse_event": "Headache",
            "seriousness": "Non-serious",
            "is_demo": True
        }, cookies=cookies_a)
        self.assertEqual(ae_demo.status_code, 201)

        # User B fetches adverse events -> MUST BE EMPTY (Strict data isolation!)
        b_list = self.client.get("/api/adverse-events", cookies=cookies_b)
        self.assertEqual(b_list.status_code, 200)
        self.assertEqual(len(b_list.json()), 0, "User B should NOT see User A's adverse events")

        # User A fetches adverse events -> Has 2 records
        a_list = self.client.get("/api/adverse-events", cookies=cookies_a)
        self.assertEqual(len(a_list.json()), 2)

        # User A clears demo records
        clear_res = self.client.delete("/api/adverse-events/demo", cookies=cookies_a)
        self.assertEqual(clear_res.status_code, 200)

        # User A fetches adverse events again -> Real record preserved, demo record deleted
        a_after = self.client.get("/api/adverse-events", cookies=cookies_a)
        self.assertEqual(len(a_after.json()), 1)
        self.assertEqual(a_after.json()[0]["case_id"], "CASE-REAL-001")
        self.assertFalse(a_after.json()[0]["is_demo"])


if __name__ == "__main__":
    unittest.main()
