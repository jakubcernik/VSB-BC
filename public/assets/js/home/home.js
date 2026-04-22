let currentLang = localStorage.getItem('lang') || 'cz';

// ─── Dictionary ────────────────────────────────────────────────────────────────

const homeDict = {
    en: {
        pageTitle:   'Algorithm Visualizer',
        title:       'Algorithm Visualizer',
        subtitle:    'Pick an algorithm to explore its theory and interactive simulation.',
        footer:      '2026 by Jakub Cernik. Developed for educational purposes as a Bachelor Thesis.',

        // (tags/chips removed from home cards)

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

        // (tagy/chipy odstraněny z domovských karet)

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

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function setHtml(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}

// ─── Apply language ───────────────────────────────────────────────────────────

function applyLanguage() {
    const d = homeDict[currentLang];

    document.title = d.pageTitle;
    setText('homeTitle', d.title);
    setText('homeSubtitle', d.subtitle);
    setText('footerText', d.footer);

    // Cards: tags/chips were removed from the Home page UI.

    setHtml('algoTitle1', d.algoTitle1);
    setText('algoDesc1', d.algoDesc1);
    setText('algoTitle2', d.algoTitle2);
    setText('algoDesc2', d.algoDesc2);
    setText('algoTitle3', d.algoTitle3);
    setText('algoDesc3', d.algoDesc3);

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

