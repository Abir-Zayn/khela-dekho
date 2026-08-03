import asyncio
import uuid
import sys
from datetime import UTC, datetime, timedelta
import httpx
from app.main import app
from app import models
from sqlalchemy import select, delete
from app.database import AsyncSessionLocal

async def create_test_user(client: httpx.AsyncClient, username: str):
    response = await client.post("/api/auth/register", json={
        "username": username,
        "email": f"{username}@example.com",
        "password": "securepassword123"
    })
    assert response.status_code == 201, f"Failed to register user: {response.text}"
    
    # Login to get token
    login_response = await client.post("/api/auth/login", json={
        "email": f"{username}@example.com",
        "password": "securepassword123"
    })
    assert login_response.status_code == 200, f"Failed to login user: {login_response.text}"
    return login_response.json()["access_token"]
async def create_test_category(name: str, slug: str) -> str:
    async with AsyncSessionLocal() as session:
        category = models.Category(name=name, slug=slug)
        session.add(category)
        await session.commit()
        await session.refresh(category)
        return str(category.id)

async def main():
    print("Starting Post Reactions API Integration Tests (Async)...")
    
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # Register and authenticate three test users.
        suffix = str(uuid.uuid4())[:8]
        user1_name = f"user1_{suffix}"
        user2_name = f"user2_{suffix}"
        user3_name = f"user3_{suffix}"
        
        print(f"Creating test users: {user1_name}, {user2_name}, {user3_name}")
        token1 = await create_test_user(client, user1_name)
        token2 = await create_test_user(client, user2_name)
        token3 = await create_test_user(client, user3_name)
        
        # Headers
        headers1 = {"Authorization": f"Bearer {token1}"}
        headers2 = {"Authorization": f"Bearer {token2}"}
        headers3 = {"Authorization": f"Bearer {token3}"}
        
        category_id = await create_test_category(
            name=f"Reactions Test {suffix}",
            slug=f"reactions-test-{suffix}",
        )
        
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

        # 6b. User 3 reacts with LIKE so listing covers all reaction types.
        print("User 3 reacting with LIKE...")
        react_resp = await client.post(f"/api/posts/{post_id}/react", json={"reaction_type": "like"}, headers=headers3)
        assert react_resp.status_code == 200
        react_data = react_resp.json()
        assert react_data["reaction_counts"]["like"] == 1
        assert react_data["reaction_counts"]["love"] == 1
        assert react_data["reaction_counts"]["laugh"] == 1

        # Set deterministic reaction times to verify reverse-chronological ordering.
        async with AsyncSessionLocal() as session:
            reaction_rows = await session.execute(
                select(models.Reaction, models.User.username)
                .join(models.User)
                .where(models.Reaction.post_id == uuid.UUID(post_id))
            )
            reactions_by_username = {
                username: reaction for reaction, username in reaction_rows.all()
            }
            reference_time = datetime.now(UTC)
            reactions_by_username[user2_name].reacted_at = reference_time
            reactions_by_username[user1_name].reacted_at = reference_time - timedelta(minutes=1)
            reactions_by_username[user3_name].reacted_at = reference_time - timedelta(minutes=2)
            await session.commit()

        # 6c. Anyone can list reactors, filter by type, and paginate results.
        print("Verifying public reactor list, filters, pagination, and field projection...")
        reactor_list_response = await client.get(f"/api/posts/{post_id}/reactions")
        assert reactor_list_response.status_code == 200, reactor_list_response.text
        reactor_list_data = reactor_list_response.json()
        assert reactor_list_data["total"] == 3
        assert [entry["user"]["username"] for entry in reactor_list_data["reactions"]] == [
            user2_name,
            user1_name,
            user3_name,
        ]
        assert [entry["reaction_type"] for entry in reactor_list_data["reactions"]] == [
            "laugh",
            "love",
            "like",
        ]
        for entry in reactor_list_data["reactions"]:
            assert set(entry["user"]) == {
                "id",
                "username",
                "full_name",
                "profile_photo_url",
            }
            assert "email" not in entry["user"]
            assert "hashed_password" not in entry["user"]
            assert entry["reacted_at"]

        love_reactors_response = await client.get(
            f"/api/posts/{post_id}/reactions?type=love"
        )
        assert love_reactors_response.status_code == 200, love_reactors_response.text
        love_reactors_data = love_reactors_response.json()
        assert love_reactors_data["total"] == 1
        assert [entry["user"]["username"] for entry in love_reactors_data["reactions"]] == [
            user1_name
        ]

        paginated_reactors_response = await client.get(
            f"/api/posts/{post_id}/reactions?limit=1&offset=1"
        )
        assert paginated_reactors_response.status_code == 200, paginated_reactors_response.text
        paginated_reactors_data = paginated_reactors_response.json()
        assert paginated_reactors_data["total"] == 3
        assert [entry["user"]["username"] for entry in paginated_reactors_data["reactions"]] == [
            user1_name
        ]
        
        # Check User 1 reaction again
        get_resp = await client.get(f"/api/posts/{post_id}", headers=headers1)
        assert get_resp.json()["current_user_reaction"] == "love"
        
        # Check Anonymous reaction breakdown
        print("Verifying anonymous user sees combined breakdown...")
        anon_response = await client.get(f"/api/posts/{post_id}")
        anon_data = anon_response.json()
        assert anon_data["reaction_counts"]["love"] == 1
        assert anon_data["reaction_counts"]["laugh"] == 1
        assert anon_data["reaction_counts"]["like"] == 1
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

        # 8b. User 3 removes the final reaction.
        print("User 3 removing reaction...")
        del_resp = await client.delete(f"/api/posts/{post_id}/react", headers=headers3)
        assert del_resp.status_code == 200
        del_data = del_resp.json()
        assert del_data["reaction_counts"]["like"] == 0
        assert del_data["current_user_reaction"] is None
        
        # 9. Clean up database records
        print("Cleaning up test records from database...")
        async with AsyncSessionLocal() as session:
            # Delete post (will cascade delete reactions if any remain)
            await session.execute(
                delete(models.Post).where(models.Post.id == uuid.UUID(post_id))
            )
            # Delete the category after its post so its RESTRICT foreign key is clear.
            await session.execute(
                delete(models.Category).where(models.Category.id == uuid.UUID(category_id))
            )
            # Delete users
            await session.execute(
                delete(models.User).where(
                    models.User.username.in_([user1_name, user2_name, user3_name])
                )
            )
            await session.commit()
            
        print("Database cleanup completed successfully.")
        print("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(main())
