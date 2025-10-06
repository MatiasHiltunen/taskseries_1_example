'use strict';

// 0) Pieni apu
const selectElement = (sel, root = document) => root.querySelector(sel);


// 1) Teema — virhe: localStorage avain sekoilee, event listener duplikoituu
const themeBtn = selectElement('#themeToggle');
const THEME_KEY = 'theme-preference';

function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
}

function saveTheme(t) {
    localStorage.setItem(THEME_KEY, t);
}

// BUG: key typo
function loadTheme() {
    const theme = localStorage.getItem(THEME_KEY) || 'light';

    return theme
}

function toggleTheme() {

    const currentTheme = loadTheme()

    let theme

    if (currentTheme === 'light') {
        theme = 'dark'
    } else {
        theme = 'light'
    }


    applyTheme(theme);
    saveTheme(theme);
}

// BUG: tuplalistener
themeBtn.addEventListener('click', () => toggleTheme());
/* themeBtn.addEventListener('click', () => toggleTheme()); */
applyTheme(loadTheme());


// 2) Haku — virhe: väärä API-osoite + virheenkäsittely puuttuu
const form = selectElement('#searchForm');
const resultsEl = selectElement('#results');
const statusEl = selectElement('#status');

// Coffee http-rajapinnan dokumentaatio: https://sampleapis.com/api-list/coffee
async function searchImages(query) {

    // const url = `https://api.sampleapis.com/coffee/${query}`; // BUG: ei vastaa hakusanaan

    const url = `https://api.finna.fi/api/v1/search?lookfor=${query}&type=Subject%2CTitle&sort=relevance&page=1&limit=5&lng=fi`

    const res = await fetch(url);
    const data = await res.json();

    if (data.error != null) {
        throw new Error(data?.message ?? 'Tapahtui virhe')
    }


    return data.records


    //return data.slice(0, 8).map(x => ({ title: x.title || query, url: x.image }));

}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = selectElement('#q').value.trim();
    statusEl.textContent = 'Ladataan…';

    try {


        const items = await searchImages(q); // BUG: ei try/catch, ks. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch

        resultsEl.innerHTML = '';

        items.forEach(item => {

            const li = document.createElement('li');

            li.className = 'card';

            li.innerHTML = `<strong>${item.title} ${item.year}</strong>`;


            resultsEl.appendChild(li);

        });
        statusEl.textContent = `${items.length} tulosta`;

    } catch (error) {

        statusEl.textContent = `Tapahtui virhe :( - ${error}`

    }

});

// 3) Laskuri — virhe: event delegation ja bubbling sekoilee
const counterBtn = selectElement('.counter');
counterBtn.addEventListener('click', (e) => {
    if (e.target.classList.contains('count')) return; // BUG: estää klikin
    const span = selectElement('.count', counterBtn);
    span.textContent = String(parseInt(span.textContent, 10) + 1);
});

// 4) Clipboard — virhe: ei permissioiden / https tarkistusta
selectElement('#copyBtn').addEventListener('click', async () => {
    const text = selectElement('#copyBtn').dataset.text;
    await navigator.clipboard.writeText(text); // BUG: voi heittää virheen
    alert('Kopioitu!');
});

// 5) IntersectionObserver — virhe: threshold/cleanup puuttuu
const box = document.querySelector('.observe-box');


/* function onIntersection(entries, observer) {

    entries.forEach(entry => {
        if (entry.intersectionRatio > 0.25) {

            console.log("Nyt suorittui tämä koodi")

            box.textContent = 'Näkyvissä!';

            observer.disconnect()

        } else {
            console.log("Nyt ei pitäisi näkyä")s
        }

    });

} */

const io = new IntersectionObserver((entries, observer) => {

    entries.forEach(entry => {
        if (entry.intersectionRatio > 0.25) {

            console.log("Nyt suorittui tämä koodi")

            box.textContent = 'Näkyvissä!';

            observer.disconnect()

        } else {
            console.log("Nyt ei pitäisi näkyä")
        }

    });

}, {
    threshold: 0.5
});


io.observe(box);