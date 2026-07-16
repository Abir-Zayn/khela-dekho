import asyncio
import uuid
import sys
import httpx
from app.main import app
from app import models
from sqlalchemy import select, delete
from app.database import AsyncSessionLocal

async def create_test_user(client: httpx.AsyncClient, username: str):
    response = await client.post("/api/users", json={
        "username": username,
        "email": f"{username}@example.com",
        "password": "securepassword123"
    })
    assert response.status_code == 201, f"Failed to register user: {response.text}"
    
    # Login to get token
    login_response = await client.post("/api/auth/login", data={
        "username": username,
        "password": "securepassword123"
    })
    assert login_response.status_code == 200, f"Failed to login user: {login_response.text}"
    return login_response.json()["access_token"]

async def main():
    print("Starting Post Reactions API Integration Tests (Async)...")
    
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # Register and authenticate 2 test users
        suffix = str(uuid.uuid4())[:8]
        user1_name = f"user1_{suffix}"
        user2_name = f"user2_{suffix}"
        
        print(f"Creating test users: {user1_name}, {user2_name}")
        token1 = await create_test_user(client, user1_name)
        token2 = await create_test_user(client, user2_name)
        
        # Headers
        headers1 = {"Authorization": f"Bearer {token1}"}
        headers2 = {"Authorization": f"Bearer {token2}"}
        
        # Get a category ID
        cat_response = await client.get("/api/categories")
        assert cat_response.status_code == 200
        categories = cat_response.json()
        assert len(categories) > 0, "No categories seeded!"
        category_id = categories[0]["id"]
        
        # 1. User 1 creates a post
        print("Creating a test post...")
        post_payload = {
            "title": "Exciting Tennis Championship Match Today",
            "content": "A beautiful match happened today in the tennis championship court. The players played with high energy and amazing skills.",
            "category_id": category_id,
            "tags": ["Tennis", "Championship"]
        }
        post_response = await client.post("/api/posts", json=post_payload, headers=headers1)
        assert post_response.status_code == 201, f"Failed to create post: {post_response.text}"
        post_data = post_response.json()
        post_id = post_data["id"]
        
        # Check default counts
        assert post_data["reaction_counts"]["like"] == 0
        assert post_data["reaction_counts"]["love"] == 0
        assert post_data["reaction_counts"]["laugh"] == 0
        assert post_data["current_user_reaction"] is None
        print("Verified default reaction counts are all 0.")
        
        # 2. Anonymous visitor gets the post
        print("Verifying anonymous retrieval...")
        anon_response = await client.get(f"/api/posts/{post_id}")
        assert anon_response.status_code == 200
        anon_data = anon_response.json()
        assert anon_data["reaction_counts"]["like"] == 0
        assert anon_data["current_user_reaction"] is None
        
        # 3. User 1 reacts with LIKE
        print("User 1 reacting with LIKE...")
        react_resp = await client.post(f"/api/posts/{post_id}/react", json={"reaction_type": "like"}, headers=headers1)
        assert react_resp.status_code == 200
        react_data = react_resp.json()
        assert react_data["reaction_counts"]["like"] == 1
        assert react_data["reaction_counts"]["love"] == 0
        assert react_data["reaction_counts"]["laugh"] == 0
        assert react_data["current_user_reaction"] == "like"
        
        # 4. User 1 gets post, verifying current_user_reaction is populated
        get_resp = await client.get(f"/api/posts/{post_id}", headers=headers1)
        assert get_resp.json()["current_user_reaction"] == "like"
        
        # 5. User 1 switches reaction to LOVE
        print("User 1 switching reaction to LOVE...")
        react_resp = await client.post(f"/api/posts/{post_id}/react", json={"reaction_type": "love"}, headers=headers1)
        assert react_resp.status_code == 200
        react_data = react_resp.json()
        assert react_data["reaction_counts"]["like"] == 0
        assert react_data["reaction_counts"]["love"] == 1
        assert react_data["reaction_counts"]["laugh"] == 0
        assert react_data["current_user_reaction"] == "love"
        
        # 6. User 2 reacts with LAUGH
        print("User 2 reacting with LAUGH...")
        react_resp = await client.post(f"/api/posts/{post_id}/react", json={"reaction_type": "laugh"}, headers=headers2)
        assert react_resp.status_code == 200
        react_data = react_resp.json()
        assert react_data["reaction_counts"]["like"] == 0
        assert react_data["reaction_counts"]["love"] == 1
        assert react_data["reaction_counts"]["laugh"] == 1
        assert react_data["current_user_reaction"] == "laugh"
        
        # Check User 1 reaction again
        get_resp = await client.get(f"/api/posts/{post_id}", headers=headers1)
        assert get_resp.json()["current_user_reaction"] == "love"
        
        # Check Anonymous reaction breakdown
        print("Verifying anonymous user sees combined breakdown...")
        anon_response = await client.get(f"/api/posts/{post_id}")
        anon_data = anon_response.json()
        assert anon_data["reaction_counts"]["love"] == 1
        assert anon_data["reaction_counts"]["laugh"] == 1
        assert anon_data["reaction_counts"]["like"] == 0
        assert anon_data["current_user_reaction"] is None
        
        # 7. User 1 removes reaction
        print("User 1 removing reaction...")
        del_resp = await client.delete(f"/api/posts/{post_id}/react", headers=headers1)
        assert del_resp.status_code == 200
        del_data = del_resp.json()
        assert del_data["reaction_counts"]["love"] == 0
        assert del_data["reaction_counts"]["laugh"] == 1
        assert del_data["current_user_reaction"] is None
        
        # 8. User 2 removes reaction
        print("User 2 removing reaction...")
        del_resp = await client.delete(f"/api/posts/{post_id}/react", headers=headers2)
        assert del_resp.status_code == 200
        del_data = del_resp.json()
        assert del_data["reaction_counts"]["laugh"] == 0
        assert del_data["reaction_counts"]["love"] == 0
        assert del_data["current_user_reaction"] is None
        
        # 9. Clean up database records
        print("Cleaning up test records from database...")
        async with AsyncSessionLocal() as session:
            # Delete post (will cascade delete reactions if any remain)
            await session.execute(
                delete(models.Post).where(models.Post.id == uuid.UUID(post_id))
            )
            # Delete users
            await session.execute(
                delete(models.User).where(models.User.username.in_([user1_name, user2_name]))
            )
            await session.commit()
            
        print("Database cleanup completed successfully.")
        print("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(main())
