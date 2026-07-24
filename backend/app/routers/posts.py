import re
from datetime import UTC, datetime
from typing import Annotated
import uuid
from uuid6 import uuid7
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app import models
from app.database import get_db
from app.s3 import generate_presigned_upload
from app.schemas import (
    DraftAck,
    DraftResponse,
    DraftUpsert,
    PostCreate,
    PostResponse,
    PostUpdate,
    UploadURLRequest,
    UploadURLResponse,
    ReactionCreate,
)
from app.security import can_modify_post, get_current_user, get_current_user_optional

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
    current_user: Annotated[models.User | None, Depends(get_current_user_optional)],
    q: str | None = None,
    tag: str | None = None,
):
    stmt = select(models.Post).options(
        selectinload(models.Post.user),
        selectinload(models.Post.category),
        selectinload(models.Post.tags),
    ).where(models.Post.status == models.PostStatus.PUBLISHED)
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
    posts = results.scalars().all()

    if current_user:
        post_ids = [p.id for p in posts]
        if post_ids:
            reactions_stmt = select(models.Reaction).where(
                models.Reaction.post_id.in_(post_ids),
                models.Reaction.user_id == current_user.id
            )
            reactions_res = await db.execute(reactions_stmt)
            user_reactions = {r.post_id: r.reaction_type for r in reactions_res.scalars().all()}
            for p in posts:
                p.current_user_reaction = user_reactions.get(p.id)
        else:
            for p in posts:
                p.current_user_reaction = None
    else:
        for p in posts:
            p.current_user_reaction = None

    return posts


@router.post("/drafts", response_model=DraftAck, status_code=status.HTTP_201_CREATED)
async def create_draft(
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Create an empty draft and return its id. The client saves into it as the
    user types. Title starts as an empty-ish placeholder because title is NOT NULL;
    it is replaced on the first autosave."""
    draft = models.Post(
        title="Untitled draft",
        content=None,
        user_id=current_user.id,
        category_id=None,
        status=models.PostStatus.DRAFT,
    )
    db.add(draft)
    await db.commit()
    await db.refresh(draft)
    return draft


@router.get("/drafts", response_model=list[DraftResponse])
async def list_drafts(
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """List the current user's drafts, newest first, for a resume UI."""
    res = await db.execute(
        select(models.Post)
        .options(selectinload(models.Post.tags))
        .where(
            models.Post.user_id == current_user.id,
            models.Post.status == models.PostStatus.DRAFT,
        )
        .order_by(models.Post.updated_at.desc())
    )
    return res.scalars().all()


@router.put("/{post_id}/draft", response_model=DraftAck)
async def save_draft(
    post_id: uuid.UUID,
    payload: DraftUpsert,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Autosave target. Permissive: updates only provided fields, no publish-level
    validation. Returns a light ack to keep saves fast."""
    res = await db.execute(
        select(models.Post)
        .options(selectinload(models.Post.tags))
        .where(models.Post.id == post_id)
    )
    post = res.scalars().first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Draft not found")
    if not can_modify_post(current_user, post):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to edit this draft",
        )
    if post.status == models.PostStatus.PUBLISHED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This post is already published; use the update endpoint instead",
        )

    # Last-write-wins conflict detection: if the server copy was touched after the
    # client's known version, the draft was edited elsewhere (another device/tab).
    if payload.client_updated_at is not None:
        server_ts = post.updated_at
        if server_ts.tzinfo is None:
            server_ts = server_ts.replace(tzinfo=UTC)
        if payload.client_updated_at < server_ts:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Draft was modified elsewhere. Reload to get the latest version.",
            )

    data = payload.model_dump(exclude_unset=True, exclude={"client_updated_at"})
    if "title" in data:
        # title is NOT NULL and the column is String(100); fall back to a
        # placeholder if cleared, and truncate rather than reject an overflow so
        # autosave never fails. The 10-100 rule is enforced at publish time.
        post.title = ((data["title"] or "").strip() or "Untitled draft")[:100]
    if "content" in data:
        post.content = data["content"]
    if "image_url" in data:
        post.image_url = data["image_url"]
    if "video_url" in data:
        post.video_url = data["video_url"]
    if "reference_url" in data:
        post.reference_url = data["reference_url"]
    if "category_id" in data:
        post.category_id = data["category_id"]
    if "tags" in data and data["tags"] is not None:
        post.tags = await get_or_create_tags(data["tags"], db)

    await db.commit()
    await db.refresh(post)
    return post


@router.post("/{post_id}/publish", response_model=PostResponse)
async def publish_draft(
    post_id: uuid.UUID,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Promote a draft to published. Applies strict validation here (not on autosave):
    title 10-100 chars, content >= 65 chars, category required."""
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Draft not found")
    if not can_modify_post(current_user, post):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to publish this draft",
        )

    # Strict publish gate.
    errors: list[str] = []
    title = (post.title or "").strip()
    if not (10 <= len(title) <= 100):
        errors.append("Title must be between 10 and 100 characters")
    if not post.content or len(post.content) < 65:
        errors.append("Content must be at least 65 characters")
    if post.category_id is None:
        errors.append("A category is required to publish")
    else:
        cat_res = await db.execute(
            select(models.Category).where(models.Category.id == post.category_id)
        )
        if not cat_res.scalars().first():
            errors.append("Category not found")
    if errors:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="; ".join(errors),
        )

    post.status = models.PostStatus.PUBLISHED
    post.date_posted = datetime.now(UTC)
    await db.commit()
    await db.refresh(post)

    res_post = await db.execute(
        select(models.Post)
        .options(
            selectinload(models.Post.user),
            selectinload(models.Post.category),
            selectinload(models.Post.tags),
        )
        .where(models.Post.id == post.id)
    )
    published = res_post.scalars().first()
    if published:
        published.current_user_reaction = None
    return published


@router.get("/{post_id}", response_model=PostResponse)
async def get_posts_by_id(
    post_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[models.User | None, Depends(get_current_user_optional)],
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    # Drafts are private: only the owner (or an admin) may read an unpublished post.
    if post.status != models.PostStatus.PUBLISHED and not (
        current_user and can_modify_post(current_user, post)
    ):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    if current_user:
        reaction_res = await db.execute(
            select(models.Reaction).where(
                models.Reaction.post_id == post.id,
                models.Reaction.user_id == current_user.id
            )
        )
        reaction = reaction_res.scalars().first()
        post.current_user_reaction = reaction.reaction_type if reaction else None
    else:
        post.current_user_reaction = None

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
        # Legacy direct-create path publishes immediately (default is DRAFT).
        status=models.PostStatus.PUBLISHED,
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
    db_post = res_post.scalars().first()
    if db_post:
        db_post.current_user_reaction = None
    return db_post


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
    updated_post = res_post.scalars().first()
    if updated_post:
        reaction_res = await db.execute(
            select(models.Reaction).where(
                models.Reaction.post_id == updated_post.id,
                models.Reaction.user_id == current_user.id
            )
        )
        reaction = reaction_res.scalars().first()
        updated_post.current_user_reaction = reaction.reaction_type if reaction else None
    return updated_post


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
async def get_posts_by_author(
    author: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[models.User | None, Depends(get_current_user_optional)],
):
    results = await db.execute(
        select(models.Post)
        .options(
            selectinload(models.Post.user),
            selectinload(models.Post.category),
            selectinload(models.Post.tags),
        )
        .join(models.User)
        .where(
            models.User.username == author,
            models.Post.status == models.PostStatus.PUBLISHED,
        )
    )
    author_posts = results.scalars().all()
    if not author_posts:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Posts by author not found")

    if current_user:
        post_ids = [p.id for p in author_posts]
        if post_ids:
            reactions_stmt = select(models.Reaction).where(
                models.Reaction.post_id.in_(post_ids),
                models.Reaction.user_id == current_user.id
            )
            reactions_res = await db.execute(reactions_stmt)
            user_reactions = {r.post_id: r.reaction_type for r in reactions_res.scalars().all()}
            for p in author_posts:
                p.current_user_reaction = user_reactions.get(p.id)
        else:
            for p in author_posts:
                p.current_user_reaction = None
    else:
        for p in author_posts:
            p.current_user_reaction = None

    return author_posts


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


@router.post("/{post_id}/react", response_model=PostResponse)
async def react_to_post(
    post_id: uuid.UUID,
    payload: ReactionCreate,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    # Retrieve and lock post
    post_stmt = (
        select(models.Post)
        .options(
            selectinload(models.Post.user),
            selectinload(models.Post.category),
            selectinload(models.Post.tags),
        )
        .where(models.Post.id == post_id)
        .with_for_update()
    )
    post_res = await db.execute(post_stmt)
    post = post_res.scalars().first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    # Retrieve and lock existing reaction
    reaction_stmt = select(models.Reaction).where(
        models.Reaction.post_id == post_id,
        models.Reaction.user_id == current_user.id
    ).with_for_update()
    reaction_res = await db.execute(reaction_stmt)
    existing_reaction = reaction_res.scalars().first()

    new_type = payload.reaction_type

    if not existing_reaction:
        # Create reaction
        new_reaction = models.Reaction(
            id=uuid7(),
            user_id=current_user.id,
            post_id=post_id,
            reaction_type=new_type,
        )
        db.add(new_reaction)
        # Increment counter
        if new_type == models.ReactionType.LIKE:
            post.likes += 1
        elif new_type == models.ReactionType.LOVE:
            post.love_count += 1
        elif new_type == models.ReactionType.LAUGH:
            post.laugh_count += 1
    else:
        old_type = existing_reaction.reaction_type
        if old_type != new_type:
            # Decrement old counter
            if old_type == models.ReactionType.LIKE:
                post.likes = max(0, post.likes - 1)
            elif old_type == models.ReactionType.LOVE:
                post.love_count = max(0, post.love_count - 1)
            elif old_type == models.ReactionType.LAUGH:
                post.laugh_count = max(0, post.laugh_count - 1)

            # Increment new counter
            if new_type == models.ReactionType.LIKE:
                post.likes += 1
            elif new_type == models.ReactionType.LOVE:
                post.love_count += 1
            elif new_type == models.ReactionType.LAUGH:
                post.laugh_count += 1

            # Update reaction type
            existing_reaction.reaction_type = new_type

    await db.commit()

    post.current_user_reaction = new_type
    return post


@router.delete("/{post_id}/react", response_model=PostResponse)
async def remove_reaction_from_post(
    post_id: uuid.UUID,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    # Retrieve and lock post
    post_stmt = (
        select(models.Post)
        .options(
            selectinload(models.Post.user),
            selectinload(models.Post.category),
            selectinload(models.Post.tags),
        )
        .where(models.Post.id == post_id)
        .with_for_update()
    )
    post_res = await db.execute(post_stmt)
    post = post_res.scalars().first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    # Retrieve and lock existing reaction
    reaction_stmt = select(models.Reaction).where(
        models.Reaction.post_id == post_id,
        models.Reaction.user_id == current_user.id
    ).with_for_update()
    reaction_res = await db.execute(reaction_stmt)
    existing_reaction = reaction_res.scalars().first()

    if existing_reaction:
        old_type = existing_reaction.reaction_type
        # Decrement counter
        if old_type == models.ReactionType.LIKE:
            post.likes = max(0, post.likes - 1)
        elif old_type == models.ReactionType.LOVE:
            post.love_count = max(0, post.love_count - 1)
        elif old_type == models.ReactionType.LAUGH:
            post.laugh_count = max(0, post.laugh_count - 1)

        # Delete reaction
        await db.delete(existing_reaction)
        await db.commit()

    post.current_user_reaction = None
    return post