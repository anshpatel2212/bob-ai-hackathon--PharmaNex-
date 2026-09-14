from typing import Generator, Optional
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models import User
from backend.auth import decode_access_token


def get_db() -> Generator[Session, None, None]:
    """Dependency that provides a thread-safe SQLAlchemy database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def extract_token_from_request(request: Request) -> Optional[str]:
    """Extract JWT token from HttpOnly cookie or Authorization Bearer header."""
    # 1. Preferred secure method: HttpOnly cookie
    token = request.cookies.get("access_token")
    if token:
        # Strip potential Bearer prefix if stored with it
        if token.startswith("Bearer "):
            return token[7:]
        return token

    # 2. Fallback: Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:]

    return None


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    """Validate JWT token and return currently authenticated user."""
    token = extract_token_from_request(request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or disabled.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
