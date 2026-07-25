from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=10,          # steady connections kept open
    max_overflow=20,       # burst headroom under concurrent loads
    pool_timeout=30,       # wait before erroring instead of hanging forever
    pool_recycle=1800,     # drop connections older than 30m (avoids stale/closed sockets)
    pool_pre_ping=True,    # validate a connection before use; recover from dropped DB links
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

class Base(DeclarativeBase):
    pass 

async def get_db():
    async with AsyncSessionLocal() as db:
        yield db 