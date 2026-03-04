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

        algoTitle2: 'Algorithm 2',
        algoDesc2:  'This algorithm is currently being prepared. Check back later.',

        algoTitle3: 'Algorithm 3',
        algoDesc3:  'This algorithm is currently being prepared. Check back later.',
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

        algoTitle2: 'Algoritmus 2',
        algoDesc2:  'Tento algoritmus se právě připravuje. Brzy bude dostupný.',

        algoTitle3: 'Algoritmus 3',
        algoDesc3:  'Tento algoritmus se právě připravuje. Brzy bude dostupný.',
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

    document.getElementById('tagAvailable1').textContent = d.tagAvailable;
    document.getElementById('tagSoon2').textContent      = d.tagSoon;
    document.getElementById('tagSoon3').textContent      = d.tagSoon;
    document.getElementById('chipLocked2').textContent   = d.chipLocked;
    document.getElementById('chipLocked3').textContent   = d.chipLocked;
    document.getElementById('chip1Sim').textContent      = d.chipSim;
    document.getElementById('chip1Theory').textContent   = d.chipTheory;

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

