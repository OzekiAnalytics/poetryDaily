let poems = [];
let schedule = {};

let currentDate = null;


/* ---------- load data ---------- */

async function loadData() {

    const poemsResponse = await fetch("poems.json");
    poems = await poemsResponse.json();

    const scheduleResponse = await fetch("schedule.json");
    schedule = await scheduleResponse.json();

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

    return d.toISOString().slice(0, 10);

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

    if (window.location.hash.length > 1) {

        currentDate = window.location.hash.substring(1);

    } else {

        currentDate = todayString();

        history.replaceState(
            null,
            "",
            "#" + currentDate
        );

    }

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

        return;
    }

    const poem = poems[poemIndex];

    document.title = `${poem.title} — ${poem.author}`;

    document.getElementById("title").textContent = poem.title;
    document.getElementById("author").textContent = poem.author;
    document.getElementById("date").textContent = currentDate;
    document.getElementById("poem").textContent = poem.text;

}


/* ---------- navigation ---------- */

document.getElementById("prev").onclick = () => {

    const d = new Date(currentDate);

    d.setDate(d.getDate() - 1);

    setDate(formatDate(d));

};


document.getElementById("next").onclick = () => {

    const d = new Date(currentDate);

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