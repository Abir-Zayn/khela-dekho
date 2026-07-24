import time
import logging
from typing import Dict, Any
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

BASE_URL = "https://api.football-data.org/v4"

_cache: Dict[str, tuple[float, Any]] = {}

MATCHES_CACHE_TTL = 45  # 45 seconds cache for live/upcoming matches
STANDINGS_CACHE_TTL = 600  # 10 minutes cache for standings

MOCK_MATCHES = {
    "count": 5,
    "filters": {},
    "matches": [
        {
            "id": 401,
            "competition": {"id": 2021, "name": "Premier League", "code": "PL", "emblem": "https://crests.football-data.org/PL.png"},
            "utcDate": "2026-07-24T16:00:00Z",
            "status": "IN_PLAY",
            "minute": 68,
            "matchday": 34,
            "homeTeam": {
                "id": 65,
                "name": "Manchester City",
                "shortName": "Man City",
                "tla": "MCI",
                "crest": "https://crests.football-data.org/65.png"
            },
            "awayTeam": {
                "id": 64,
                "name": "Liverpool FC",
                "shortName": "Liverpool",
                "tla": "LIV",
                "crest": "https://crests.football-data.org/64.png"
            },
            "score": {
                "winner": None,
                "duration": "REGULAR",
                "fullTime": {"home": 2, "away": 1},
                "halfTime": {"home": 1, "away": 1}
            }
        },
        {
            "id": 402,
            "competition": {"id": 2014, "name": "La Liga", "code": "PD", "emblem": "https://crests.football-data.org/PD.png"},
            "utcDate": "2026-07-24T17:30:00Z",
            "status": "PAUSED",
            "minute": 45,
            "matchday": 32,
            "homeTeam": {
                "id": 86,
                "name": "Real Madrid CF",
                "shortName": "Real Madrid",
                "tla": "RMA",
                "crest": "https://crests.football-data.org/86.png"
            },
            "awayTeam": {
                "id": 81,
                "name": "FC Barcelona",
                "shortName": "Barcelona",
                "tla": "BAR",
                "crest": "https://crests.football-data.org/81.png"
            },
            "score": {
                "winner": None,
                "duration": "REGULAR",
                "fullTime": {"home": 1, "away": 1},
                "halfTime": {"home": 1, "away": 1}
            }
        },
        {
            "id": 403,
            "competition": {"id": 2001, "name": "UEFA Champions League", "code": "CL", "emblem": "https://crests.football-data.org/CL.png"},
            "utcDate": "2026-07-24T19:00:00Z",
            "status": "TIMED",
            "minute": None,
            "matchday": 6,
            "homeTeam": {
                "id": 5,
                "name": "FC Bayern München",
                "shortName": "Bayern",
                "tla": "BAY",
                "crest": "https://crests.football-data.org/5.svg"
            },
            "awayTeam": {
                "id": 61,
                "name": "Chelsea FC",
                "shortName": "Chelsea",
                "tla": "CHE",
                "crest": "https://crests.football-data.org/61.png"
            },
            "score": {
                "winner": None,
                "duration": "REGULAR",
                "fullTime": {"home": None, "away": None},
                "halfTime": {"home": None, "away": None}
            }
        },
        {
            "id": 404,
            "competition": {"id": 2021, "name": "Premier League", "code": "PL", "emblem": "https://crests.football-data.org/PL.png"},
            "utcDate": "2026-07-24T13:30:00Z",
            "status": "FINISHED",
            "minute": 90,
            "matchday": 34,
            "homeTeam": {
                "id": 57,
                "name": "Arsenal FC",
                "shortName": "Arsenal",
                "tla": "ARS",
                "crest": "https://crests.football-data.org/57.png"
            },
            "awayTeam": {
                "id": 66,
                "name": "Manchester United FC",
                "shortName": "Man United",
                "tla": "MUN",
                "crest": "https://crests.football-data.org/66.png"
            },
            "score": {
                "winner": "HOME_TEAM",
                "duration": "REGULAR",
                "fullTime": {"home": 3, "away": 1},
                "halfTime": {"home": 1, "away": 0}
            }
        },
        {
            "id": 405,
            "competition": {"id": 2019, "name": "Serie A", "code": "SA", "emblem": "https://crests.football-data.org/SA.png"},
            "utcDate": "2026-07-24T18:45:00Z",
            "status": "TIMED",
            "minute": None,
            "matchday": 33,
            "homeTeam": {
                "id": 98,
                "name": "AC Milan",
                "shortName": "Milan",
                "tla": "MIL",
                "crest": "https://crests.football-data.org/98.png"
            },
            "awayTeam": {
                "id": 108,
                "name": "FC Internazionale Milano",
                "shortName": "Inter",
                "tla": "INT",
                "crest": "https://crests.football-data.org/108.png"
            },
            "score": {
                "winner": None,
                "duration": "REGULAR",
                "fullTime": {"home": None, "away": None},
                "halfTime": {"home": None, "away": None}
            }
        }
    ]
}

MOCK_STANDINGS = {
    "PL": {
        "competition": {"id": 2021, "name": "Premier League", "code": "PL", "emblem": "https://crests.football-data.org/PL.png"},
        "season": {"id": 1564, "startDate": "2025-08-15", "endDate": "2026-05-24", "currentMatchday": 34},
        "standings": [
            {
                "stage": "REGULAR_SEASON",
                "type": "TOTAL",
                "group": None,
                "table": [
                    {"position": 1, "team": {"id": 65, "name": "Manchester City", "shortName": "Man City", "crest": "https://crests.football-data.org/65.png"}, "playedGames": 34, "won": 25, "draw": 5, "lost": 4, "points": 80, "goalsFor": 78, "goalsAgainst": 28, "goalDifference": 50, "form": "W,W,D,W,W"},
                    {"position": 2, "team": {"id": 57, "name": "Arsenal FC", "shortName": "Arsenal", "crest": "https://crests.football-data.org/57.png"}, "playedGames": 34, "won": 24, "draw": 6, "lost": 4, "points": 78, "goalsFor": 75, "goalsAgainst": 26, "goalDifference": 49, "form": "W,W,W,L,W"},
                    {"position": 3, "team": {"id": 64, "name": "Liverpool FC", "shortName": "Liverpool", "crest": "https://crests.football-data.org/64.png"}, "playedGames": 34, "won": 22, "draw": 8, "lost": 4, "points": 74, "goalsFor": 70, "goalsAgainst": 32, "goalDifference": 38, "form": "D,W,W,D,L"},
                    {"position": 4, "team": {"id": 58, "name": "Aston Villa FC", "shortName": "Aston Villa", "crest": "https://crests.football-data.org/58.png"}, "playedGames": 34, "won": 20, "draw": 6, "lost": 8, "points": 66, "goalsFor": 66, "goalsAgainst": 48, "goalDifference": 18, "form": "W,L,W,W,D"},
                    {"position": 5, "team": {"id": 73, "name": "Tottenham Hotspur FC", "shortName": "Tottenham", "crest": "https://crests.football-data.org/73.png"}, "playedGames": 34, "won": 18, "draw": 6, "lost": 10, "points": 60, "goalsFor": 64, "goalsAgainst": 49, "goalDifference": 15, "form": "L,W,L,W,W"},
                    {"position": 6, "team": {"id": 61, "name": "Chelsea FC", "shortName": "Chelsea", "crest": "https://crests.football-data.org/61.png"}, "playedGames": 34, "won": 16, "draw": 9, "lost": 9, "points": 57, "goalsFor": 60, "goalsAgainst": 50, "goalDifference": 10, "form": "W,D,W,L,D"},
                    {"position": 7, "team": {"id": 66, "name": "Manchester United FC", "shortName": "Man United", "crest": "https://crests.football-data.org/66.png"}, "playedGames": 34, "won": 16, "draw": 6, "lost": 12, "points": 54, "goalsFor": 52, "goalsAgainst": 51, "goalDifference": 1, "form": "L,L,W,D,L"}
                ]
            }
        ]
    }
}

async def fetch_football_data(endpoint: str, ttl: int = MATCHES_CACHE_TTL) -> Dict[str, Any]:
    """
    Fetch data from football-data.org with caching and graceful mock fallback.
    """
    now = time.time()
    cache_key = f"fb_data:{endpoint}"

    if cache_key in _cache:
        timestamp, data = _cache[cache_key]
        if now - timestamp < ttl:
            return data

    api_key = getattr(settings, "FOOTBALL_DATA_API_KEY", "").strip()

    if not api_key:
        logger.info("No FOOTBALL_DATA_API_KEY configured. Returning mock data.")
        return _get_mock_fallback(endpoint)

    headers = {"X-Auth-Token": api_key}
    url = f"{BASE_URL}/{endpoint}"

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                _cache[cache_key] = (now, data)
                return data
            else:
                logger.warning(f"Football-Data.org status {response.status_code}: {response.text}")
                return _get_mock_fallback(endpoint)
    except Exception as exc:
        logger.error(f"Error connecting to Football-Data.org: {exc}")
        return _get_mock_fallback(endpoint)


def _get_mock_fallback(endpoint: str) -> Dict[str, Any]:
    """Helper to return relevant mock data based on endpoint."""
    if "matches" in endpoint:
        return MOCK_MATCHES
    elif "standings" in endpoint:
        parts = endpoint.split("/")
        code = parts[1] if len(parts) >= 2 else "PL"
        return MOCK_STANDINGS.get(code, MOCK_STANDINGS["PL"])
    return MOCK_MATCHES
