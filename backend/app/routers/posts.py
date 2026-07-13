import re
from app.security import can_modify_post
from app.s3 import generate_presigned_upload
from app.schemas import UploadURLRequest
from app.security import get_current_user
from app.schemas import UploadURLResponse
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import uuid
from uuid6 import uuid7
from app import models
from app.database import get_db
from app.schemas import PostCreate, PostResponse, PostUpdate

def normalize_tag(tag_name: str) -> tuple[str, str]:
    # Trim and strip leading '#'
    cleaned = tag_name.strip()
    if cleaned.startswith("#"):
        cleaned = cleaned[1:].strip()
    
    # Generate URL-friendly slug
    slug = cleaned.lower()
    slug = re.sub(r"[\s_]+", "-", slug)
    slug = re.sub(r"[^\w\-]", "", slug)
    slug = re.sub(r"\-+", "-", slug).strip("-")
    
    return cleaned, slug

async def get_or_create_tags(tag_names: list[str], db: AsyncSession) -> list[models.Tag]:
    if not tag_names:
        return []
        
    # Normalize inputs
    normalized_pairs = [normalize_tag(name) for name in tag_names]
    # Filter out empty names/slugs
    valid_pairs = {slug: name for name, slug in normalized_pairs if name and slug}
    
    if not valid_pairs:
        return []
        
    # Query database for existing tags
    stmt = select(models.Tag).where(models.Tag.slug.in_(valid_pairs.keys()))
    res = await db.execute(stmt)
    existing_tags = {tag.slug: tag for tag in res.scalars().all()}
    
    tags = []
    for slug, name in valid_pairs.items():
        if slug in existing_tags:
            tags.append(existing_tags[slug])
        else:
            new_tag = models.Tag(
                id=uuid7(),
                name=name,
                slug=slug
            )
            db.add(new_tag)
            tags.append(new_tag)
            
    if any(tag.id not in [t.id for t in existing_tags.values()] for tag in tags):
        await db.flush()
        
    return tags

router = APIRouter(prefix="/api/posts", tags=["Posts"])


@router.get("", response_model=list[PostResponse])
async def get_posts(
    db: Annotated[AsyncSession, Depends(get_db)],
    q: str | None = None,
    tag: str | None = None,
):
    stmt = select(models.Post).options(
        selectinload(models.Post.user),
        selectinload(models.Post.category),
        selectinload(models.Post.tags),
    )
    if tag:
        stmt = stmt.join(models.Post.tags).where(models.Tag.slug == tag)
    if q:
        # Perform full-text search using websearch_to_tsquery (Google-like syntax)
        # and order the results by relevance (ts_rank)
        tsquery = func.websearch_to_tsquery("english", q)
        stmt = (
            stmt.where(models.Post.search_vector.op("@@")(tsquery))
            .order_by(func.ts_rank(models.Post.search_vector, tsquery).desc())
        )
    results = await db.execute(stmt)
    return results.scalars().all()


@router.get("/{post_id}", response_model=PostResponse)
async def get_posts_by_id(post_id: uuid.UUID, db: Annotated[AsyncSession, Depends(get_db)]):
    res = await db.execute(
        select(models.Post)
        .options(
            selectinload(models.Post.user),
            selectinload(models.Post.category),
            selectinload(models.Post.tags),
        )
        .where(models.Post.id == post_id)
    )
    post = res.scalars().first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post: PostCreate,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    if post.category_id:
        category_res = await db.execute(
            select(models.Category).where(models.Category.id == post.category_id)
        )
        if not category_res.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category not found",
            )

    tag_objects = await get_or_create_tags(post.tags, db)

    new_post = models.Post(
        title=post.title,
        content=post.content,
        user_id=current_user.id,
        image_url=post.image_url,
        video_url=post.video_url,
        reference_url=post.reference_url,
        category_id=post.category_id,
        tags=tag_objects,
    )
    db.add(new_post)
    await db.commit()
    await db.refresh(new_post)

    # Re-fetch post with loaded relationships for response serialization
    res_post = await db.execute(
        select(models.Post)
        .options(
            selectinload(models.Post.user),
            selectinload(models.Post.category),
            selectinload(models.Post.tags),
        )
        .where(models.Post.id == new_post.id)
    )
    return res_post.scalars().first()


@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: uuid.UUID,
    post_data: PostUpdate,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    res = await db.execute(
        select(models.Post)
        .options(
            selectinload(models.Post.user),
            selectinload(models.Post.category),
            selectinload(models.Post.tags),
        )
        .where(models.Post.id == post_id)
    )
    post = res.scalars().first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Only the post owner or admins can update a post
    if not can_modify_post(current_user, post):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this post",
        )
    
    if post_data.title is not None:
        post.title = post_data.title
    if post_data.content is not None:
        post.content = post_data.content
    if post_data.image_url is not None:
        post.image_url = post_data.image_url
    if post_data.video_url is not None:
        post.video_url = post_data.video_url
    if post_data.reference_url is not None:
        post.reference_url = post_data.reference_url
    if post_data.category_id is not None:
        if post_data.category_id:
            category_res = await db.execute(
                select(models.Category).where(models.Category.id == post_data.category_id)
            )
            if not category_res.scalars().first():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Category not found",
                )
        post.category_id = post_data.category_id
    if post_data.tags is not None:
        tag_objects = await get_or_create_tags(post_data.tags, db)
        post.tags = tag_objects
        
    await db.commit()
    await db.refresh(post)

    # Ensure user, category, and tags relationships are loaded
    res_post = await db.execute(
        select(models.Post)
        .options(
            selectinload(models.Post.user),
            selectinload(models.Post.category),
            selectinload(models.Post.tags),
        )
        .where(models.Post.id == post.id)
    )
    return res_post.scalars().first()


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: uuid.UUID,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    res = await db.execute(select(models.Post).where(models.Post.id == post_id))
    post = res.scalars().first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    if not can_modify_post(current_user, post):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this post",
        )

    await db.delete(post)
    await db.commit()
    return None


@router.get("/author/{author}", response_model=list[PostResponse])
async def get_posts_by_author(author: str, db: Annotated[AsyncSession, Depends(get_db)]):
    results = await db.execute(
        select(models.Post)
        .options(
            selectinload(models.Post.user),
            selectinload(models.Post.category),
            selectinload(models.Post.tags),
        )
        .join(models.User)
        .where(models.User.username == author)
    )
    author_posts = results.scalars().all()
    if author_posts:
        return author_posts
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Posts by author not found")


@router.post("/upload-url", response_model=UploadURLResponse)
async def get_upload_url(
    body: UploadURLRequest,
    current_user: Annotated[models.User, Depends(get_current_user)],
):
    try:
        result = generate_presigned_upload(current_user.id, body.content_type)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return result