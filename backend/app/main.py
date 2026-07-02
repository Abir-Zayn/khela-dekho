import pathlib
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

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

posts: list[dict] = [
    {
        "id": 1,
        "author": "Corey Schafer",
        "title": "FastAPI is Awesome",
        "content": "This framework is really easy to use and super fast.",
        "date_posted": "April 20, 2025",
    },
    {
        "id": 2,
        "author": "Jane Doe",
        "title": "Python Tips and Tricks",
        "content": "Exploring the power of list comprehensions and decorators.",
        "date_posted": "May 12, 2026",
    },
    {
        "id": 3,
        "author": "John Smith",
        "title": "Understanding AsyncIO",
        "content": "Concurrency can be tricky, but it's essential for high-performance apps.",
        "date_posted": "June 05, 2026",
    },
    {
        "id": 4,
        "author": "Alice Johnson",
        "title": "Database Migrations",
        "content": "Managing schema changes with Alembic made simple.",
        "date_posted": "July 01, 2026",
    },
    {
        "id": 5,
        "author": "Bob Brown",
        "title": "Introduction to Docker",
        "content": "Containerization is revolutionizing development. Let's dive in.",
        "date_posted": "August 15, 2026",
    },
    {
        "id": 6,
        "author": "Charlie Davis",
        "title": "REST API Best Practices",
        "content": "How to design clean, scalable APIs that developers will love.",
        "date_posted": "September 3, 2026",
    }
]

@app.get("/", include_in_schema=False, name="home")
@app.get("/posts", include_in_schema=False, name="posts")
def home(request: Request):
    return templates.TemplateResponse(request, "home.html",{
        "posts": posts
    })

    

## Creating api endpoint 

@app.get('/api/posts')
def get_posts():
    return posts


@app.get('/api/posts/{post_id}')
def get_posts_by_id(post_id: int):
    for post in posts:
        if post.get('id') == post_id:
            return post
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")


@app.get('/api/posts/author/{author}')
def get_posts_by_author(author: str):
    author_posts = [post for post in posts if post.get('author') == author]
    if author_posts:
        return author_posts
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Posts by author not found")
