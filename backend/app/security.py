import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated
import secrets, hashlib
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
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)


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

def decode_token(token: str) -> dict:
    """
    Decodes a JWT token. First attempts to decode as a Clerk token via JWKS if configured/detected,
    otherwise falls back to standard local HMAC secret decoding.
    """
    try:
        unverified_header = jwt.get_unverified_header(token)
        if "kid" in unverified_header and settings.CLERK_ISSUER_URL:
            jwks_url = f"{settings.CLERK_ISSUER_URL.rstrip('/')}/.well-known/jwks.json"
            jwks_client = jwt.PyJWKClient(jwks_url)
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            return jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256", "ES256", "RS512"],
                options={"verify_aud": False},
            )
    except Exception:
        pass

    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except jwt.InvalidTokenError:
        raise jwt.InvalidTokenError


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)]
) -> models.User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token)
        sub = payload.get("sub")
        if not sub:
            raise credentials_error
    except Exception:
        raise credentials_error

    user: models.User | None = None

    # 1. Try finding by clerk_id
    if sub.startswith("user_"):
        res = await db.execute(select(models.User).where(models.User.clerk_id == sub))
        user = res.scalars().first()

        # Auto-provision user if not found yet (for first request after Clerk login)
        if user is None:
            email = payload.get("email") or payload.get("primary_email_address") or f"{sub}@clerk.user"
            username = payload.get("username") or payload.get("first_name") or f"user_{sub[-6:]}"
            
            # Ensure unique username
            existing_un = await db.execute(select(models.User).where(models.User.username == username))
            if existing_un.scalars().first():
                username = f"{username}_{uuid.uuid4().hex[:4]}"

            user = models.User(
                clerk_id=sub,
                username=username,
                email=email,
                full_name=payload.get("name") or payload.get("full_name"),
                profile_photo_url=payload.get("image_url") or payload.get("picture"),
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

    # 2. Otherwise try finding by standard UUID
    else:
        try:
            user_id = uuid.UUID(sub)
            res = await db.execute(select(models.User).where(models.User.id == user_id))
            user = res.scalars().first()
        except ValueError:
            raise credentials_error

    if user is None:
        raise credentials_error

    return user


async def get_current_user_optional(
    token: Annotated[str | None, Depends(oauth2_scheme_optional)] = None,
    db: Annotated[AsyncSession | None, Depends(get_db)] = None,
) -> models.User | None:
    if not token or db is None:
        return None
    try:
        return await get_current_user(token, db)
    except Exception:
        return None

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

def generate_reset_token() -> tuple[str, str]:
    plaintext = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(plaintext.encode()).hexdigest()
    return plaintext, token_hash

def hash_reset_token(plaintext: str) -> str:
    return hashlib.sha256(plaintext.encode()).hexdigest()