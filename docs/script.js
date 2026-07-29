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

    lines.forEach((line, i) => {

        const li = document.createElement("li");

        const header = document.createElement("div");
        header.className = "analysis-line-header";
        header.textContent = line.text.trim() === ""
            ? `Line ${i + 1}`
            : `Line ${i + 1} — ${line.syllable_count} syllable${line.syllable_count === 1 ? "" : "s"}`;

        li.appendChild(header);

        const body = document.createElement("div");
        body.className = "analysis-line-body";

        if (line.text.trim() === "") {

            body.textContent = "—";

        } else {

            line.words.forEach((word, wi) => {
                body.appendChild(renderWord(word));
                if (wi < line.words.length - 1) {
                    body.append(" ");
                }
            });

        }

        li.appendChild(body);
        linesEl.appendChild(li);

    });

}


function renderWord(word) {

    const wrapper = document.createElement("span");
    wrapper.className = "analysis-word";

    if (word.stress === null) {

        wrapper.classList.add("syl-unknown");
        wrapper.title = "not in dictionary";
        wrapper.textContent = word.word;

        return wrapper;

    }

    for (const chunk of word.chunks) {

        const span = document.createElement("span");
        span.className = "syl syl-" + (chunk.stress === 1 ? "primary" : chunk.stress === 2 ? "secondary" : "unstressed");

        if (chunk.approx) {
            span.classList.add("syl-approx");
            span.title = "approximate — syllable boundary uncertain";
        }

        span.textContent = chunk.text;
        wrapper.appendChild(span);

    }

    return wrapper;

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
