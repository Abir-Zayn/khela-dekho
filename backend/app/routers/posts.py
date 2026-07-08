from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app import models
from app.database import get_db
from app.schemas import PostCreate, PostResponse, PostUpdate

router = APIRouter(prefix="/api/posts", tags=["Posts"])


@router.get("", response_model=list[PostResponse])
async def get_posts(db: Annotated[AsyncSession, Depends(get_db)]):
    results = await db.execute(
        select(models.Post).options(selectinload(models.Post.user))
    )
    return results.scalars().all()


@router.get("/{post_id}", response_model=PostResponse)
async def get_posts_by_id(post_id: int, db: Annotated[AsyncSession, Depends(get_db)]):
    res = await db.execute(
        select(models.Post)
        .options(selectinload(models.Post.user))
        .where(models.Post.id == post_id)
    )
    post = res.scalars().first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(post: PostCreate, db: Annotated[AsyncSession, Depends(get_db)]):
    # Verify that the user (author) exists
    res_user = await db.execute(
        select(models.User).where(models.User.id == post.user_id)
    )
    user = res_user.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User (author) not found"
        )
    
    new_post = models.Post(
        title=post.title,
        content=post.content,
        user_id=post.user_id
    )
    db.add(new_post)
    await db.commit()
    await db.refresh(new_post)

    # Re-fetch post with loaded user relationship for response serialization
    res_post = await db.execute(
        select(models.Post)
        .options(selectinload(models.Post.user))
        .where(models.Post.id == new_post.id)
    )
    return res_post.scalars().first()


@router.put("/{post_id}", response_model=PostResponse)
async def update_post(post_id: int, post_data: PostUpdate, db: Annotated[AsyncSession, Depends(get_db)]):
    res = await db.execute(
        select(models.Post)
        .options(selectinload(models.Post.user))
        .where(models.Post.id == post_id)
    )
    post = res.scalars().first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    if post_data.title is not None:
        post.title = post_data.title
    if post_data.content is not None:
        post.content = post_data.content
        
    await db.commit()
    await db.refresh(post)

    # Ensure user relationship is loaded
    res_post = await db.execute(
        select(models.Post)
        .options(selectinload(models.Post.user))
        .where(models.Post.id == post.id)
    )
    return res_post.scalars().first()


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: int, db: Annotated[AsyncSession, Depends(get_db)]):
    res = await db.execute(
        select(models.Post).where(models.Post.id == post_id)
    )
    post = res.scalars().first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    await db.delete(post)
    await db.commit()
    return None


@router.get("/author/{author}", response_model=list[PostResponse])
async def get_posts_by_author(author: str, db: Annotated[AsyncSession, Depends(get_db)]):
    results = await db.execute(
        select(models.Post)
        .options(selectinload(models.Post.user))
        .join(models.User)
        .where(models.User.username == author)
    )
    author_posts = results.scalars().all()
    if author_posts:
        return author_posts
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Posts by author not found")
