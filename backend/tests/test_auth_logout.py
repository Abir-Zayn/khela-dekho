import asyncio
import uuid
import httpx
from app.main import app
from app import models
from sqlalchemy import delete
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

async def main():
    print("Starting Auth Logout API Integration Tests (Async)...")
    
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        suffix = str(uuid.uuid4())[:8]
        username = f"logout_user_{suffix}"
        
        print(f"Creating test user: {username}")
        token = await create_test_user(client, username)
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test 1: Log out with valid token
        print("Testing logout with a valid token...")
        logout_resp = await client.post("/api/auth/logout", headers=headers)
        assert logout_resp.status_code == 200, f"Expected 200 OK, got {logout_resp.status_code}: {logout_resp.text}"
        data = logout_resp.json()
        assert data["message"] == "Logged out successfully"
        print("Logout with valid token succeeded.")
        
        # Test 2: Log out without token
        print("Testing logout without a token...")
        logout_resp_no_token = await client.post("/api/auth/logout")
        assert logout_resp_no_token.status_code == 401, f"Expected 401 Unauthorized, got {logout_resp_no_token.status_code}"
        print("Logout without token correctly returned 401 Unauthorized.")
        
        # Test 3: Log out with invalid token
        print("Testing logout with an invalid token...")
        bad_headers = {"Authorization": "Bearer invalidtokenhere"}
        logout_resp_bad_token = await client.post("/api/auth/logout", headers=bad_headers)
        assert logout_resp_bad_token.status_code == 401, f"Expected 401 Unauthorized, got {logout_resp_bad_token.status_code}"
        print("Logout with invalid token correctly returned 401 Unauthorized.")
        
        # Clean up database records
        print("Cleaning up test records from database...")
        async with AsyncSessionLocal() as session:
            await session.execute(
                delete(models.User).where(models.User.username == username)
            )
            await session.commit()
            
        print("Database cleanup completed successfully.")
        print("ALL LOGOUT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(main())
