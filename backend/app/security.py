import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from jwt import InvalidTokenError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import models
from app.config import settings
from app.database import get_db

password_hash = PasswordHash.recommended()
# tokenUrl is just where Swagger's "Authorize" button sends the login form
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


def hash_password(plain_password:str)->str:
    """Hash a plain password"""
    return password_hash.hash(plain_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    return password_hash.verify(plain_password, hashed_password)

def _create_token(subject: str, expires:timedelta, token_type:str) -> str:
    payload = {
        "sub": subject,                                  # who (user id, as a string)
        "type": token_type,                              # "access" or "refresh"
        "exp": datetime.now(timezone.utc) + expires,     # when it dies
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_access_token(user_id: uuid.UUID)-> str:
    return _create_token(
        str(user_id),
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "access",
    )

def create_refresh_token(user_id:uuid.UUID)->str:
    return _create_token(
        str(user_id),
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        "refresh",
    )

def decode_token(token:str)-> dict:
    try:
        return jwt.decode(token,settings.SECRET_KEY,algorithms=[settings.ALGORITHM])
    except jwt.InvalidTokenError:
        raise jwt.InvalidTokenError


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db:Annotated[AsyncSession, Depends(get_db)]) -> models.User:

    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token)
        if payload.get("type") != "access":     # refuse refresh tokens here
            raise credentials_error
        sub = payload.get("sub")
        if sub is None:
            raise credentials_error
        user_id = uuid.UUID(sub)
    except (InvalidTokenError, ValueError, KeyError):
        raise credentials_error

    result = await db.execute(select(models.User).where(models.User.id == user_id))
    user = result.scalars().first()
    if user is None:
        raise credentials_error
    return user

def can_modify_post(user:models.User,post: models.Post) -> bool:
     """Post owners and admins (authorities) may edit or delete a post."""
     return post.user_id == user.id or user.role == models.UserRole.ADMIN

def require_role(*allowed_roles: models.UserRole):
    """Dependency factory for role-only routes (e.g. admin-only endpoints)."""
    async def _checker(
        current_user: Annotated[models.User, Depends(get_current_user)],
    )->models.User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user
    return _checker