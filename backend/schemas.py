from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    organization: Optional[str] = Field(default=None, max_length=200)
    role: str = Field(default="Pharmacovigilance", max_length=100)
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number.")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    organization: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    token_type: str = "bearer"
    access_token: Optional[str] = None
    user: UserResponse


class MessageResponse(BaseModel):
    message: str


# Adverse Event Schemas
class AdverseEventCreate(BaseModel):
    case_id: str = Field(..., min_length=1, max_length=100)
    patient_id: Optional[str] = None
    product_name: str = Field(..., min_length=1, max_length=200)
    adverse_event: str = Field(..., min_length=1, max_length=255)
    event_date: Optional[str] = None
    report_date: Optional[str] = None
    seriousness: str = "Non-serious"
    outcome: Optional[str] = None
    patient_age: Optional[int] = None
    patient_sex: Optional[str] = None
    country: Optional[str] = None
    indication: Optional[str] = None
    dose: Optional[str] = None
    reporter_type: Optional[str] = None
    meddra_term: Optional[str] = None
    is_demo: bool = False


class AdverseEventResponse(BaseModel):
    id: str
    user_id: str
    is_demo: bool
    case_id: str
    patient_id: Optional[str] = None
    product_name: str
    adverse_event: str
    event_date: Optional[str] = None
    report_date: Optional[str] = None
    seriousness: str
    outcome: Optional[str] = None
    patient_age: Optional[int] = None
    patient_sex: Optional[str] = None
    country: Optional[str] = None
    indication: Optional[str] = None
    dose: Optional[str] = None
    reporter_type: Optional[str] = None
    meddra_term: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
