let poems = [];
let schedule = {};
let analysisData = {};

let currentDate = null;


/* ---------- load data ---------- */

async function loadData() {

    const poemsResponse = await fetch("poems.json");
    poems = await poemsResponse.json();

    const scheduleResponse = await fetch("schedule.json");
    schedule = await scheduleResponse.json();

    const analysisResponse = await fetch("analysis.json");
    analysisData = await analysisResponse.json();

    initialize();
}


/* ---------- helpers ---------- */

function todayString() {

    const now = new Date();

    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
}


function formatDate(d) {

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${y}-${m}-${day}`;

}


// new Date("2026-07-28") parses the string as UTC midnight, which is
// still the *previous* day in any timezone behind UTC (e.g. US timezones).
// Parsing the parts manually keeps everything in local time instead.
function parseLocalDate(dateString) {

    const [y, m, d] = dateString.split("-").map(Number);

    return new Date(y, m - 1, d);

}


function renderDeviceDate(today) {

    const el = document.getElementById("device-date");

    if (!el) return;

    const formatted = parseLocalDate(today).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    el.textContent = `Your device's date: ${formatted}`;

}


function setDate(dateString, replace = false) {

    currentDate = dateString;

    if (replace) {
        history.replaceState(null, "", "#" + currentDate);
    } else {
        history.pushState(null, "", "#" + currentDate);
    }

    render();

}


/* ---------- startup ---------- */

function initialize() {

    const today = todayString();
    const lastKnownToday = localStorage.getItem("pd-last-known-today");

    if (window.location.hash.length > 1 && lastKnownToday === today) {

        // Same calendar day as this browser's last visit — trust the
        // hash, since it might be mid-navigation to another day.
        currentDate = window.location.hash.substring(1);

    } else {

        // Either there's no hash yet, or the day has rolled over since
        // this browser last opened the app. In both cases default to
        // today, so the site never gets stuck showing a stale date.
        currentDate = today;

        history.replaceState(
            null,
            "",
            "#" + currentDate
        );

    }

    localStorage.setItem("pd-last-known-today", today);

    renderDeviceDate(today);

    render();

}


/* ---------- render ---------- */

function render() {

    const poemIndex = schedule[currentDate];

    if (poemIndex === undefined) {

        document.getElementById("title").textContent = "No poem scheduled";
        document.getElementById("author").textContent = "";
        document.getElementById("date").textContent = currentDate;
        document.getElementById("poem").textContent = "";
        renderAnalysisUnavailable();

        return;
    }

    const poem = poems[poemIndex];

    document.title = `${poem.title} — ${poem.author}`;

    document.getElementById("title").textContent = poem.title;
    document.getElementById("author").textContent = poem.author;
    document.getElementById("date").textContent = currentDate;
    document.getElementById("poem").textContent = poem.text;

    loadAnalysis(poem.slug);

}


/* ---------- analysis panel ---------- */

function renderAnalysisUnavailable() {

    document.getElementById("analysis-status").textContent =
        "No breakdown available.";
    document.getElementById("analysis-status").style.display = "block";
    document.getElementById("analysis-lines").innerHTML = "";

}


function loadAnalysis(slug) {

    const statusEl = document.getElementById("analysis-status");
    const linesEl = document.getElementById("analysis-lines");

    const lines = analysisData[slug];

    if (!lines) {
        renderAnalysisUnavailable();
        return;
    }

    statusEl.style.display = "none";
    linesEl.innerHTML = "";

    for (const line of lines) {

        const li = document.createElement("li");

        if (line.text.trim() === "") {
            li.className = "blank-line";
            li.textContent = "—";
            linesEl.appendChild(li);
            continue;
        }

        const wordsSpan = document.createElement("span");
        wordsSpan.className = "analysis-words";

        for (const word of line.words) {
            wordsSpan.appendChild(renderWord(word));
        }

        const countSpan = document.createElement("span");
        countSpan.className = "syllable-count";
        countSpan.textContent =
            `${line.syllable_count} syll${line.syllable_count === 1 ? "" : "s"}`;

        li.appendChild(wordsSpan);
        li.appendChild(countSpan);
        linesEl.appendChild(li);

    }

}


function renderWord(word) {

    const span = document.createElement("span");
    span.className = "analysis-word";
    span.title = word.word;

    if (word.stress === null) {

        span.append(dot("s-unk", "?"));

    } else {

        for (const s of word.stress) {

            if (s === 1) span.append(dot("s1", "●"));
            else if (s === 2) span.append(dot("s2", "◐"));
            else span.append(dot("s0", "·"));

        }

    }

    span.append(" " + word.word);

    return span;

}


function dot(cls, char) {

    const d = document.createElement("span");
    d.className = "stress-dot " + cls;
    d.textContent = char;
    return d;

}


/* ---------- navigation ---------- */

document.getElementById("prev").onclick = () => {

    const d = parseLocalDate(currentDate);

    d.setDate(d.getDate() - 1);

    setDate(formatDate(d));

};


document.getElementById("next").onclick = () => {

    const d = parseLocalDate(currentDate);

    d.setDate(d.getDate() + 1);

    setDate(formatDate(d));

};


document.getElementById("today").onclick = () => {

    setDate(todayString());

};


window.addEventListener("popstate", () => {

    if (window.location.hash.length > 1) {

        currentDate = window.location.hash.substring(1);

        render();

    }

});


window.addEventListener("hashchange", () => {

    if (window.location.hash.length > 1) {

        currentDate = window.location.hash.substring(1);

        render();

    }

});


loadData();
