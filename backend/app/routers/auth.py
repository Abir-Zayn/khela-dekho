from app.email import send_reset_email
from app.config import settings
from app.security import generate_reset_token, hash_reset_token, hash_password
from datetime import UTC,datetime, timedelta
from sqlalchemy import update
import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import models
from app.database import get_db
from app.schemas import UserCreate, UserResponse
from app.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
)
from jwt.exceptions import InvalidTokenError



router = APIRouter(prefix="/api/auth", tags=["Auth"])

class ForgetPasswordRequest(BaseModel):
    email:EmailStr 

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type:str ="bearer"

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
    description=(
        "Create a new user account with a **username**, **email**, and **password**. "
        "Both username and email must be unique. The password is hashed before storage. "
        "After registering, call `/api/auth/login` with the same email and password to "
        "obtain access and refresh tokens."
    ),
)
async def register(
    body: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    res_user = await db.execute(
        select(models.User).where(models.User.username == body.username)
    )
    if res_user.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )

    res_email = await db.execute(
        select(models.User).where(models.User.email == body.email)
    )
    if res_email.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email Already Exists.",
        )

    new_user = models.User(
        username=body.username,
        email=body.email,
        hashed_password=hash_password(body.password),
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user

@router.post(
    "/login",
    response_model=TokenPair,
    summary="Login with email and password",
    description=(
        "Authenticate a registered user with their **email** and **password**. "
        "On success, returns a JWT **access token** and **refresh token** pair. "
        "Send the access token as a `Bearer` token in the `Authorization` header "
        "to reach protected endpoints; use the refresh token at `/api/auth/refresh` "
        "to obtain a new pair without re-entering credentials."
    ),
)
async def login(
    body: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(models.User).where(models.User.email == body.email))
    user = result.scalars().first()

    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
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

@router.post("/forget-password", status_code=status.HTTP_202_ACCEPTED)
async def forget_password(
    body:ForgetPasswordRequest,
    db:Annotated[AsyncSession,Depends(get_db)]
):
    result = await db.execute(select(models.User).where(models.User.email == body.email))
    user = result.scalars().first()

    if user :
        await db.execute(
            update(models.PasswordResetToken)
            .where(
                models.PasswordResetToken.user_id == user.id,
                models.PasswordResetToken.used_at.is_(None),
            ).values(used_at=datetime.now(UTC))
        )

        plaintext, token_hash = generate_reset_token()
        db.add(
            models.PasswordResetToken(
                user_id=user.id,
                token_hash=token_hash,
                expires_at=datetime.now(UTC) + timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES),
            )
        )
        await db.commit()

        send_reset_email(user.email, plaintext)
        return {"message": "If that email matches an account, a reset link has been sent."}

@router.post("/reset-password")
async def reset_password(
    body: ResetPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    token_hash = hash_reset_token(body.token)
    result = await db.execute(
        select(models.PasswordResetToken).where(models.PasswordResetToken.token_hash == token_hash)
    )
    reset_row = result.scalars().first()

    invalid = HTTPException(status_code=400, detail="Invalid or expired reset link")

    if not reset_row or reset_row.used_at is not None or reset_row.expires_at < datetime.now(UTC):
        raise invalid

    user_result = await db.execute(select(models.User).where(models.User.id == reset_row.user_id))
    user = user_result.scalars().first()
    if not user:
        raise invalid

    user.hashed_password = hash_password(body.new_password)
    reset_row.used_at = datetime.now(UTC)
    await db.commit()
    return {"message": "Password has been reset successfully."}


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Logout user",
    description="Logout the user by clearing or invalidating their session/cookies. Since JWT is stateless, the client should discard the tokens."
)
async def logout(
    current_user: Annotated[models.User, Depends(get_current_user)]
):
    return {"message": "Logged out successfully"}
   

