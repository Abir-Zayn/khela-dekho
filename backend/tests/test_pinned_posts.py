"""Integration tests for pin/unpin (POST|DELETE /api/posts/{id}/pin).

Run from backend/:  uv run python -m tests.test_pinned_posts
"""

import asyncio
import uuid

import httpx
from sqlalchemy import delete

from app import models
from app.database import AsyncSessionLocal
from app.main import app
from app.routers.posts import MAX_PINNED_POSTS

LONG_CONTENT = (
    "This article body is intentionally long enough to pass publish validation "
    "while remaining concise for integration tests in the sports blog backend."
)


async def create_test_user(client: httpx.AsyncClient, username: str) -> str:
    register_response = await client.post(
        "/api/auth/register",
        json={
            "username": username,
            "email": f"{username}@example.com",
            "password": "securepassword123",
        },
    )
    assert register_response.status_code == 201, register_response.text

    login_response = await client.post(
        "/api/auth/login",
        json={
            "email": f"{username}@example.com",
            "password": "securepassword123",
        },
    )
    assert login_response.status_code == 200, login_response.text
    return login_response.json()["access_token"]


async def create_category(name: str, slug: str) -> str:
    async with AsyncSessionLocal() as session:
        category = models.Category(name=name, slug=slug)
        session.add(category)
        await session.commit()
        await session.refresh(category)
        return str(category.id)


async def create_post(
    client: httpx.AsyncClient,
    headers: dict[str, str],
    *,
    title: str,
    category_id: str,
) -> str:
    response = await client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": title,
            "content": LONG_CONTENT,
            "category_id": category_id,
            "tags": [],
        },
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


async def create_draft(client: httpx.AsyncClient, headers: dict[str, str]) -> str:
    draft_response = await client.post("/api/posts/drafts", headers=headers)
    assert draft_response.status_code == 201, draft_response.text
    return draft_response.json()["id"]


async def cleanup_records(
    *,
    post_ids: list[str],
    category_ids: list[str],
    usernames: list[str],
) -> None:
    async with AsyncSessionLocal() as session:
        if post_ids:
            await session.execute(
                delete(models.Post).where(
                    models.Post.id.in_([uuid.UUID(post_id) for post_id in post_ids])
                )
            )
        if category_ids:
            await session.execute(
                delete(models.Category).where(
                    models.Category.id.in_(
                        [uuid.UUID(category_id) for category_id in category_ids]
                    )
                )
            )
        if usernames:
            await session.execute(
                delete(models.User).where(models.User.username.in_(usernames))
            )
        await session.commit()


async def main() -> None:
    print("Starting Pin/Unpin API integration tests...")
    suffix = str(uuid.uuid4())[:8]
    username = f"pin_user_{suffix}"
    other_username = f"pin_other_{suffix}"
    category_ids: list[str] = []
    post_ids: list[str] = []

    try:
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            token = await create_test_user(client, username)
            headers = {"Authorization": f"Bearer {token}"}
            other_token = await create_test_user(client, other_username)
            other_headers = {"Authorization": f"Bearer {other_token}"}

            category_id = await create_category(
                name=f"Pin Football {suffix}",
                slug=f"pin-football-{suffix}",
            )
            category_ids.append(category_id)

            # MAX_PINNED_POSTS + 1 published posts, so the cap can be exercised.
            owned_ids = [
                await create_post(
                    client,
                    headers,
                    title=f"Pinned Story Number {index} About Football Tactics",
                    category_id=category_id,
                )
                for index in range(MAX_PINNED_POSTS + 1)
            ]
            post_ids.extend(owned_ids)
            draft_id = await create_draft(client, headers)
            post_ids.append(draft_id)

            print("Checking pin sets is_pinned/pinned_at...")
            pin_response = await client.post(f"/api/posts/{owned_ids[0]}/pin", headers=headers)
            assert pin_response.status_code == 200, pin_response.text
            pinned_body = pin_response.json()
            assert pinned_body["is_pinned"] is True
            assert pinned_body["pinned_at"] is not None
            first_pinned_at = pinned_body["pinned_at"]

            print("Checking pin is idempotent and keeps the original pin time...")
            repeat_response = await client.post(f"/api/posts/{owned_ids[0]}/pin", headers=headers)
            assert repeat_response.status_code == 200, repeat_response.text
            assert repeat_response.json()["pinned_at"] == first_pinned_at

            print("Checking a non-owner can pin a published post...")
            non_owner_pin = await client.post(
                f"/api/posts/{owned_ids[1]}/pin", headers=other_headers
            )
            assert non_owner_pin.status_code == 200, non_owner_pin.text
            assert non_owner_pin.json()["is_pinned"] is True

            print("Checking anonymous pin is rejected...")
            anon_response = await client.post(f"/api/posts/{owned_ids[1]}/pin")
            assert anon_response.status_code == 401, anon_response.text

            print("Checking a draft cannot be pinned...")
            draft_pin_response = await client.post(
                f"/api/posts/{draft_id}/pin", headers=headers
            )
            assert draft_pin_response.status_code == 409, draft_pin_response.text

            print("Checking a missing post returns 404...")
            missing_response = await client.post(
                f"/api/posts/{uuid.uuid4()}/pin", headers=headers
            )
            assert missing_response.status_code == 404, missing_response.text

            print(f"Checking the cap of {MAX_PINNED_POSTS} pinned posts...")
            for post_id in owned_ids[2:MAX_PINNED_POSTS]:
                capped_response = await client.post(f"/api/posts/{post_id}/pin", headers=headers)
                assert capped_response.status_code == 200, capped_response.text
            over_cap_response = await client.post(
                f"/api/posts/{owned_ids[MAX_PINNED_POSTS]}/pin", headers=headers
            )
            assert over_cap_response.status_code == 409, over_cap_response.text
            assert str(MAX_PINNED_POSTS) in over_cap_response.json()["detail"]

            print("Checking the pinned list...")
            pinned_list_response = await client.get("/api/posts/pinned", headers=headers)
            assert pinned_list_response.status_code == 200, pinned_list_response.text
            pinned_ids = [post["id"] for post in pinned_list_response.json()]
            assert len(pinned_ids) == MAX_PINNED_POSTS
            assert owned_ids[MAX_PINNED_POSTS] not in pinned_ids

            print("Checking the public pinned list by author...")
            public_pinned_response = await client.get(f"/api/posts/pinned?author={username}")
            assert public_pinned_response.status_code == 200, public_pinned_response.text

            print("Checking anonymous pinned list without author is rejected...")
            anon_pinned_response = await client.get("/api/posts/pinned")
            assert anon_pinned_response.status_code == 401, anon_pinned_response.text

            print("Checking a non-owner can unpin a post...")
            non_owner_unpin = await client.delete(
                f"/api/posts/{owned_ids[1]}/pin", headers=other_headers
            )
            assert non_owner_unpin.status_code == 200, non_owner_unpin.text
            assert non_owner_unpin.json()["is_pinned"] is False

            print("Checking unpin clears the pin and frees a cap slot...")
            unpin_response = await client.delete(
                f"/api/posts/{owned_ids[0]}/pin", headers=headers
            )
            assert unpin_response.status_code == 200, unpin_response.text
            assert unpin_response.json()["is_pinned"] is False
            assert unpin_response.json()["pinned_at"] is None

            print("Checking unpin is idempotent...")
            repeat_unpin = await client.delete(
                f"/api/posts/{owned_ids[0]}/pin", headers=headers
            )
            assert repeat_unpin.status_code == 200, repeat_unpin.text
            assert repeat_unpin.json()["is_pinned"] is False

            freed_slot_response = await client.post(
                f"/api/posts/{owned_ids[MAX_PINNED_POSTS]}/pin", headers=headers
            )
            assert freed_slot_response.status_code == 200, freed_slot_response.text

            print("Pin/unpin tests passed.")
    finally:
        print("Cleaning up pin/unpin test records...")
        await cleanup_records(
            post_ids=post_ids,
            category_ids=category_ids,
            usernames=[username, other_username],
        )
        print("Cleanup complete.")


if __name__ == "__main__":
    asyncio.run(main())
