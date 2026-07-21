from pathlib import Path
from datetime import date, timedelta

from poemlib import get_poem_of_day

DOCS = Path("docs")


def render_poem(poem, current_date):
    prev_day = (current_date - timedelta(days=1)).isoformat()
    next_day = (current_date + timedelta(days=1)).isoformat()

    return f"""<!doctype html>
<html>
<head>
<meta charset="utf-8">

<title>{poem["title"]} — {poem["author"]}</title>

<style>

body {{
    max-width: 760px;
    margin: 60px auto;
    padding: 0 20px;
    font-family: Georgia, serif;
    line-height: 1.65;
    color: #222;
}}

h1 {{
    margin-bottom: .2em;
}}

h2 {{
    margin-top: 0;
    color: #666;
    font-weight: normal;
}}

nav {{
    margin: 2em 0;
}}

nav a {{
    margin-right: 1em;
}}

pre {{
    white-space: pre-wrap;
    font-family: Georgia, serif;
    font-size: 1.1em;
    line-height: 1.65;
}}

footer {{
    margin-top: 4em;
    color: #888;
    font-size: .9em;
}}

</style>

</head>

<body>

<h1>{poem["title"]}</h1>

<h2>{poem["author"]}</h2>

<p><em>{current_date.isoformat()}</em></p>

<nav>
<a href="../../date/{prev_day}/">&laquo; Previous Day</a>
<a href="../../">Today</a>
<a href="../../date/{next_day}/">Next Day &raquo;</a>
</nav>

<pre>{poem["text"]}</pre>

<hr>

<p>
Daily poems.<br>
Email subscriptions coming soon.
</p>

<footer>
Public domain texts from Standard Ebooks.
</footer>

</body>
</html>
"""


def build_day(day):
    poem = get_poem_of_day(day)

    folder = DOCS / "date" / day.isoformat()
    folder.mkdir(parents=True, exist_ok=True)

    (folder / "index.html").write_text(
        render_poem(poem, day),
        encoding="utf-8"
    )


def build_today():
    today = date.today()

    poem = get_poem_of_day(today)

    html = render_poem(poem, today)

    html = html.replace("../../", "")

    (DOCS / "index.html").write_text(
        html,
        encoding="utf-8"
    )


def main():

    DOCS.mkdir(exist_ok=True)

    start = date(2000, 1, 1)
    end = date(2050, 12, 31)

    d = start

    while d <= end:
        print(d)

        build_day(d)

        d += timedelta(days=1)

    build_today()

    print("Website generated.")


if __name__ == "__main__":
    main()
