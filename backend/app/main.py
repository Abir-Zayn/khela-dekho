from typing import Annotated
from app.schemas import UserCreate
from app.schemas import UserResponse
import pathlib
from fastapi import Depends, FastAPI, Request, HTTPException, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import PostCreate, PostResponse, PostUpdate
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette.exceptions import HTTPException as StarletteHTTPException


from app import models
from app.database import Base, engine, get_db


app = FastAPI()

# Create database tables
Base.metadata.create_all(bind=engine)

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
def home(request: Request, db: Annotated[Session, Depends(get_db)]):
    db_posts = db.execute(select(models.Post)).scalars().all()
    return templates.TemplateResponse(request, "home.html",{
        "posts": db_posts
    })

    

## Creating api endpoint 


@app.post(
    "/api/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def create_user(user:UserCreate, db: Annotated[Session,Depends(get_db)]):
    existing_user = db.execute(
        select(models.User).where(models.User.username == user.username),
    ).scalars().first()

    if existing_user:
        raise HTTPException(
            status_code = status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )
    
    existing_email = db.execute(
        select(models.User).where(models.User.email == user.email),
    ).scalars().first()
    if existing_email:
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
    db.commit()
    db.refresh(new_user)

    return new_user 



@app.get("/api/users/{user_id}", response_model=UserResponse)
def get_user(user_id:int, db: Annotated[Session, Depends(get_db)]):
    existing_user = db.execute(
        select(models.User).where(models.User.id == user_id)
    ).scalars().first()
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return existing_user




@app.get('/api/posts' , response_model=list[PostResponse])
def get_posts(db: Annotated[Session, Depends(get_db)]):
    results = db.execute(select(models.Post))
    return results.scalars().all()


@app.get('/api/posts/{post_id}', response_model=PostResponse)
def get_posts_by_id(post_id: int, db: Annotated[Session, Depends(get_db)]):
    post = db.execute(
        select(models.Post).where(models.Post.id == post_id)
    ).scalars().first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post


@app.post('/api/posts', response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(post: PostCreate, db: Annotated[Session, Depends(get_db)]):
    # Verify that the user exists
    user = db.execute(
        select(models.User).where(models.User.id == post.user_id)
    ).scalars().first()
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
    db.commit()
    db.refresh(new_post)
    return new_post


@app.put('/api/posts/{post_id}', response_model=PostResponse)
def update_post(post_id: int, post_data: PostUpdate, db: Annotated[Session, Depends(get_db)]):
    post = db.execute(
        select(models.Post).where(models.Post.id == post_id)
    ).scalars().first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    if post_data.title is not None:
        post.title = post_data.title
    if post_data.content is not None:
        post.content = post_data.content
        
    db.commit()
    db.refresh(post)
    return post


@app.delete('/api/posts/{post_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, db: Annotated[Session, Depends(get_db)]):
    post = db.execute(
        select(models.Post).where(models.Post.id == post_id)
    ).scalars().first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    db.delete(post)
    db.commit()
    return None


@app.get('/api/posts/author/{author}', response_model=list[PostResponse])
def get_posts_by_author(author: str, db: Annotated[Session, Depends(get_db)]):
    results = db.execute(
        select(models.Post).join(models.User).where(models.User.username == author)
    )
    author_posts = results.scalars().all()
    if author_posts:
        return author_posts
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Posts by author not found")
