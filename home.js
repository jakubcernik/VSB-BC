let currentLang = localStorage.getItem('lang') || 'cz';

// ─── Dictionary ────────────────────────────────────────────────────────────────

const homeDict = {
    en: {
        pageTitle:   'Algorithm Visualizer',
        title:       'Algorithm Visualizer',
        subtitle:    'Pick an algorithm to explore its theory and interactive simulation.',
        footer:      '2026 by Jakub Cernik. Developed for educational purposes as a Bachelor Thesis.',

        tagAvailable: 'Available',
        tagSoon:      'Coming Soon',
        chipLocked:   'Not yet available',
        chipSim:      '⚙️ Simulation',
        chipTheory:   '📖 Theory',

        algoTitle1: 'Dynamic Array — vector<>',
        algoDesc1:  'Explore how a dynamic array grows automatically and learn why repeated push_back runs in amortized O(1) using the coin-based accounting method.',

        algoTitle2: 'Binary Counter',
        algoDesc2:  'Explore how a k-bit binary counter increments and learn why N increments cost only O(N) total — amortized O(1) each — using the coin-based accounting method.',

        algoTitle3: 'Hash Table',
        algoDesc3:  'Explore how a key-value hash table resizes and learn why repeated INSERT operations run in amortized O(1) using the coin-based accounting method.',
    },
    cz: {
        pageTitle:   'Vizualizér algoritmů',
        title:       'Vizualizér algoritmů',
        subtitle:    'Vyber si algoritmus a prozkoumej jeho teorii i interaktivní simulaci.',
        footer:      '2026 by Jakub Cernik. Vyvinuto pro vzdělávací účely jako bakalářská práce.',

        tagAvailable: 'Dostupné',
        tagSoon:      'Připravujeme',
        chipLocked:   'Zatím nedostupné',
        chipSim:      '⚙️ Simulace',
        chipTheory:   '📖 Teorie',

        algoTitle1: 'Dynamické pole — vector<>',
        algoDesc1:  'Prozkoumej, jak se dynamické pole automaticky zvětšuje, a pochop proč opakovaný push_back běží v amortizovaném O(1) pomocí mincové účetní metody.',

        algoTitle2: 'Binární čítač',
        algoDesc2:  'Prozkoumej, jak k-bitový binární čítač inkrementuje, a pochop proč N inkrementací stojí celkem O(N) — amortizovaně O(1) každá — pomocí mincové účetní metody.',

        algoTitle3: 'Hash tabulka',
        algoDesc3:  'Prozkoumej, jak se key-value hash tabulka zvětšuje (resize/rehash), a pochop proč opakované operace INSERT běží v amortizovaném O(1) pomocí mincové účetní metody.',
    }
};

// ─── Theme & Language ─────────────────────────────────────────────────────────

function reloadWithTransition(beforeReload) {
    const overlay = document.getElementById('pageTransitionOverlay');
    overlay.classList.add('visible');
    setTimeout(() => {
        if (beforeReload) beforeReload();
        window.location.reload();
    }, 350);
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    reloadWithTransition(() => localStorage.setItem('theme', isDark ? 'light' : 'dark'));
}

function applyTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    if (saved === 'dark') document.body.classList.add('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    document.getElementById('themeOptLight').classList.toggle('active', !isDark);
    document.getElementById('themeOptDark').classList.toggle('active', isDark);
}

function toggleLanguage() {
    const next = currentLang === 'cz' ? 'en' : 'cz';
    reloadWithTransition(() => localStorage.setItem('lang', next));
}

function updateLangToggleUI() {
    document.getElementById('langOptCZ').classList.toggle('active', currentLang === 'cz');
    document.getElementById('langOptEN').classList.toggle('active', currentLang === 'en');
}

// ─── Navigation with page transition ─────────────────────────────────────────

function navigateHome(event, url) {
    event.preventDefault();
    const overlay = document.getElementById('pageTransitionOverlay');
    overlay.classList.add('visible');
    setTimeout(() => { window.location.href = url; }, 350);
}

// ─── Apply language ───────────────────────────────────────────────────────────

function applyLanguage() {
    const d = homeDict[currentLang];

    document.title = d.pageTitle;
    document.getElementById('homeTitle').textContent    = d.title;
    document.getElementById('homeSubtitle').textContent = d.subtitle;
    document.getElementById('footerText').textContent   = d.footer;

    // Cards: this project currently shows all 3 as available.
    // Keep null-guards so future card variants ("Coming soon") don't break the page.
    const tagAv1 = document.getElementById('tagAvailable1');
    const tagAv2 = document.getElementById('tagAvailable2');
    const tagAv3 = document.getElementById('tagAvailable3');
    if (tagAv1) tagAv1.textContent = d.tagAvailable;
    if (tagAv2) tagAv2.textContent = d.tagAvailable;
    if (tagAv3) tagAv3.textContent = d.tagAvailable;

    const tagSoon3 = document.getElementById('tagSoon3');
    const chipLocked3 = document.getElementById('chipLocked3');
    if (tagSoon3) tagSoon3.textContent = d.tagSoon;
    if (chipLocked3) chipLocked3.textContent = d.chipLocked;
    document.getElementById('chip1Sim').textContent      = d.chipSim;
    document.getElementById('chip1Theory').textContent   = d.chipTheory;
    document.getElementById('chip2Sim').textContent      = d.chipSim;
    document.getElementById('chip2Theory').textContent   = d.chipTheory;

    document.getElementById('algoTitle1').innerHTML = `${d.algoTitle1}`;
    document.getElementById('algoDesc1').textContent  = d.algoDesc1;
    document.getElementById('algoTitle2').textContent = d.algoTitle2;
    document.getElementById('algoDesc2').textContent  = d.algoDesc2;
    document.getElementById('algoTitle3').textContent = d.algoTitle3;
    document.getElementById('algoDesc3').textContent  = d.algoDesc3;

    updateLangToggleUI();
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    applyLanguage();
});

window.addEventListener('load', () => {
    document.body.classList.add('page-loaded');
});

