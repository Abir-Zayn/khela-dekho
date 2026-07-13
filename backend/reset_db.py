import asyncio
import sys
from sqlalchemy import text
from app.database import engine, Base
from app import models

async def reset_database():
    print("Resetting database tables on RDS...")
    try:
        async with engine.begin() as conn:
            print("Dropping tables posts and users (CASCADE)...")
            await conn.execute(text("DROP TABLE IF EXISTS posts CASCADE;"))
            await conn.execute(text("DROP TABLE IF EXISTS users CASCADE;"))
            
            print("Creating all tables from current metadata...")
            await conn.run_sync(Base.metadata.create_all)
            print("Database reset completed successfully.")
    except Exception as e:
        print(f"Error resetting database: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(reset_database())
