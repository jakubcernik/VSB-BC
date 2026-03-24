/* bc-ui.js – UI helpers & i18n for the Binary Counter page.
   Mirrors the structure of ui.js (for vector) but is completely self-contained.
*/

let currentLang = localStorage.getItem('lang') || 'cz';

// ─── Animation speed ───────────────────────────────────────────────────────────
const animationDelay = 1;
function getDelay(base = 1) {
    const m = { 1: 4, 2: 2, 3: 1, 4: 0.4, 5: 0.15 };
    return Math.round(base * (m[animationDelay] || 1));
}

// ─── Dictionary ────────────────────────────────────────────────────────────────
const dict = {
    en: {
        pageTitle:        'Amortized complexity — Binary Counter',
        pageNavHome:      'Home',
        pageNavSim:       'Simulation',
        pageNavTheory:    'Theory',
        manual:           'Manual',
        random:           'Random',
        best:             'Best Case',
        worst:            'Worst Case',
        btnIncrement:     '+ Increment',
        btnReset:         '↺ Reset',
        randomModeTitle:  'Random Mode',
        randomCountLabel: 'Count:',
        randomCountPH:    'Count',
        btnGenRandom:     'Generate',
        bestCaseTitle:    'Best Case',
        worstCaseTitle:   'Worst Case',
        bitLengthLabel:   'Bit length:',
        bitLengthHint:    'Default 8 bits is for clarity; you can change it.',
        coins:            'Coins',
        steps:            'Steps',
        bankLabel:        'Operation charge (2 coins)',
        willAppear:       'will appear here.',
        footer:           '2026 by Jakub Cernik. Developed for educational purposes as a Bachelor Thesis.',
        value:            'Value',
        invalidInput:     'Please enter a valid positive integer.',

        // --- Validation (shared) ---
        validationEmpty: 'Please fill out the field.',
        validationNotInteger: 'Please enter an integer.',
        validationOutOfRange: (min, max) => `Please enter a value in range ${min}–${max}.`,
        validationMinGreaterThanMax: 'Minimum must not be greater than maximum.',

        bestCaseDesc: `The <strong>Best Case</strong> occurs when the least-significant bit is <strong class="highlight-green">0</strong>.
            Only that single bit is flipped from 0→1 and one coin is spent.
            Use <em>Next Variant</em> to see different values with the same best-case behavior.
            <br><br>Complexity: <strong class="badge">O(1)</strong>`,

        worstCaseDesc: `The <strong>Worst Case</strong> occurs when all bits are <strong class="highlight-red">1</strong>
            (counter value = 2<sup>k</sup>−1). Then all k bits are flipped, because carry propagates from the least-significant bit through all positions.
            The time for this single increment is O(k), equivalently O(log N).
            Use <em>Next Variant</em> to compare different carry depths and the full worst case.
            <br><br>Amortized complexity still: <strong class="badge">O(1)</strong>`,

        btnNextVariant:   'Next Variant',

        bestReady:  (val, variant, total) => `Best Case variant ${variant}/${total} prepared — counter is ${val} (LSB = 0). Next increment flips only 1 bit.`,
        worstReady: (k, variant, total, isFullWorst = false) => isFullWorst
            ? `Worst Case variant ${variant}/${total} prepared — counter is 2^${k}−1 (all ${k} bits = 1). Next increment flips all bits.`
            : `Carry-depth variant ${variant}/${total} prepared — counter ends with ${k} trailing 1-bits. Next increment flips ${k + 1} bits.`,

        // Log messages
        incrTitle:      (from, to) => `Increment <span class="log-badge slot">${from}</span> → <span class="log-badge slot">${to}</span>`,
        flipZeroToOne:  (pos)      => `Bit <span class="log-badge slot">[${pos}]</span> flipped <span class="log-badge capacity">0 → 1</span> — <span class="coin-text">1 coin spent</span>, <span class="coin-text">1 coin saved</span>`,
        flipOneToZero:  (pos)      => `Bit <span class="log-badge slot">[${pos}]</span> flipped <span class="log-badge capacity">1 → 0</span> — <span class="coin-text">1 saved coin spent</span>`,
        earned:         'received',
        spent:          'spent',
        saved:          'saved on bits',
        allocCoins:     ()         => `INCREMENT starts: received <span class="coin-text">2 coins</span> (fixed amortized charge — always exactly 2, no matter how many bits flip)`,
        spendSelf:      (pos)      => `Bit <span class="log-badge slot">[${pos}]</span>: spent <span class="coin-text">1 coin</span> from the 2 received → flipped 0→1`,
        saveCoin:       (pos)      => `Bit <span class="log-badge slot">[${pos}]</span>: saved <span class="coin-text">1 coin</span> on this bit (reserve for future 1→0 flip)`,
        spendSaved:     (pos)      => `Bit <span class="log-badge slot">[${pos}]</span>: spent <span class="coin-text">1 saved coin</span> (was saved here earlier) → flipped 1→0. No new coins needed!`,
        incrDone:       (flips)    => `Done — <strong>${flips}</strong> bit${flips !== 1 ? 's' : ''} flipped`,
        groupLabel:     (from, to, step) => `Step ${step} — increment ${from} → ${to}`,
        logStep:        (n)        => `Step ${n}`,
        randomGenerating: (n)      => `Generating <strong>${n}</strong> increments…`,
        randomDone:     (n)        => `Done — performed <strong>${n}</strong> increments`,
    },
    cz: {
        pageTitle:        'Amortizovaná složitost — Binární čítač',
        pageNavHome:      'Domů',
        pageNavSim:       'Simulace',
        pageNavTheory:    'Teorie',
        manual:           'Manuálně',
        random:           'Náhodně',
        best:             'Nejlepší případ',
        worst:            'Nejhorší případ',
        btnIncrement:     '+ Inkrementovat',
        btnReset:         '↺ Reset',
        randomModeTitle:  'Náhodný režim',
        randomCountLabel: 'Počet:',
        randomCountPH:    'Počet',
        btnGenRandom:     'Generovat',
        bestCaseTitle:    'Nejlepší případ',
        worstCaseTitle:   'Nejhorší případ',
        bitLengthLabel:   'Délka čítače:',
        bitLengthHint:    'Výchozích 8 bitů je pro názornost; délku lze změnit.',
        coins:            'Mince',
        steps:            'Kroky',
        bankLabel:        'Poplatek za operaci (2 mince)',
        willAppear:       'se budou zobrazovat zde.',
        footer:           '2026 by Jakub Cernik. Vyvinuto pro vzdělávací účely jako bakalářská práce.',
        value:            'Hodnota',
        invalidInput:     'Zadejte platné kladné celé číslo.',

        // --- Validace (sdílené) ---
        validationEmpty: 'Vyplňte pole.',
        validationNotInteger: 'Zadejte celé číslo.',
        validationOutOfRange: (min, max) => `Zadejte hodnotu v rozsahu ${min}–${max}.`,
        validationMinGreaterThanMax: 'Minimum nesmí být větší než maximum.',

        bestCaseDesc: `<strong>Nejlepší případ</strong> nastává, když je nejnižší bit <strong class="highlight-green">0</strong>.
            Pouze tento jeden bit se přepne z 0→1 a utratí se jedna mince.
            Tlačítkem <em>Další varianta</em> zobrazíte jiné hodnoty se stejným best-case chováním.
            <br><br>Složitost: <strong class="badge">O(1)</strong>`,

        worstCaseDesc: `<strong>Nejhorší případ</strong> nastává, když jsou všechny bity <strong class="highlight-red">1</strong>
            (hodnota čítače = 2<sup>k</sup>−1). V takovém kroku se přepne všech k bitů, protože přenos projde od nejnižšího bitu přes všechny pozice.
            Časová složitost této jedné operace je O(k), ekvivalentně O(log N).
            Tlačítkem <em>Další varianta</em> porovnáte různé hloubky přenosu i plný worst case.
            <br><br>Amortizovaná složitost zůstává: <strong class="badge">O(1)</strong>`,

        btnNextVariant:   'Další varianta',

        bestReady:  (val, variant, total) => `Připravena varianta nejlepšího případu ${variant}/${total} — čítač je ${val} (LSB = 0). Inkrementování přepne jen 1 bit.`,
        worstReady: (k, variant, total, isFullWorst = false) => isFullWorst
            ? `Připravena nejhorší varianta ${variant}/${total} — čítač je 2^${k}−1 (všechny ${k} bity = 1). Inkrementování přepne všechny bity.`
            : `Připravena varianta hloubky přenosu ${variant}/${total} — čítač končí ${k} jedničkami. Inkrementování přepne ${k + 1} bitů.`,

        // Log zprávy
        incrTitle:      (from, to) => `Inkrementace <span class="log-badge slot">${from}</span> → <span class="log-badge slot">${to}</span>`,
        flipZeroToOne:  (pos)      => `Bit <span class="log-badge slot">[${pos}]</span> přepnut <span class="log-badge capacity">0 → 1</span> — <span class="coin-text">1 mince utracena</span>, <span class="coin-text">1 mince ušetřena</span>`,
        flipOneToZero:  (pos)      => `Bit <span class="log-badge slot">[${pos}]</span> přepnut <span class="log-badge capacity">1 → 0</span> — <span class="coin-text">1 ušetřená mince utracena</span>`,
        earned:         'přijato celkem',
        spent:          'utraceno',
        saved:          'uloženo na bitech',
        allocCoins:     ()         => `INCREMENT začíná: přijaty <span class="coin-text">2 mince</span> (pevný amortizovaný poplatek — vždy přesně 2, bez ohledu na počet přepnutých bitů)`,
        spendSelf:      (pos)      => `Bit <span class="log-badge slot">[${pos}]</span>: utracena <span class="coin-text">1 mince</span> z přijatých 2 → přepnut 0→1`,
        saveCoin:       (pos)      => `Bit <span class="log-badge slot">[${pos}]</span>: ušetřena <span class="coin-text">1 mince</span> na tomto bitu (rezerva na budoucí přepnutí 1→0)`,
        spendSaved:     (pos)      => `Bit <span class="log-badge slot">[${pos}]</span>: utracena <span class="coin-text">1 ušetřená mince</span> (byla zde uložena dříve) → přepnut 1→0. Žádné nové mince nejsou potřeba!`,
        incrDone:       (flips)    => `Hotovo — přepnuto <strong>${flips}</strong> ${flips === 1 ? 'bit' : (flips >= 2 && flips <= 4 ? 'bity' : 'bitů')}`,
        groupLabel:     (from, to, step) => `Krok ${step} — inkrementace ${from} → ${to}`,
        logStep:        (n)        => `Krok ${n}`,
        randomGenerating: (n)      => `Generuji <strong>${n}</strong> inkrementací…`,
        randomDone:     (n)        => `Hotovo — provedeno <strong>${n}</strong> inkrementací`,
    }
};

// ─── Log helpers ──────────────────────────────────────────────────────────────
const LOG_TYPES = {
    // Minimal, unified icon set across the whole web
    INSERT:  { class: 'insert',  icon: '＋' },
    RESIZE:  { class: 'resize',  icon: '↔' },
    COPY:    { class: 'copy',    icon: '⧉' },
    BORROW:  { class: 'borrow',  icon: '⇄' },
    WARNING: { class: 'warning', icon: '!' },
    INFO:    { class: 'info',    icon: 'i' },
    SUCCESS: { class: 'insert',  icon: '✓'  },
};

let currentLogGroup = null;
let steps = 0;

function beginLogGroup(from, to) {
    const d = dict[currentLang];
    const panel = document.getElementById('infoPanel');
    const group = document.createElement('div');
    group.classList.add('log-group');

    const header = document.createElement('div');
    header.classList.add('log-group-header');
    header.innerHTML = `
        <span class="log-group-icon">▶</span>
        <span class="log-group-title">${d.groupLabel(from, to, steps)}</span>
    `;
    const body = document.createElement('div');
    body.classList.add('log-group-body');

    group.appendChild(header);
    group.appendChild(body);
    panel.appendChild(group);
    panel.scrollTop = panel.scrollHeight;
    currentLogGroup = body;
}

function endLogGroup() { currentLogGroup = null; }

function createLogEntry(type, title, details = null) {
    const target = currentLogGroup || document.getElementById('infoPanel');
    const d = dict[currentLang];
    const entry = document.createElement('div');
    entry.classList.add('log-entry', type.class);

    let html = `
        <div class="log-header">
            <span class="log-icon">${type.icon}</span>
            <span class="log-title">${title}</span>
            ${!currentLogGroup ? `<span class="log-step">${d.logStep(steps)}</span>` : ''}
        </div>
    `;
    if (details) {
        html += Array.isArray(details)
            ? `<div class="log-details">${details.join(' • ')}</div>`
            : `<div class="log-details">${details}</div>`;
    }
    entry.innerHTML = html;
    target.appendChild(entry);
    const panel = document.getElementById('infoPanel');
    panel.scrollTop = panel.scrollHeight;
}

function updateInfoPanel(msg) { createLogEntry(LOG_TYPES.INFO, msg); }

// ─── Theme / Language / Navigation ────────────────────────────────────────────
function reloadWithTransition(beforeReload) {
    const ov = document.getElementById('pageTransitionOverlay');
    ov.classList.add('visible');
    setTimeout(() => { if (beforeReload) beforeReload(); window.location.reload(); }, 350);
}

function navigateToPage(event, url) {
    event.preventDefault();
    const ov = document.getElementById('pageTransitionOverlay');
    ov.classList.add('visible');
    setTimeout(() => { window.location.href = url; }, 350);
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

// ─── Mode switching ────────────────────────────────────────────────────────────
function setMode(mode) {
    resetCounter();
    document.querySelectorAll('nav#navigation button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.mode').forEach(s => s.classList.remove('active'));
    document.getElementById(`${mode}Tab`).classList.add('active');
    document.getElementById(`${mode}Mode`).classList.add('active');
    if (typeof updateCaseButtons === 'function') updateCaseButtons();
}

// ─── Apply language ────────────────────────────────────────────────────────────
function applyLanguage() {
    const d = dict[currentLang];

    document.title = d.pageTitle;
    document.getElementById('pageTitle').textContent        = d.pageTitle;
    document.getElementById('pageNavHomeLabel').textContent = d.pageNavHome;
    document.getElementById('pageNavSimLabel').textContent  = d.pageNavSim;
    document.getElementById('pageNavTheoryLabel').textContent = d.pageNavTheory;

    document.getElementById('manualTab').textContent   = d.manual;
    document.getElementById('randomTab').textContent   = d.random;
    document.getElementById('bestTab').textContent     = d.best;
    document.getElementById('worstTab').textContent    = d.worst;

    document.getElementById('btnIncrement').textContent  = d.btnIncrement;
    document.getElementById('btnReset').textContent      = d.btnReset;

    document.getElementById('randomModeTitle').textContent = d.randomModeTitle;
    document.getElementById('randomCountLabel').textContent = d.randomCountLabel;
    document.getElementById('randomCount').placeholder = d.randomCountPH;
    document.getElementById('btnGenRandom').textContent = d.btnGenRandom;

    document.getElementById('bestCaseTitle').textContent  = d.bestCaseTitle;
    document.getElementById('bestCaseDesc').innerHTML     = d.bestCaseDesc;
    document.getElementById('btnRunBest').textContent     = d.best;
    document.getElementById('btnRunBestAlt').textContent  = d.btnNextVariant;

    document.getElementById('worstCaseTitle').textContent = d.worstCaseTitle;
    document.getElementById('worstCaseDesc').innerHTML    = d.worstCaseDesc;
    document.getElementById('btnRunWorst').textContent    = d.worst;
    document.getElementById('btnRunWorstAlt').textContent = d.btnNextVariant;

    document.getElementById('bitLengthLabel').textContent = d.bitLengthLabel;
    document.getElementById('bitLengthHint').textContent  = d.bitLengthHint;

    document.getElementById('creditCounter').textContent = `${d.coins} 0`;
    document.getElementById('stepCounter').textContent   = `${d.steps}: 0`;
    const bankLabelEl = document.getElementById('bankLabel');
    if (bankLabelEl) bankLabelEl.textContent = d.bankLabel;
    document.getElementById('footerText').textContent    = d.footer;

    const panel = document.getElementById('infoPanel');
    panel.innerHTML = '';
    const init = document.createElement('div');
    init.classList.add('log-entry', 'info');
    init.innerHTML = `<div class="log-header"><span class="log-icon">${LOG_TYPES.INFO.icon}</span><span>${d.steps} ${d.willAppear}</span></div>`;
    panel.appendChild(init);

    if (typeof refreshBitLengthUI === 'function') refreshBitLengthUI();
    if (typeof updateCaseButtons === 'function') updateCaseButtons();

    updateLangToggleUI();
}

// ─── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    applyLanguage();
});

window.addEventListener('load', () => {
    document.body.classList.add('page-loaded');
});

