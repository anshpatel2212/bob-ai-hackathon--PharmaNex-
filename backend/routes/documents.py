from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db_session
from backend.models import User, Document
from backend.dependencies import get_current_user
from pydantic import BaseModel
from datetime import datetime


class DocumentResponse(BaseModel):
    id: str
    user_id: str
    is_demo: bool
    title: str
    filename: str
    file_size: int
    module: str
    section_code: str | None = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


router = APIRouter(prefix="/documents", tags=["CTD Documents"])


@router.get("", response_model=List[DocumentResponse])
def get_user_documents(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """Retrieve CTD documents strictly filtered by the authenticated user."""
    docs = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
        .all()
    )
    return [DocumentResponse.model_validate(d) for d in docs]
