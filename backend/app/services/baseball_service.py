import time
import logging
from typing import Dict, Any, List
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

BASE_URL = "https://www.thesportsdb.com/api/v1/json"
BASEBALL_CACHE_TTL = 45  # 45 seconds TTL cache

MOCK_BASEBALL_MATCHES = {
    "matches": [
        {
            "id": "mlb-101",
            "event": "New York Yankees vs Boston Red Sox",
            "league": "MLB",
            "season": "2026",
            "date": "2026-07-24",
            "time": "19:05:00",
            "status": "Top 7th - 2 Outs",
            "homeTeam": {
                "id": "135269",
                "name": "New York Yankees",
                "shortName": "NYY",
                "badge": "https://www.thesportsdb.com/images/media/team/badge/vwytsw1420583488.png"
            },
            "awayTeam": {
                "id": "135260",
                "name": "Boston Red Sox",
                "shortName": "BOS",
                "badge": "https://www.thesportsdb.com/images/media/team/badge/x03hha1547370366.png"
            },
            "homeScore": 5,
            "awayScore": 3,
            "venue": "Yankee Stadium, New York",
            "isLive": True
        },
        {
            "id": "mlb-102",
            "event": "Los Angeles Dodgers vs San Francisco Giants",
            "league": "MLB",
            "season": "2026",
            "date": "2026-07-24",
            "time": "22:10:00",
            "status": "Scheduled",
            "homeTeam": {
                "id": "135265",
                "name": "Los Angeles Dodgers",
                "shortName": "LAD",
                "badge": "https://www.thesportsdb.com/images/media/team/badge/rwxxuy1420582845.png"
            },
            "awayTeam": {
                "id": "135275",
                "name": "San Francisco Giants",
                "shortName": "SFG",
                "badge": "https://www.thesportsdb.com/images/media/team/badge/spwsst1420584483.png"
            },
            "homeScore": None,
            "awayScore": None,
            "venue": "Dodger Stadium, Los Angeles",
            "isLive": False
        },
        {
            "id": "mlb-103",
            "event": "Houston Astros vs Atlanta Braves",
            "league": "MLB",
            "season": "2026",
            "date": "2026-07-24",
            "time": "16:10:00",
            "status": "Final",
            "homeTeam": {
                "id": "135264",
                "name": "Houston Astros",
                "shortName": "HOU",
                "badge": "https://www.thesportsdb.com/images/media/team/badge/usvspu1420583196.png"
            },
            "awayTeam": {
                "id": "135259",
                "name": "Atlanta Braves",
                "shortName": "ATL",
                "badge": "https://www.thesportsdb.com/images/media/team/badge/trrurv1420582098.png"
            },
            "homeScore": 6,
            "awayScore": 4,
            "venue": "Minute Maid Park, Houston",
            "isLive": False
        }
    ]
}

_cache: Dict[str, tuple[float, Any]] = {}

async def fetch_baseball_matches() -> Dict[str, Any]:
    """
    Fetch MLB baseball matches from TheSportsDB with caching and mock fallback.
    """
    now = time.time()
    cache_key = "thesportsdb:mlb_matches"

    if cache_key in _cache:
        timestamp, data = _cache[cache_key]
        if now - timestamp < BASEBALL_CACHE_TTL:
            return data

    api_key = getattr(settings, "THESPORTSDB_API_KEY", "3").strip() or "3"
    url = f"{BASE_URL}/{api_key}/eventsnextleague.php?id=4424"

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(url)
            if response.status_code == 200:
                raw_data = response.json()
                events = raw_data.get("events") or []

                if not events:
                    # Try fetching past events if next events list is empty
                    past_url = f"{BASE_URL}/{api_key}/eventspastleague.php?id=4424"
                    past_res = await client.get(past_url)
                    if past_res.status_code == 200:
                        events = past_res.json().get("events") or []

                if events:
                    formatted_matches = []
                    for ev in events:
                        formatted_matches.append({
                            "id": ev.get("idEvent", ""),
                            "event": ev.get("strEvent", ""),
                            "league": ev.get("strLeague", "MLB"),
                            "season": ev.get("strSeason", ""),
                            "date": ev.get("dateEvent", ""),
                            "time": ev.get("strTime", ""),
                            "status": ev.get("strStatus", "Final" if ev.get("intHomeScore") is not None else "Scheduled"),
                            "homeTeam": {
                                "id": ev.get("idHomeTeam", ""),
                                "name": ev.get("strHomeTeam", "Home Team"),
                                "shortName": ev.get("strHomeTeam", "")[:3].upper(),
                                "badge": ev.get("strHomeTeamBadge")
                            },
                            "awayTeam": {
                                "id": ev.get("idAwayTeam", ""),
                                "name": ev.get("strAwayTeam", "Away Team"),
                                "shortName": ev.get("strAwayTeam", "")[:3].upper(),
                                "badge": ev.get("strAwayTeamBadge")
                            },
                            "homeScore": int(ev["intHomeScore"]) if ev.get("intHomeScore") is not None else None,
                            "awayScore": int(ev["intAwayScore"]) if ev.get("intAwayScore") is not None else None,
                            "venue": ev.get("strVenue"),
                            "isLive": "in play" in str(ev.get("strStatus", "")).lower()
                        })

                    result = {"matches": formatted_matches}
                    _cache[cache_key] = (now, result)
                    return result
                else:
                    return MOCK_BASEBALL_MATCHES
            else:
                logger.warning(f"TheSportsDB returned status {response.status_code}")
                return MOCK_BASEBALL_MATCHES
    except Exception as exc:
        logger.error(f"Error connecting to TheSportsDB: {exc}")
        return MOCK_BASEBALL_MATCHES
