import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv

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


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Execute database migrations upon startup
    logger.info("Running database schema migrations...")
    try:
        run_migrations()
        logger.info("Database schema migrations completed successfully.")
    except Exception as e:
        logger.error(f"Error executing database migrations: {e}")
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


@app.get("/health", tags=["Health"])
def root_health_check():
    """Render Web Service health check endpoint."""
    return {"status": "ok"}


@app.get("/api/health", tags=["Health"])
def api_health_check():
    """Detailed health check endpoint for monitoring."""
    return {"status": "healthy", "service": "PharmaGuard AI API"}
