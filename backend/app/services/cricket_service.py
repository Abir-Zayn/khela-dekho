import time
import logging
from typing import Dict, Any, List
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

# CricAPI / CricketData.org Base URL
BASE_URL = "https://api.cricapi.com/v1"

_cache: Dict[str, tuple[float, Any]] = {}
CRICKET_CACHE_TTL = 30  # 30 seconds TTL cache for cricket live scores

MOCK_CRICKET_MATCHES = {
    "status": "success",
    "data": [
        {
            "id": "crick-101",
            "name": "Bangladesh vs India, 2nd ODI",
            "matchType": "odi",
            "status": "Bangladesh need 24 runs in 18 balls",
            "venue": "Sher-e-Bangla National Cricket Stadium, Dhaka",
            "date": "2026-07-24",
            "dateTimeGMT": "2026-07-24T10:30:00",
            "teams": ["Bangladesh", "India"],
            "teamInfo": [
                {
                    "name": "Bangladesh",
                    "shortname": "BAN",
                    "img": "https://g.cricapi.com/iapi/15-637877074796336584.png?w=48"
                },
                {
                    "name": "India",
                    "shortname": "IND",
                    "img": "https://g.cricapi.com/iapi/1-637877073983278553.png?w=48"
                }
            ],
            "score": [
                {
                    "r": 285,
                    "w": 7,
                    "o": 50.0,
                    "inning": "India Inning 1"
                },
                {
                    "r": 262,
                    "w": 5,
                    "o": 47.0,
                    "inning": "Bangladesh Inning 1"
                }
            ],
            "isLive": True,
            "matchStarted": True,
            "matchEnded": False
        },
        {
            "id": "crick-102",
            "name": "England vs Australia, 3rd Test - The Ashes",
            "matchType": "test",
            "status": "Day 3 - Session 2: Australia lead by 142 runs",
            "venue": "Lord's Cricket Ground, London",
            "date": "2026-07-24",
            "dateTimeGMT": "2026-07-24T10:00:00",
            "teams": ["England", "Australia"],
            "teamInfo": [
                {
                    "name": "England",
                    "shortname": "ENG",
                    "img": "https://g.cricapi.com/iapi/3-637877074127027376.png?w=48"
                },
                {
                    "name": "Australia",
                    "shortname": "AUS",
                    "img": "https://g.cricapi.com/iapi/2-637877074052955097.png?w=48"
                }
            ],
            "score": [
                {
                    "r": 345,
                    "w": 10,
                    "o": 92.4,
                    "inning": "Australia Inning 1"
                },
                {
                    "r": 289,
                    "w": 10,
                    "o": 84.1,
                    "inning": "England Inning 1"
                },
                {
                    "r": 86,
                    "w": 2,
                    "o": 26.0,
                    "inning": "Australia Inning 2"
                }
            ],
            "isLive": True,
            "matchStarted": True,
            "matchEnded": False
        },
        {
            "id": "crick-103",
            "name": "Pakistan vs South Africa, 1st T20I",
            "matchType": "t20",
            "status": "Pakistan won by 6 wickets",
            "venue": "Gaddafi Stadium, Lahore",
            "date": "2026-07-24",
            "dateTimeGMT": "2026-07-24T14:00:00",
            "teams": ["South Africa", "Pakistan"],
            "teamInfo": [
                {
                    "name": "South Africa",
                    "shortname": "SA",
                    "img": "https://g.cricapi.com/iapi/4-637877074189381666.png?w=48"
                },
                {
                    "name": "Pakistan",
                    "shortname": "PAK",
                    "img": "https://g.cricapi.com/iapi/5-637877074251025555.png?w=48"
                }
            ],
            "score": [
                {
                    "r": 178,
                    "w": 6,
                    "o": 20.0,
                    "inning": "South Africa Inning 1"
                },
                {
                    "r": 182,
                    "w": 4,
                    "o": 18.4,
                    "inning": "Pakistan Inning 1"
                }
            ],
            "isLive": False,
            "matchStarted": True,
            "matchEnded": True
        },
        {
            "id": "crick-104",
            "name": "West Indies vs Sri Lanka, 3rd T20I",
            "matchType": "t20",
            "status": "Match starts at 19:30 GMT",
            "venue": "Kensington Oval, Barbados",
            "date": "2026-07-24",
            "dateTimeGMT": "2026-07-24T19:30:00",
            "teams": ["West Indies", "Sri Lanka"],
            "teamInfo": [
                {
                    "name": "West Indies",
                    "shortname": "WI",
                    "img": "https://g.cricapi.com/iapi/6-637877074311025555.png?w=48"
                },
                {
                    "name": "Sri Lanka",
                    "shortname": "SL",
                    "img": "https://g.cricapi.com/iapi/7-637877074371025555.png?w=48"
                }
            ],
            "score": [],
            "isLive": False,
            "matchStarted": False,
            "matchEnded": False
        }
    ]
}

async def fetch_cricket_matches() -> Dict[str, Any]:
    """
    Fetch current cricket matches from CricketData.org / CricAPI with caching and mock fallback.
    """
    now = time.time()
    cache_key = "cricket:current_matches"

    if cache_key in _cache:
        timestamp, data = _cache[cache_key]
        if now - timestamp < CRICKET_CACHE_TTL:
            return data

    api_key = getattr(settings, "CRICKET_DATA_API_KEY", "").strip()

    if not api_key:
        logger.info("No CRICKET_DATA_API_KEY configured. Returning mock cricket data.")
        return MOCK_CRICKET_MATCHES

    url = f"{BASE_URL}/currentMatches?apikey={api_key}&offset=0"

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(url)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success" and data.get("data"):
                    _cache[cache_key] = (now, data)
                    return data
                else:
                    logger.warning(f"Cricket API response status note: {data.get('reason', 'Unknown reason')}")
                    return MOCK_CRICKET_MATCHES
            else:
                logger.warning(f"Cricket API returned HTTP {response.status_code}")
                return MOCK_CRICKET_MATCHES
    except Exception as exc:
        logger.error(f"Error connecting to CricketData.org: {exc}")
        return MOCK_CRICKET_MATCHES
