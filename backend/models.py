import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Float,
    Text,
)
from sqlalchemy.orm import relationship
from backend.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    organization = Column(String(200), nullable=True)
    role = Column(String(100), nullable=False, default="Pharmacovigilance")
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    # Relationships to user-owned data
    adverse_events = relationship("AdverseEvent", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    signals = relationship("Signal", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")


class AdverseEvent(Base):
    __tablename__ = "adverse_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    is_demo = Column(Boolean, default=False, nullable=False, index=True)

    case_id = Column(String(100), nullable=False, index=True)
    patient_id = Column(String(100), nullable=True)
    product_name = Column(String(200), nullable=False)
    adverse_event = Column(String(255), nullable=False)
    event_date = Column(String(50), nullable=True)
    report_date = Column(String(50), nullable=True)
    seriousness = Column(String(50), nullable=False, default="Non-serious")
    outcome = Column(String(100), nullable=True)
    patient_age = Column(Integer, nullable=True)
    patient_sex = Column(String(20), nullable=True)
    country = Column(String(100), nullable=True)
    indication = Column(String(200), nullable=True)
    dose = Column(String(100), nullable=True)
    reporter_type = Column(String(100), nullable=True)
    meddra_term = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="adverse_events")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    is_demo = Column(Boolean, default=False, nullable=False, index=True)

    title = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=False)
    file_size = Column(Integer, default=0, nullable=False)
    module = Column(String(50), nullable=False, default="Module 1")
    section_code = Column(String(50), nullable=True)
    status = Column(String(50), nullable=False, default="Uploaded")
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="documents")


class Signal(Base):
    __tablename__ = "signals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    is_demo = Column(Boolean, default=False, nullable=False, index=True)

    drug_name = Column(String(200), nullable=False)
    adverse_event = Column(String(255), nullable=False)
    case_count = Column(Integer, default=1, nullable=False)
    ror = Column(Float, nullable=True)
    prr = Column(Float, nullable=True)
    p_value = Column(Float, nullable=True)
    signal_status = Column(String(50), nullable=False, default="Under Evaluation")
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="signals")


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    is_demo = Column(Boolean, default=False, nullable=False, index=True)

    title = Column(String(255), nullable=False)
    report_type = Column(String(100), nullable=False, default="Clinical Safety Evaluation")
    status = Column(String(50), nullable=False, default="Draft")
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="reports")
