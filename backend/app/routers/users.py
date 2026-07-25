from app.security import require_role, get_current_user
import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import models
from app.database import get_db
from app.schemas import UserResponse, UserProfileUpdate, UploadURLRequest, UploadURLResponse
from app.s3 import delete_s3_object, extract_s3_key, generate_presigned_upload
from app.clerk_sync import sync_clerk_username, sync_clerk_profile_image

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: Annotated[models.User, Depends(get_current_user)],
):
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_my_profile(
    profile_data: UserProfileUpdate,
    background_tasks: BackgroundTasks,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[models.User, Depends(get_current_user)],
):
    update_data = profile_data.model_dump(exclude_unset=True)

    # Enforce unique username (case excluded: exact match against other accounts)
    if "username" in update_data and update_data["username"] != current_user.username:
        new_username = update_data["username"]
        existing = await db.execute(
            select(models.User).where(
                models.User.username == new_username,
                models.User.id != current_user.id,
            )
        )
        if existing.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Username '{new_username}' is already in use by another account.",
            )

    # Handle old profile photo deletion if a new photo is set
    if "profile_photo_url" in update_data and current_user.profile_photo_url:
        old_photo_url = current_user.profile_photo_url
        new_photo_url = update_data["profile_photo_url"]
        if old_photo_url != new_photo_url:
            old_key = extract_s3_key(old_photo_url)
            if old_key:
                background_tasks.add_task(delete_s3_object, old_key)

    for key, value in update_data.items():
        setattr(current_user, key, value)

    await db.commit()
    await db.refresh(current_user)

    # Keep Clerk's own user record in sync so session tokens match local data.
    if current_user.clerk_id:
        if "username" in update_data:
            background_tasks.add_task(sync_clerk_username, current_user.clerk_id, update_data["username"])
        if "profile_photo_url" in update_data:
            background_tasks.add_task(sync_clerk_profile_image, current_user.clerk_id, update_data["profile_photo_url"])

    return current_user


@router.post("/upload-url", response_model=UploadURLResponse)
async def get_avatar_upload_url(
    body: UploadURLRequest,
    current_user: Annotated[models.User, Depends(get_current_user)],
):
    try:
        result = generate_presigned_upload(current_user.id, body.content_type)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return result


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: uuid.UUID, db: Annotated[AsyncSession, Depends(get_db)]):
    res = await db.execute(
        select(models.User).where(models.User.id == user_id)
    )
    user = res.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.patch("/{user_id}/role",response_model=UserResponse)
async def set_user_role(
    user_id: uuid.UUID,
    new_role: models.UserRole,
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[models.User, Depends(require_role(models.UserRole.ADMIN))],
):
    res = await db.execute(select(models.User).where(models.User.id == user_id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.role = new_role
    await db.commit()
    await db.refresh(user)
    return user