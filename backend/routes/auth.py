import os
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from backend.database import get_db_session
from backend.models import User
from backend.schemas import (
    UserRegister,
    UserLogin,
    UserResponse,
    TokenResponse,
    MessageResponse,
)
from backend.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from backend.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

IS_PRODUCTION = os.getenv("ENVIRONMENT", "development").lower() == "production"
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "true" if IS_PRODUCTION else "false").lower() == "true"
COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "none" if (IS_PRODUCTION or COOKIE_SECURE) else "lax").lower()


def set_auth_cookie(response: Response, token: str) -> None:
    """Helper to attach secure HttpOnly session cookie."""
    max_age = ACCESS_TOKEN_EXPIRE_MINUTES * 60
    response.set_cookie(
        key="access_token",
        value=token,
        max_age=max_age,
        expires=max_age,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path="/",
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(
    data: UserRegister,
    response: Response,
    db: Session = Depends(get_db_session),
):
    """Register a new user account with hashed password and establish session."""
    normalized_email = data.email.strip().lower()

    # Verify duplicate email
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    # Hash the password with bcrypt (12 rounds)
    hashed_pwd = get_password_hash(data.password)

    new_user = User(
        full_name=data.full_name.strip(),
        email=normalized_email,
        organization=data.organization.strip() if data.organization else None,
        role=data.role.strip() if data.role else "Pharmacovigilance",
        password_hash=hashed_pwd,
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate JWT token
    token = create_access_token(
        user_id=new_user.id,
        email=new_user.email,
        role=new_user.role,
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    # Set secure HttpOnly cookie
    set_auth_cookie(response, token)

    return TokenResponse(
        token_type="bearer",
        access_token=token,
        user=UserResponse.model_validate(new_user),
    )


@router.post("/login", response_model=TokenResponse)
def login(
    data: UserLogin,
    response: Response,
    db: Session = Depends(get_db_session),
):
    """Authenticate user with email and password, returning JWT and HttpOnly cookie."""
    normalized_email = data.email.strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()

    # Constant-time comparison or safe fallback to prevent timing attacks
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact your administrator.",
        )

    # Generate JWT token
    token = create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role,
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    # Set secure HttpOnly cookie
    set_auth_cookie(response, token)

    return TokenResponse(
        token_type="bearer",
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/logout", response_model=MessageResponse)
def logout(response: Response):
    """Clear session cookie and invalidate client-side authentication."""
    response.delete_cookie(
        key="access_token",
        path="/",
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        httponly=True,
    )
    return MessageResponse(message="Logged out successfully.")


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return profile details for the currently authenticated user."""
    return UserResponse.model_validate(current_user)
