from flask import Flask, request
from datetime import date, timedelta
import sqlite3

from poemlib import get_poem_of_day

app = Flask(__name__)

DB = "subscribers.db"


def init_db():
    conn = sqlite3.connect(DB)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS subscribers (
            email TEXT PRIMARY KEY
        )
    """)

    conn.commit()
    conn.close()


init_db()


def render_poem(poem, current_date):
    prev_day = (current_date - timedelta(days=1)).isoformat()
    next_day = (current_date + timedelta(days=1)).isoformat()

    return f"""
    <!doctype html>

    <html>

    <head>
        <title>{poem['title']}</title>
    </head>

    <body style="
        max-width:700px;
        margin:40px auto;
        font-family:Georgia,serif;
        line-height:1.6;
    ">

    <h1>{poem['title']}</h1>

    <h2>{poem['author']}</h2>

    <p><em>{current_date.isoformat()}</em></p>

    <p>
        <a href="/date/{prev_day}">&laquo; Previous Day</a>
        |
        <a href="/">Today</a>
        |
        <a href="/date/{next_day}">Next Day &raquo;</a>
    </p>

    <hr>

    <pre style="font-family:Georgia,serif;white-space:pre-wrap;font-size:18px;">
{poem['text']}
    </pre>

    <hr>

    <h3>Subscribe for the Daily Poem</h3>

    <form action="/subscribe" method="post">

        <input
            type="email"
            name="email"
            placeholder="your@email.com"
            required
            style="padding:8px;width:250px;">

        <button type="submit">
            Subscribe
        </button>

    </form>

    </body>
    </html>
    """


@app.route("/")
def home():

    today = date.today()

    poem = get_poem_of_day(today)

    return render_poem(poem, today)


@app.route("/date/<d>")
def by_date(d):

    current_date = date.fromisoformat(d)

    poem = get_poem_of_day(current_date)

    return render_poem(poem, current_date)


@app.route("/subscribe", methods=["POST"])
def subscribe():

    email = request.form["email"].strip().lower()

    conn = sqlite3.connect(DB)

    conn.execute(
        "INSERT OR IGNORE INTO subscribers(email) VALUES (?)",
        (email,)
    )

    conn.commit()
    conn.close()

    return """
    <h2>Thanks for subscribing!</h2>

    <p>Your email has been saved.</p>

    <p><a href="/">Return to today's poem</a></p>
    """


if __name__ == "__main__":
    app.run(debug=True)
