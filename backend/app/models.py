import enum
import uuid
from uuid6 import uuid7
from datetime import UTC, datetime
from enum import unique
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Uuid, Enum, Computed, Index, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import TSVECTOR,ARRAY

from app.database import Base 


class UserRole(str, enum.Enum):
    USER ="user"
    ADMIN = "admin"


class ReactionType(str, enum.Enum):
    LAUGH = "laugh"
    LOVE = "love"
    LIKE = "like"


class PostStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"



class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid7)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(100), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        # pyrefly: ignore [no-matching-overload]
        Enum(UserRole, name="user_role", values_callable=lambda e: [m.value for m in e]),
        default=UserRole.USER,
        server_default=UserRole.USER.value,
        nullable=False,
    )

    ##---------Profile Table Fields -----------
    full_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    profile_photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    location: Mapped[str | None] = mapped_column(String(100), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    website_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    twitter_handle: Mapped[str | None] = mapped_column(String(100), nullable=True)
    instagram_handle: Mapped[str | None] = mapped_column(String(100), nullable=True)
    reading_interests: Mapped[list[str] | None] = mapped_column(ARRAY(String(50)), nullable=True)
    hobbies: Mapped[list[str] | None] = mapped_column(ARRAY(String(50)), nullable=True)

    # Relationships
    posts: Mapped[list[Post]] = relationship(back_populates="user", cascade="all, delete-orphan")
    reactions: Mapped[list["Reaction"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid7)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    # Relationships
    posts: Mapped[list[Post]] = relationship(back_populates="category", cascade="all, delete-orphan")


# Junction table for post-tag many-to-many relationship
post_tags = Table(
    "post_tags",
    Base.metadata,
    Column("post_id", Uuid, ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Uuid, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid7)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    # Relationships
    posts: Mapped[list[Post]] = relationship(
        secondary=post_tags,
        back_populates="tags",
    )


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid7)
    # Drafts may be saved title-only, so title is the single always-present field.
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    # Nullable for drafts: content/category may not exist yet while writing.
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    # Draft vs published lifecycle. Public reads must filter to PUBLISHED.
    status: Mapped[PostStatus] = mapped_column(
        # pyrefly: ignore [no-matching-overload]
        Enum(PostStatus, name="post_status", values_callable=lambda e: [m.value for m in e]),
        default=PostStatus.DRAFT,
        server_default=PostStatus.DRAFT.value,
        nullable=False,
        index=True,
    )
    date_posted: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )
    # Bumped on every autosave; used for last-write-wins conflict detection.
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )
    likes: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    love_count: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    laugh_count: Mapped[int] = mapped_column(Integer, default=0, server_default="0")

    #Embeded-urls
    image_url: Mapped[str | None] =mapped_column(String(500), nullable=True)
    video_url: Mapped[str | None] =mapped_column(String(500), nullable=True)
    reference_url: Mapped[str | None ] =mapped_column(String(500), nullable=True)
    
    #SEARCH OPTIMIZATION
    # coalesce so drafts with NULL content don't break the generated column.
    # Drafts are excluded from search at the query level (status filter).
    search_vector: Mapped[str] = mapped_column(
        TSVECTOR,
        Computed(
            "to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))",
            persisted=True,
        ),
        nullable=False,
    )

    # 1. GIN index on the search vector
    __table_args__ = (
        Index("ix_post_search_vector", search_vector, postgresql_using="gin"),
    )
    
    # Relationships
    user: Mapped[User] = relationship(back_populates="posts")
    category: Mapped[Category] = relationship(back_populates="posts")
    tags: Mapped[list[Tag]] = relationship(
        secondary=post_tags,
        back_populates="posts",
    )
    reactions_list: Mapped[list["Reaction"]] = relationship(
        back_populates="post", cascade="all, delete-orphan"
    )

    @property
    def current_user_reaction(self) -> str | None:
        return getattr(self, "_current_user_reaction", None)

    @current_user_reaction.setter
    def current_user_reaction(self, value: str | None) -> None:
        self._current_user_reaction = value

    @property
    def author(self) -> str:
        # pyrefly: ignore [redundant-condition]
        return self.user.username if self.user else ""

    @property
    def reaction_counts(self) -> dict[str, int]:
        return {
            "laugh": self.laugh_count,
            "love": self.love_count,
            "like": self.likes,
        }


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid7)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    token_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    user: Mapped["User"] = relationship()


class Reaction(Base):
    __tablename__ = "reactions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid7)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    post_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reaction_type: Mapped[ReactionType] = mapped_column(
        # pyrefly: ignore [no-matching-overload]
        Enum(ReactionType, name="reaction_type", values_callable=lambda e: [m.value for m in e]),
        nullable=False,
    )

    # Unique constraint on (user_id, post_id)
    __table_args__ = (
        Index("ix_reactions_user_post", "user_id", "post_id", unique=True),
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="reactions")
    post: Mapped["Post"] = relationship(back_populates="reactions_list")