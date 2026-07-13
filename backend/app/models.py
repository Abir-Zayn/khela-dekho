import enum
import uuid
from uuid6 import uuid7
from datetime import UTC, datetime
from enum import unique
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Uuid, Enum, Computed, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import TSVECTOR


from app.database import Base 


class UserRole(str, enum.Enum):
    USER ="user"
    ADMIN = "admin"


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

    # Relationships
    posts: Mapped[list[Post]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid7)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    # Relationships
    posts: Mapped[list[Post]] = relationship(back_populates="category", cascade="all, delete-orphan")


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid7)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    date_posted: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )
    likes: Mapped[int] = mapped_column(Integer, default=0, server_default="0")

    #Embeded-urls
    image_url: Mapped[str | None] =mapped_column(String(500), nullable=True)
    video_url: Mapped[str | None] =mapped_column(String(500), nullable=True)
    reference_url: Mapped[str | None ] =mapped_column(String(500), nullable=True)
    
    #SEARCH OPTIMIZATION
    search_vector: Mapped[str] = mapped_column(
        TSVECTOR,
        Computed("to_tsvector('english', title || ' ' || content)", persisted=True),
        nullable=False,
    )

    # 1. GIN index on the search vector
    __table_args__ = (
        Index("ix_post_search_vector", search_vector, postgresql_using="gin"),
    )
    
    # Relationships
    user: Mapped[User] = relationship(back_populates="posts")
    category: Mapped[Category] = relationship(back_populates="posts")

    @property
    def author(self) -> str:
        # pyrefly: ignore [redundant-condition]
        return self.user.username if self.user else ""