import asyncio
import uuid

import httpx
from sqlalchemy import delete

from app import models
from app.database import AsyncSessionLocal
from app.main import app

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
    tags: list[str],
) -> str:
    response = await client.post(
        "/api/posts",
        headers=headers,
        json={
            "title": title,
            "content": LONG_CONTENT,
            "category_id": category_id,
            "tags": tags,
        },
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


async def create_draft(
    client: httpx.AsyncClient,
    headers: dict[str, str],
    *,
    title: str,
    category_id: str,
    tags: list[str],
) -> str:
    draft_response = await client.post("/api/posts/drafts", headers=headers)
    assert draft_response.status_code == 201, draft_response.text
    draft_id = draft_response.json()["id"]

    save_response = await client.put(
        f"/api/posts/{draft_id}/draft",
        headers=headers,
        json={
            "title": title,
            "content": LONG_CONTENT,
            "category_id": category_id,
            "tags": tags,
        },
    )
    assert save_response.status_code == 200, save_response.text
    return draft_id


async def cleanup_records(
    *,
    post_ids: list[str],
    category_ids: list[str],
    username: str,
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
                    models.Category.id.in_([uuid.UUID(category_id) for category_id in category_ids])
                )
            )
        await session.execute(delete(models.User).where(models.User.username == username))
        await session.commit()


async def main() -> None:
    print("Starting Related Posts API integration tests...")
    suffix = str(uuid.uuid4())[:8]
    username = f"related_user_{suffix}"
    category_ids: list[str] = []
    post_ids: list[str] = []

    try:
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            token = await create_test_user(client, username)
            headers = {"Authorization": f"Bearer {token}"}

            primary_category_id = await create_category(
                name=f"Related Football {suffix}",
                slug=f"related-football-{suffix}",
            )
            secondary_category_id = await create_category(
                name=f"Related Cricket {suffix}",
                slug=f"related-cricket-{suffix}",
            )
            category_ids.extend([primary_category_id, secondary_category_id])

            base_post_id = await create_post(
                client,
                headers,
                title="France Squad Announced for FIFA World Cup Tournament",
                category_id=primary_category_id,
                tags=["fifa", "worldcup", "france", "fff"],
            )
            high_score_post_id = await create_post(
                client,
                headers,
                title="France World Cup Squad Picks Spark Debate Nationwide",
                category_id=primary_category_id,
                tags=["worldcup", "france"],
            )
            medium_score_post_id = await create_post(
                client,
                headers,
                title="FIFA Rankings Update Shows Dramatic Rise for France",
                category_id=primary_category_id,
                tags=["fifa"],
            )
            same_category_only_post_id = await create_post(
                client,
                headers,
                title="Football Tactics Board Explains Pressing in Midfield",
                category_id=primary_category_id,
                tags=["tactics"],
            )
            sitewide_fallback_post_id = await create_post(
                client,
                headers,
                title="Cricket Semi Final Recap Features Major Turning Point",
                category_id=secondary_category_id,
                tags=["cricket", "semifinal"],
            )
            draft_overlap_post_id = await create_draft(
                client,
                headers,
                title="Draft FIFA World Cup Notes",
                category_id=primary_category_id,
                tags=["fifa", "worldcup"],
            )

            post_ids.extend(
                [
                    base_post_id,
                    high_score_post_id,
                    medium_score_post_id,
                    same_category_only_post_id,
                    sitewide_fallback_post_id,
                    draft_overlap_post_id,
                ]
            )

            print("Checking ranking order, exclusions, and fallback top-up...")
            related_response = await client.get(f"/api/posts/{base_post_id}/related?limit=4")
            assert related_response.status_code == 200, related_response.text
            related_data = related_response.json()
            related_ids = [post["id"] for post in related_data]

            assert len(related_ids) == 4
            assert base_post_id not in related_ids
            assert draft_overlap_post_id not in related_ids
            assert related_ids[0] == high_score_post_id
            assert related_ids[1] == medium_score_post_id
            assert same_category_only_post_id in related_ids
            assert sitewide_fallback_post_id in related_ids

            print("Checking draft source post returns 404...")
            draft_response = await client.get(f"/api/posts/{draft_overlap_post_id}/related")
            assert draft_response.status_code == 404, draft_response.text

            print("Checking missing source post returns 404...")
            missing_response = await client.get(f"/api/posts/{uuid.uuid4()}/related")
            assert missing_response.status_code == 404, missing_response.text

            print("Checking limit clamp upper bound...")
            high_limit_response = await client.get(f"/api/posts/{base_post_id}/related?limit=999")
            assert high_limit_response.status_code == 200, high_limit_response.text
            assert len(high_limit_response.json()) <= 10

            print("Checking limit clamp lower bound...")
            low_limit_response = await client.get(f"/api/posts/{base_post_id}/related?limit=0")
            assert low_limit_response.status_code == 200, low_limit_response.text
            assert len(low_limit_response.json()) == 1

            print("Related posts tests passed.")
    finally:
        print("Cleaning up related-posts test records...")
        await cleanup_records(post_ids=post_ids, category_ids=category_ids, username=username)
        print("Cleanup complete.")


if __name__ == "__main__":
    asyncio.run(main())
