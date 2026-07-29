from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app import models
from app.config import settings
from app.database import engine, get_db
from app.routers import posts, users, auth, categories, tags, livescores, cricket, baseball, webhooks


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager for starting and stopping the application asynchronously.
    Schema is managed by Alembic (run as a pre-deploy step), not at boot.
    """
    yield
    await engine.dispose()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",")],
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


# No templates configuration needed


# Include API Routers
app.include_router(users.router)
app.include_router(posts.router)
app.include_router(auth.router)
app.include_router(webhooks.router)
app.include_router(categories.router)
app.include_router(tags.router)
app.include_router(livescores.router, prefix="/api/v1")
app.include_router(cricket.router, prefix="/api/v1")
app.include_router(baseball.router, prefix="/api/v1")

@app.get("/", include_in_schema=False, name="home")
async def home():
    return {"message": "Welcome to Khela Dekho Sports Blog API. Multi-sport live engine active."}

