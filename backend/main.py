import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv

from backend.database import engine
from backend.migrations.runner import run_migrations
from backend.routes.auth import router as auth_router
from backend.routes.users import router as users_router
from backend.routes.adverse_events import router as ae_router
from backend.routes.signals import router as signals_router
from backend.routes.documents import router as documents_router
from backend.routes.reports import router as reports_router

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pharmaguard.main")


def extract_registered_routes(fastapi_app: FastAPI):
    """Extract full paths and methods for all registered routes, resolving included routers."""
    routes = []
    for r in fastapi_app.routes:
        if type(r).__name__ == "_IncludedRouter":
            prefix = getattr(r.include_context, "prefix", "") if hasattr(r, "include_context") else ""
            if hasattr(r, "original_router") and hasattr(r.original_router, "routes"):
                for sub in r.original_router.routes:
                    sub_path = getattr(sub, "path", "")
                    full_path = f"{prefix}{sub_path}" if prefix else sub_path
                    routes.append({
                        "path": full_path,
                        "name": getattr(sub, "name", None),
                        "methods": sorted(list(getattr(sub, "methods", []))),
                    })
        elif hasattr(r, "path"):
            routes.append({
                "path": r.path,
                "name": getattr(r, "name", None),
                "methods": sorted(list(getattr(r, "methods", []))),
            })
    return routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Log startup banner without secrets
    env_name = os.getenv("ENVIRONMENT", "development")
    db_dialect = engine.url.drivername
    logger.info("==================================================")
    logger.info("PHARMAGUARD BACKEND STARTED")
    logger.info("VERSION=1.0.0")
    logger.info("ENVIRONMENT=%s", env_name)
    logger.info("DATABASE configured: driver=%s", db_dialect)
    logger.info("==================================================")

    # Execute database schema migrations
    logger.info("Running database schema migrations...")
    try:
        run_migrations()
        logger.info("Database schema migrations completed successfully.")
    except Exception as e:
        logger.error(f"FATAL: Database migration failed — {e}", exc_info=True)
        # In production, re-raise so the process exits and Render marks
        # the service as unhealthy instead of silently starting with no tables.
        if env_name.lower() == "production":
            raise RuntimeError(f"Database migration failed: {e}") from e
        logger.warning("Running in non-production mode — continuing despite migration failure.")

    # Log registered routes
    logger.info("REGISTERED ROUTES:")
    for route_info in extract_registered_routes(app):
        methods = route_info.get("methods") or []
        methods_str = ", ".join(methods) if methods else "MOUNT"
        logger.info("  %-12s %s", methods_str, route_info["path"])
    logger.info("==================================================")

    yield


app = FastAPI(
    title="PharmaGuard AI Enterprise API",
    description="Backend API for AI-assisted pharmaceutical safety and regulatory readiness.",
    version="1.0.0",
    lifespan=lifespan,
)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Inject standard production security headers on all HTTP responses."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response


app.add_middleware(SecurityHeadersMiddleware)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
    "https://bob-ai-hackathon-pharmanex.onrender.com",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    for url in frontend_url.split(","):
        cleaned = url.strip().rstrip("/")
        if cleaned and cleaned not in origins:
            origins.append(cleaned)

allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    for url in allowed_origins_env.split(","):
        cleaned = url.strip().rstrip("/")
        if cleaned and cleaned not in origins:
            origins.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api
app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(ae_router, prefix="/api")
app.include_router(signals_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(reports_router, prefix="/api")


@app.get("/", tags=["Health"])
def root_endpoint():
    """Root endpoint confirming the FastAPI backend is running."""
    return {
        "status": "ok",
        "service": "PharmaGuard AI Backend",
        "version": "1.0.0",
        "message": "FastAPI backend is running",
    }


@app.get("/health", tags=["Health"])
@app.get("/health/", tags=["Health"], include_in_schema=False)
def root_health_check():
    """Render Web Service health check endpoint."""
    return {"status": "ok"}


@app.get("/api/health", tags=["Health"])
@app.get("/api/health/", tags=["Health"], include_in_schema=False)
def api_health_check():
    """Detailed API health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "service": "PharmaGuard AI API",
        "version": "1.0.0",
    }


@app.get("/api/debug/routes", tags=["Diagnostic"])
def get_registered_routes():
    """Diagnostic endpoint returning registered routes (paths and HTTP methods). Does not expose secrets."""
    routes = extract_registered_routes(app)
    return {"status": "ok", "service": "PharmaGuard AI Backend", "routes": routes}
