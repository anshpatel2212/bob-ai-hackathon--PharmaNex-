import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()


def get_database_url() -> str:
    """Retrieve database URL from environment, ensuring Render postgres:// prefix is converted."""
    url = os.getenv("DATABASE_URL")
    is_production = os.getenv("ENVIRONMENT", "development").lower() == "production"

    if not url:
        if is_production:
            raise RuntimeError(
                "CRITICAL: DATABASE_URL environment variable is required in production mode. "
                "Ensure your Render PostgreSQL connection string is configured."
            )
        url = "sqlite:///./pharmaguard.db"

    # Strict check: never allow SQLite fallback in production
    if is_production and url.startswith("sqlite"):
        raise RuntimeError(
            "CRITICAL: SQLite is not permitted in production mode. "
            "Please provide a valid PostgreSQL connection string in DATABASE_URL."
        )

    # Render provides PostgreSQL URLs starting with postgres:// which SQLAlchemy 1.4+ rejects
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url


DATABASE_URL = get_database_url()

# Configure engine options based on dialect
connect_args = {}
engine_kwargs = {"pool_pre_ping": True}

if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
else:
    # PostgreSQL pool settings for concurrent Render traffic
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    **engine_kwargs,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db_session():
    """Context or dependency session generator."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
