from app.security import require_role, get_current_user
import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import models
from app.database import get_db
from app.schemas import UserCreate, UserResponse, UserProfileUpdate
from app.security import hash_password
from app.s3 import delete_s3_object, extract_s3_key

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_user(user: UserCreate, db: Annotated[AsyncSession, Depends(get_db)]):
    res_user = await db.execute(
        select(models.User).where(models.User.username == user.username)
    )
    if res_user.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )
    
    res_email = await db.execute(
        select(models.User).where(models.User.email == user.email)
    )
    if res_email.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email Already Exists."
        )
    
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password)
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
 
    return new_user 


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
    return current_user


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