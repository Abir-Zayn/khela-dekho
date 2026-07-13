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
from app.database import Base, engine, get_db
from app.routers import posts, users, auth, categories


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


# No templates configuration needed


# Include API Routers
app.include_router(users.router)
app.include_router(posts.router)
app.include_router(auth.router)
app.include_router(categories.router)

@app.get("/", include_in_schema=False, name="home")
async def home():
    return {"message": "Welcome to Khela Dekho Sports Blog API. Visit /docs for API documentation."}
