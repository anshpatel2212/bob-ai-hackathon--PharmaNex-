import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()


def get_database_url() -> str:
    """Retrieve database URL from environment, ensuring Render postgres:// prefix is converted."""
    url = os.getenv(
        "DATABASE_URL",
        "postgresql://pharmaguard:pharmaguard_secret@localhost:5432/pharmaguard_db"
    )
    # Render provides PostgreSQL URLs starting with postgres:// which SQLAlchemy 1.4+ rejects
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url


DATABASE_URL = get_database_url()

# Configure engine options based on dialect
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
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
