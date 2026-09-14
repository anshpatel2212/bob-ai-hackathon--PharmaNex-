from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from backend.database import get_db_session
from backend.models import User, AdverseEvent
from backend.schemas import AdverseEventCreate, AdverseEventResponse, MessageResponse
from backend.dependencies import get_current_user

router = APIRouter(prefix="/adverse-events", tags=["Adverse Events"])


@router.get("", response_model=List[AdverseEventResponse])
def get_user_adverse_events(
    include_demo: bool = Query(True, description="Whether to include demo records"),
    is_demo_only: bool = Query(False, description="Filter only demo records"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """Retrieve adverse event records strictly owned by the authenticated user."""
    query = db.query(AdverseEvent).filter(AdverseEvent.user_id == current_user.id)
    if is_demo_only:
        query = query.filter(AdverseEvent.is_demo == True)
    elif not include_demo:
        query = query.filter(AdverseEvent.is_demo == False)

    records = query.order_by(AdverseEvent.created_at.desc()).all()
    return [AdverseEventResponse.model_validate(r) for r in records]


@router.post("", response_model=AdverseEventResponse, status_code=status.HTTP_201_CREATED)
def create_adverse_event(
    data: AdverseEventCreate,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """Create a new adverse event record bound to the authenticated user."""
    # Check for duplicate case ID within user's dataset
    existing = db.query(AdverseEvent).filter(
        AdverseEvent.user_id == current_user.id,
        AdverseEvent.case_id == data.case_id.strip()
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Case ID '{data.case_id}' already exists in your dataset.",
        )

    new_record = AdverseEvent(
        user_id=current_user.id,
        is_demo=data.is_demo,
        case_id=data.case_id.strip(),
        patient_id=data.patient_id.strip() if data.patient_id else None,
        product_name=data.product_name.strip(),
        adverse_event=data.adverse_event.strip(),
        event_date=data.event_date,
        report_date=data.report_date,
        seriousness=data.seriousness,
        outcome=data.outcome,
        patient_age=data.patient_age,
        patient_sex=data.patient_sex,
        country=data.country,
        indication=data.indication,
        dose=data.dose,
        reporter_type=data.reporter_type,
        meddra_term=data.meddra_term,
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return AdverseEventResponse.model_validate(new_record)


@router.delete("/demo", response_model=MessageResponse)
def clear_demo_adverse_events(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """Delete ONLY demo records for this user, completely preserving real user data."""
    deleted_count = db.query(AdverseEvent).filter(
        AdverseEvent.user_id == current_user.id,
        AdverseEvent.is_demo == True
    ).delete(synchronize_session=False)
    db.commit()

    return MessageResponse(message=f"Removed {deleted_count} demo record(s). Real data was preserved.")
