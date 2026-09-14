from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db_session
from backend.models import User, Report
from backend.dependencies import get_current_user
from pydantic import BaseModel
from datetime import datetime


class ReportResponse(BaseModel):
    id: str
    user_id: str
    is_demo: bool
    title: str
    report_type: str
    status: str
    summary: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("", response_model=List[ReportResponse])
def get_user_reports(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """Retrieve reports strictly filtered by the authenticated user."""
    reports = (
        db.query(Report)
        .filter(Report.user_id == current_user.id)
        .order_by(Report.created_at.desc())
        .all()
    )
    return [ReportResponse.model_validate(r) for r in reports]
