from __future__ import annotations

from datetime import UTC, datetime
from enum import unique
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base 

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(100), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    # Relationships
    posts: Mapped[list[Post]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
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
    
    # Relationships
    user: Mapped[User] = relationship(back_populates="posts")

    @property
    def author(self) -> str:
        # pyrefly: ignore [redundant-condition]
        return self.user.username if self.user else ""
    