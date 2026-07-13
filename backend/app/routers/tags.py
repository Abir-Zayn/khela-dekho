from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import models
from app.database import get_db
from app.schemas import TagResponse

router = APIRouter(prefix="/api/tags", tags=["Tags"])

@router.get("", response_model=list[TagResponse])
async def get_tags(
    db: Annotated[AsyncSession, Depends(get_db)],
    q: str | None = None,
):
    stmt = select(models.Tag).order_by(models.Tag.name)
    if q:
        stmt = stmt.where(
            models.Tag.name.ilike(f"%{q}%") | models.Tag.slug.ilike(f"%{q}%")
        )
    res = await db.execute(stmt)
    return res.scalars().all()
