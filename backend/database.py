import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# Retrieve database URL from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://pharmaguard:pharmaguard_secret@localhost:5432/pharmaguard_db"
)

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
