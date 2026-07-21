import json
import hashlib
from datetime import date
from pathlib import Path
import random

HERE = Path(__file__).resolve().parent

with open(HERE / "poems.json", encoding="utf-8") as f:
    POEMS = json.load(f)


def get_poem_of_day(day=None):
    if day is None:
        day = date.today()

    if isinstance(day, str):
        day = date.fromisoformat(day)

    seed = day.isoformat()

    idx = (
        int(hashlib.sha256(seed.encode()).hexdigest(), 16)
        % len(POEMS)
    )

    return POEMS[idx]


def get_random_poem(author=None):
    poems = POEMS

    if author is not None:
        poems = [
            p
            for p in POEMS
            if p["author"].lower() == author.lower()
        ]

        if not poems:
            raise ValueError(f"No poems by {author}")

    return random.choice(poems)
