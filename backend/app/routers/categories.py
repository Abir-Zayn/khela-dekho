from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import models
from app.database import get_db
from app.schemas import CategoryCreate, CategoryResponse
from app.security import get_current_user, require_role

router = APIRouter(prefix="/api/categories", tags=["Categories"])


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    current_user: Annotated[models.User, Depends(require_role(models.UserRole.ADMIN))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    # Check if category name already exists
    res_name = await db.execute(
        select(models.Category).where(models.Category.name == category_data.name)
    )
    if res_name.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists",
        )

    # Check if category slug already exists
    res_slug = await db.execute(
        select(models.Category).where(models.Category.slug == category_data.slug)
    )
    if res_slug.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this slug already exists",
        )

    new_category = models.Category(
        name=category_data.name,
        slug=category_data.slug,
    )
    db.add(new_category)
    await db.commit()
    await db.refresh(new_category)
    return new_category


@router.get("", response_model=list[CategoryResponse])
async def get_categories(db: Annotated[AsyncSession, Depends(get_db)]):
    res = await db.execute(select(models.Category).order_by(models.Category.name))
    return res.scalars().all()
