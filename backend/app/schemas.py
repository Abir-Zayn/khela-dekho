from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, EmailStr
from app.models import UserRole, ReactionType, PostStatus
import uuid


#-------- User Base --------------
class UserBase(BaseModel):
    username: str = Field(min_length=1, max_length=50)
    email: EmailStr = Field(max_length=120)


class UserCreate(UserBase):
    password: str = Field(min_length=8)

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    role: UserRole
    full_name: str | None = None
    profile_photo_url: str | None = None
    location: str | None = None
    bio: str | None = None
    website_url: str | None = None
    twitter_handle: str | None = None
    instagram_handle: str | None = None
    reading_interests: list[str] | None = None
    hobbies: list[str] | None = None

class UserProfileUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=2, max_length=100)
    profile_photo_url: str | None = Field(None, max_length=500)
    location: str | None = Field(None, max_length=100)
    bio: str | None = Field(None, min_length=1, max_length=1000)
    website_url: str | None = Field(None, max_length=500)
    twitter_handle: str | None = Field(None, max_length=100)
    instagram_handle: str | None = Field(None, max_length=100)
    reading_interests: list[str] | None = Field(None, max_length=100)
    hobbies: list[str] | None = Field(None, max_length=100)
   


#-------- Category Schema ----------
class CategoryBase(BaseModel):
    name: str = Field(min_length=1, max_length=50, description="The display name of the category (e.g. Cricket)")
    slug: str = Field(min_length=1, max_length=50, description="The URL-friendly slug of the category (e.g. cricket)")

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID


#-------- Tag Schema ----------
class TagBase(BaseModel):
    name: str = Field(min_length=1, max_length=50, description="The display name of the tag (e.g. Jade Bellingham)")
    slug: str = Field(min_length=1, max_length=50, description="The URL-friendly slug of the tag (e.g. jade-bellingham)")

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID


#-------- Reaction Schema ----------
class ReactionCounts(BaseModel):
    laugh: int = 0
    love: int = 0
    like: int = 0

class ReactionCreate(BaseModel):
    reaction_type: ReactionType


#-------- POST Schema ----------

# 1. Base Schema: Contains fields shared by both Request and Response
class PostBase(BaseModel):
    title: str = Field(min_length=10, max_length=100, description="The title of the blog post")
    content: str = Field(min_length=65, description="The main body text of the blog post (must be at least 65 characters)")
    image_url: str | None = None
    video_url: str | None = None
    reference_url: str | None = None


# 2. Request Schema: Used for validating incoming POST/PUT request bodies
# It inherits everything from PostBase. No extra fields are needed for creation.
class PostCreate(PostBase):
    category_id: uuid.UUID
    tags: list[str] = Field(default=[], description="List of tag names associated with the post")

class PostUpdate(BaseModel):
    title: str | None = Field(None, min_length=10, max_length=100)
    content: str | None = Field(None, min_length=65)
    image_url: str | None = None
    video_url: str | None = None
    reference_url: str | None = None
    category_id: uuid.UUID | None = None
    tags: list[str] | None = Field(None, description="List of tag names associated with the post")


# --- Draft schemas -------------------------------------------------------
# Autosave payload. Everything optional and unconstrained: a draft may hold a
# half-typed title or empty content. Strict rules apply only at publish time.
class DraftUpsert(BaseModel):
    # Permissive: no length rules on autosave (those apply only at publish).
    # A too-long title is truncated to the column width server-side, never rejected.
    title: str | None = None
    content: str | None = None
    category_id: uuid.UUID | None = None
    tags: list[str] | None = None
    image_url: str | None = Field(None, max_length=500)
    video_url: str | None = Field(None, max_length=500)
    reference_url: str | None = Field(None, max_length=500)
    # Client's last-known updated_at, used to detect edits made elsewhere.
    client_updated_at: datetime | None = None


# Light ack returned by autosave. Avoids reloading relationships on every save.
class DraftAck(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    status: PostStatus
    updated_at: datetime


# Full draft view for the "resume drafts" list. Fields nullable unlike PostResponse.
class DraftResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    content: str | None = None
    category_id: uuid.UUID | None = None
    image_url: str | None = None
    video_url: str | None = None
    reference_url: str | None = None
    tags: list[TagResponse] = Field(default=[])
    status: PostStatus
    updated_at: datetime


# 3. Response Schema: Used for validating and filtering outgoing API responses
# It inherits all fields from PostBase, but also includes fields generated by the backend/DB.
class PostResponse(PostBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    category_id: uuid.UUID
    date_posted: datetime
    status: PostStatus
    updated_at: datetime
    likes: int
    author: str = Field(min_length=2, max_length=50, description="The name of the author")
    category: CategoryResponse
    tags: list[TagResponse] = Field(default=[])
    reaction_counts: ReactionCounts
    current_user_reaction: str | None = None
 
class UploadURLRequest(BaseModel):
    content_type:str 

class UploadURLResponse(BaseModel):
    upload_url:str
    fields:dict
    file_url:str
