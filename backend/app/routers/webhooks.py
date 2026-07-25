import json
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from svix.webhooks import Webhook, WebhookVerificationError

from app import models
from app.config import settings
from app.database import get_db

router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])

@router.post("/clerk")
async def clerk_webhook(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Receives Clerk webhook events (user.created, user.updated, user.deleted)
    and keeps the local PostgreSQL users table synchronized.
    """
    payload = await request.body()
    headers = dict(request.headers)

    # Verify signature if secret is configured
    if settings.CLERK_WEBHOOK_SECRET:
        svix_id = headers.get("svix-id")
        svix_timestamp = headers.get("svix-timestamp")
        svix_signature = headers.get("svix-signature")

        if not svix_id or not svix_timestamp or not svix_signature:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing Svix headers")

        try:
            wh = Webhook(settings.CLERK_WEBHOOK_SECRET)
            event = wh.verify(payload, headers)
        except WebhookVerificationError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature")
    else:
        event = json.loads(payload)

    event_type = event.get("type")
    data = event.get("data", {})

    clerk_id = data.get("id")
    if not clerk_id:
        return {"status": "ignored", "reason": "no clerk id"}

    if event_type in ["user.created", "user.updated"]:
        email_addresses = data.get("email_addresses", [])
        primary_email = ""
        if email_addresses:
            primary_email = email_addresses[0].get("email_address", "")

        username = data.get("username") or data.get("first_name") or f"user_{clerk_id[-6:]}"
        first_name = data.get("first_name") or ""
        last_name = data.get("last_name") or ""
        full_name = f"{first_name} {last_name}".strip() or username
        image_url = data.get("image_url") or data.get("profile_image_url")

        res = await db.execute(select(models.User).where(models.User.clerk_id == clerk_id))
        user = res.scalars().first()

        if user is None:
            # Ensure unique username
            existing_un = await db.execute(select(models.User).where(models.User.username == username))
            if existing_un.scalars().first():
                username = f"{username}_{clerk_id[-4:]}"

            user = models.User(
                clerk_id=clerk_id,
                username=username,
                email=primary_email,
                full_name=full_name,
                profile_photo_url=image_url
            )
            db.add(user)
        else:
            user.email = primary_email or user.email
            user.full_name = full_name or user.full_name
            user.profile_photo_url = image_url or user.profile_photo_url

        await db.commit()
        return {"status": "success", "event": event_type}

    elif event_type == "user.deleted":
        res = await db.execute(select(models.User).where(models.User.clerk_id == clerk_id))
        user = res.scalars().first()
        if user:
            await db.delete(user)
            await db.commit()
        return {"status": "success", "event": event_type}

    return {"status": "ignored"}
