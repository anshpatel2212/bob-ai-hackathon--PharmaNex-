from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db_session
from backend.models import User, Signal
from backend.dependencies import get_current_user
from pydantic import BaseModel
from datetime import datetime


class SignalResponse(BaseModel):
    id: str
    user_id: str
    is_demo: bool
    drug_name: str
    adverse_event: str
    case_count: int
    ror: float | None = None
    prr: float | None = None
    p_value: float | None = None
    signal_status: str
    created_at: datetime

    model_config = {"from_attributes": True}


router = APIRouter(prefix="/signals", tags=["Signals"])


@router.get("", response_model=List[SignalResponse])
def get_user_signals(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """Retrieve safety signals strictly filtered by the authenticated user."""
    signals = (
        db.query(Signal)
        .filter(Signal.user_id == current_user.id)
        .order_by(Signal.created_at.desc())
        .all()
    )
    return [SignalResponse.model_validate(s) for s in signals]
