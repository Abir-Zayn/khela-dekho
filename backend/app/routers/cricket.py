from typing import Optional
from fastapi import APIRouter, Query
from app.services.cricket_service import fetch_cricket_matches

router = APIRouter(
    prefix="/cricket",
    tags=["Cricket Live Scores"]
)

@router.get("/matches")
async def get_cricket_matches(
    type: Optional[str] = Query(None, description="Match type filter e.g. t20, odi, test")
):
    """
    Get live, upcoming, and recent international and domestic cricket matches.
    """
    data = await fetch_cricket_matches()
    
    matches = data.get("data", [])
    if type and matches:
        matches = [m for m in matches if m.get("matchType", "").lower() == type.lower()]
        return {**data, "data": matches}

    return data
