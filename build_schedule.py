import json
import hashlib
from datetime import date, timedelta
from pathlib import Path


HERE = Path(__file__).resolve().parent

POEMS_FILE = HERE / "docs" / "poems.json"
OUTPUT_FILE = HERE / "docs" / "schedule.json"


with open(POEMS_FILE, encoding="utf-8") as f:
    poems = json.load(f)


num_poems = len(poems)

schedule = {}

start = date(2020, 1, 1)
end = date(2050, 12, 31)

d = start

while d <= end:

    idx = (
        int(
            hashlib.sha256(
                d.isoformat().encode()
            ).hexdigest(),
            16
        )
        % num_poems
    )

    schedule[d.isoformat()] = idx

    d += timedelta(days=1)


with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        schedule,
        f,
        indent=2
    )

print(f"Wrote {len(schedule):,} scheduled dates.")
print(f"Using {num_poems} poems.")
