import asyncio
import sys
from sqlalchemy import text
from app.database import engine, Base
from app import models

async def reset_database():
    print("Resetting database tables on RDS...")
    try:
        async with engine.begin() as conn:
            print("Dropping tables posts, users, and categories (CASCADE)...")
            await conn.execute(text("DROP TABLE IF EXISTS posts CASCADE;"))
            await conn.execute(text("DROP TABLE IF EXISTS users CASCADE;"))
            await conn.execute(text("DROP TABLE IF EXISTS categories CASCADE;"))
            
            print("Creating all tables from current metadata...")
            await conn.run_sync(Base.metadata.create_all)
            
        # Seed categories using AsyncSessionLocal
        from app.database import AsyncSessionLocal
        from uuid6 import uuid7
        
        categories_to_seed = [
            "Cricket", "Football", "Badminton", "Volleyball", "Swimming", "Chess", 
            "Wrestling", "Hockey", "EGames", "Tennis", "Carrom", "Table Tennis", 
            "Bodybuilding", "Rugby", "Boxing", "Athletics", "Golf", "Horse Racing", 
            "Formula 1", "Sumo", "Cycling", "Shooting"
        ]
        
        print(f"Seeding {len(categories_to_seed)} sports categories...")
        async with AsyncSessionLocal() as session:
            for cat_name in categories_to_seed:
                slug = cat_name.lower().replace(" ", "-")
                category = models.Category(
                    id=uuid7(),
                    name=cat_name,
                    slug=slug
                )
                session.add(category)
            await session.commit()
            
        print("Database reset and category seeding completed successfully.")
    except Exception as e:
        print(f"Error resetting database: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(reset_database())
