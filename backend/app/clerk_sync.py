import httpx

from app.config import settings

CLERK_API_BASE = "https://api.clerk.com/v1"


async def sync_clerk_username(clerk_id: str, username: str) -> None:
    """Best-effort push of the local username change to Clerk so session tokens stay in sync."""
    if not settings.CLERK_SECRET_KEY:
        return
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.patch(
                f"{CLERK_API_BASE}/users/{clerk_id}",
                headers={"Authorization": f"Bearer {settings.CLERK_SECRET_KEY}"},
                json={"username": username},
            )
            resp.raise_for_status()
    except Exception as e:
        print(f"Failed to sync username to Clerk for {clerk_id}: {e}")


async def sync_clerk_profile_image(clerk_id: str, image_url: str) -> None:
    """Best-effort push of the new S3 avatar to Clerk (Clerk only accepts uploaded bytes, not a URL)."""
    if not settings.CLERK_SECRET_KEY:
        return
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            image_resp = await client.get(image_url)
            image_resp.raise_for_status()
            content_type = image_resp.headers.get("content-type", "image/png")
            ext = content_type.split("/")[-1]

            resp = await client.post(
                f"{CLERK_API_BASE}/users/{clerk_id}/profile_image",
                headers={"Authorization": f"Bearer {settings.CLERK_SECRET_KEY}"},
                files={"file": (f"avatar.{ext}", image_resp.content, content_type)},
            )
            resp.raise_for_status()
    except Exception as e:
        print(f"Failed to sync profile image to Clerk for {clerk_id}: {e}")
