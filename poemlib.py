import json
import hashlib
from datetime import date

with open("poems.json", encoding="utf-8") as f:
    POEMS = json.load(f)


def get_poem_of_day(day=None):
    if day is None:
        day = date.today()

    if isinstance(day, str):
        day = date.fromisoformat(day)

    seed = day.isoformat()

    idx = int(hashlib.sha256(seed.encode()).hexdigest(), 16) % len(POEMS)

    return POEMS[idx]