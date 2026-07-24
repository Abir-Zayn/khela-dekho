from fastapi import APIRouter
from app.services.baseball_service import fetch_baseball_matches

router = APIRouter(
    prefix="/baseball",
    tags=["Baseball Live Scores"]
)

@router.get("/matches")
async def get_baseball_matches():
    """
    Get live, upcoming, and recent MLB baseball matches.
    """
    data = await fetch_baseball_matches()
    return data
