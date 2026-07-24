from typing import Optional
from fastapi import APIRouter, Query
from app.services.football_service import fetch_football_data, MATCHES_CACHE_TTL, STANDINGS_CACHE_TTL

router = APIRouter(
    prefix="/livescores",
    tags=["Live Scores"]
)

@router.get("/matches")
async def get_matches(
    competition: Optional[str] = Query(None, description="Competition code like PL, CL, PD, SA, BL1"),
    status: Optional[str] = Query(None, description="Match status filter e.g. IN_PLAY, FINISHED, SCHEDULED")
):
    """
    Get live, upcoming, and recent football matches.
    """
    endpoint = "matches"
    if competition:
        endpoint = f"competitions/{competition}/matches"
    
    data = await fetch_football_data(endpoint, ttl=MATCHES_CACHE_TTL)
    
    # Apply optional client-side status filter if data exists
    if status and "matches" in data:
        filtered_matches = [
            m for m in data["matches"] 
            if m.get("status") == status or (status == "LIVE" and m.get("status") in ["IN_PLAY", "PAUSED", "HALF_TIME"])
        ]
        return {**data, "matches": filtered_matches, "count": len(filtered_matches)}

    return data

@router.get("/standings/{league_code}")
async def get_standings(league_code: str = "PL"):
    """
    Get competition standings by league code (e.g., PL for Premier League, PD for La Liga, CL for Champions League, SA for Serie A, BL1 for Bundesliga).
    """
    endpoint = f"competitions/{league_code.upper()}/standings"
    data = await fetch_football_data(endpoint, ttl=STANDINGS_CACHE_TTL)
    return data
