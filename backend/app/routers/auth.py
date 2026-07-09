import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import models
from app.database import get_db
from app.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from jwt.exceptions import InvalidTokenError

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type:str ="bearer"

@router.post("/login",response_model=TokenPair)
async def login(
    form: Annotated[OAuth2PasswordRequestForm,Depends()],
    db:Annotated[AsyncSession,Depends(get_db)]):
    
    result = await db.execute(select(models.User).where(models.User.username == form.username))
    user = result.scalars().first()
    
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return TokenPair(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )

class RefreshRequest(BaseModel):
    refresh_token:str

@router.post("/refresh",response_model=TokenPair)
async def refresh(body:RefreshRequest):
    try:
        payload = decode_token(body.refresh_token)
        if payload.get("type") != "refresh":   # must be a refresh token, not access
            raise ValueError
        user_id = uuid.UUID(payload["sub"])
    except (InvalidTokenError,ValueError,KeyError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return TokenPair(
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
    )