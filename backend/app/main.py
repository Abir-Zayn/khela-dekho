import pathlib
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app import models
from app.database import Base, engine, get_db
from app.schemas import PostCreate, PostResponse, PostUpdate, UserCreate, UserResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager for starting and stopping the application asynchronously.
    """
    # Startup: Create tables asynchronously
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Yield control to the application
    yield 

    # Shutdown: Dispose engine connection pool
    await engine.dispose()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
def validation_exception_handler(request: Request, exc: RequestValidationError):
    if request.url.path.startswith("/api"):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": exc.errors(), "body": exc.body},
        )
    return HTMLResponse(
        content="<h1>422 Unprocessable Entity</h1><p>Request validation failed.</p>",
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
    )


BASE_DIR = pathlib.Path(__file__).resolve().parent.parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


@app.get("/", include_in_schema=False, name="home")
@app.get("/posts", include_in_schema=False, name="posts")
async def home(request: Request, db: Annotated[AsyncSession, Depends(get_db)]):
    db_posts = await db.execute(
        select(models.Post).options(selectinload(models.Post.user))
    )
    posts = db_posts.scalars().all()
    return templates.TemplateResponse(
        request, 
        "home.html",
        {"posts": posts}
    )


# ==========================================
# API Endpoints (Fully Asynchronous)
# ==========================================

# -------- User Endpoints --------

@app.post(
    "/api/users",
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
        hashed_password=f"mock_hash_{user.password}"
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user 


@app.get("/api/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Annotated[AsyncSession, Depends(get_db)]):
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


# -------- Post Endpoints --------

@app.get('/api/posts', response_model=list[PostResponse])
async def get_posts(db: Annotated[AsyncSession, Depends(get_db)]):
    results = await db.execute(
        select(models.Post).options(selectinload(models.Post.user))
    )
    return results.scalars().all()


@app.get('/api/posts/{post_id}', response_model=PostResponse)
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


@app.post('/api/posts', response_model=PostResponse, status_code=status.HTTP_201_CREATED)
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


@app.put('/api/posts/{post_id}', response_model=PostResponse)
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


@app.delete('/api/posts/{post_id}', status_code=status.HTTP_204_NO_CONTENT)
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


@app.get('/api/posts/author/{author}', response_model=list[PostResponse])
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
