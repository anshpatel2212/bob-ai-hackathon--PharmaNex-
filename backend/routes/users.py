from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db_session
from backend.models import User
from backend.schemas import UserResponse
from backend.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieve full profile information for authenticated user."""
    return UserResponse.model_validate(current_user)
