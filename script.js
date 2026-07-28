let poems = [];
let schedule = {};

let currentDate = null;


/* ------------------------------ */

async function loadData() {

    const poemsResponse =
        await fetch("poems.json");

    poems =
        await poemsResponse.json();

    const scheduleResponse =
        await fetch("schedule.json");

    schedule =
        await scheduleResponse.json();

    initialize();

}


/* ------------------------------ */

function initialize() {

    if (window.location.hash.length > 1) {

        currentDate =
            window.location.hash.substring(1);

    }

    else {

        currentDate =
            todayString();

        window.location.hash =
            currentDate;

    }

    render();

}


/* ------------------------------ */

function render() {

    const poemIndex =
        schedule[currentDate];

    if (poemIndex === undefined) {

        document.getElementById("title").textContent =
            "No poem scheduled.";

        return;

    }

    const poem =
        poems[poemIndex];

    document.title =
        `${poem.title} — ${poem.author}`;

    document.getElementById("title").textContent =
        poem.title;

    document.getElementById("author").textContent =
        poem.author;

    document.getElementById("date").textContent =
        currentDate;

    document.getElementById("poem").textContent =
        poem.text;

}


/* ------------------------------ */

function todayString() {

    return new Date()
        .toISOString()
        .slice(0, 10);

}


/* ------------------------------ */

function shiftDate(days) {

    const d =
        new Date(currentDate);

    d.setDate(
        d.getDate() + days
    );

    currentDate =
        d.toISOString().slice(0, 10);

    window.location.hash =
        currentDate;

    render();

}


/* ------------------------------ */

document
    .getElementById("prev")
    .onclick = () => shiftDate(-1);

document
    .getElementById("next")
    .onclick = () => shiftDate(1);

document
    .getElementById("today")
    .onclick = () => {

        currentDate =
            todayString();

        window.location.hash =
            currentDate;

        render();

    };


/* ------------------------------ */

window.addEventListener(
    "hashchange",
    () => {

        currentDate =
            window.location.hash.substring(1);

        render();

    }
);


/* ------------------------------ */

loadData();
