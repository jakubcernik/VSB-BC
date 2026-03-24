/* hash-ui.js – UI helpers & i18n for the Hash Table page.
   Self-contained, mirrors ui.js / bc-ui.js style.
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
        pageTitle:        'Amortized complexity — Hash Table',
        pageNavHome:      'Home',
        pageNavSim:       'Simulation',
        pageNavTheory:    'Theory',
        manual:           'Manual',
        random:           'Random',
        best:             'Best Case',
        worst:            'Worst Case',

        coins:            'Coins',
        steps:            'Steps',
        willAppear:       'will appear here.',
        footer:           '2026 by Jakub Cernik. Developed for educational purposes as a Bachelor Thesis.',

        // Manual
        manualTitle:      'Manual Mode',
        keyLabel:         'Key (int):',
        valueLabel:       'Value (string/number):',
        keyPH:            'e.g. 13',
        valuePH:          'e.g. 42',
        btnInsert:        'Insert',
        btnReset:         '↺ Reset',

        // Random
        randomModeTitle:  'Random Mode',
        randomCountLabel: 'Count:',
        randomCountPH:    'Count',
        randomKeyMinLabel:'Key min:',
        randomKeyMinPH:   'Min',
        randomKeyMaxLabel:'Key max:',
        randomKeyMaxPH:   'Max',
        btnGenRandom:     'Generate',

        // Best/Worst
        bestCaseTitle:    'Best Case',
        worstCaseTitle:   'Worst Case',
        bestCaseDesc: `The <strong>Best Case</strong> happens when the hashed slot is empty.
            The element is inserted immediately (no collisions, no resize).
            <br><br>Complexity: <strong class="badge">O(1)</strong>`,
        worstCaseDesc: `The <strong>Worst Case</strong> happens when the table is almost full and many collisions occur.
            Inserting may scan many slots and can also trigger <strong>resize + rehash</strong>.
            <br><br>Single operation: <strong class="badge">O(n)</strong>, amortized: <strong class="badge">O(1)</strong>`,

        btnPrepareBest:   'Prepare Best Case',
        btnPrepareWorst:  'Prepare Worst Case',
        bestReady:        'Best Case prepared — table has plenty of free space, next insert hits an empty slot.',
        worstReady:       'Worst Case prepared — table is near the load-factor limit and next insert will trigger resize.',

        // Meta
        metaSize:         'Size',
        metaCapacity:     'Capacity',
        metaLoad:         'Load factor',
        metaThreshold:    'Resize threshold',
        slotStateEmpty:   'empty',
        slotStateOccupied:'occupied',

        // Errors
        invalidInput:     'Please enter an integer key and a value.',

        // --- Validation (shared) ---
        validationEmpty: 'Please fill out the field.',
        validationNotInteger: 'Please enter an integer.',
        validationOutOfRange: (min, max) => `Please enter a value in range ${min}–${max}.`,
        validationMinGreaterThanMax: 'Minimum must not be greater than maximum.',

        // Log
        groupLabel:       (k, step) => `Step ${step} — inserting <strong>${k}</strong>`,
        logStep:          (n) => `Step ${n}`,

        hashStart:        (key, hash, cap, start) => `hash(<strong>${key}</strong>) = <span class="log-badge slot">${hash}</span>, start index = <span class="log-badge slot">${hash} mod ${cap} = ${start}</span>`,

        insertCharge:     (c) => `INSERT starts: received <span class="coin-text">${c} coins</span> (fixed amortized charge)`,
        probeCheck:       (i) => `Probe slot <span class="log-badge slot">[${i}]</span>`,
        probeNext:        (i) => `Next slot to try: <span class="log-badge slot">[${i}]</span>`,
        probeCollision:   (i) => `Collision at <span class="log-badge slot">[${i}]</span> — continue probing`,
        updateFound:      (i) => `Key already exists in <span class="log-badge slot">[${i}]</span> — performing <strong>UPDATE</strong> (standard hash table behavior)`,
        updateBorrowCoin: (i) => `Slot <span class="log-badge slot">[${i}]</span>: temporarily use the <span class="coin-text">saved coin</span> to pay for UPDATE`,
        updateDone:       (i) => `Updated value in <span class="log-badge slot">[${i}]</span> — spent <span class="coin-text">1 coin</span>`,
        updateReturnCoin: (i) => `Returned <span class="coin-text">1 coin</span> back onto <span class="log-badge slot">[${i}]</span> (reserve stays for future rehash)`,
        placeElement:     (i) => `Placed element into <span class="log-badge slot">[${i}]</span> — spent <span class="coin-text">1 coin</span>`,
        saveForRehash:    (i) => `Saved <span class="coin-text">1 coin</span> on <span class="log-badge slot">[${i}]</span> for future rehash`,

        resizeTitle:      (oldC, newC) => `Resize needed — rehash <span class="log-badge capacity">${oldC} → ${newC}</span>`,
        resizeWhy:        () => `Each stored element has 1 saved coin. During rehash, each element spends its coin to pay for its move.`,
        moveElement:      (from, to) => `Move from <span class="log-badge slot">[${from}]</span> → <span class="log-badge slot">[${to}]</span> (spent <span class="coin-text">1 saved coin</span>)`,
        resizeDone:       (n) => `Rehash complete — moved <strong>${n}</strong> element${n !== 1 ? 's' : ''}`,
    },

    cz: {
        pageTitle:        'Amortizovaná složitost — Hash tabulka',
        pageNavHome:      'Domů',
        pageNavSim:       'Simulace',
        pageNavTheory:    'Teorie',
        manual:           'Manuálně',
        random:           'Náhodně',
        best:             'Nejlepší případ',
        worst:            'Nejhorší případ',

        coins:            'Mince',
        steps:            'Kroky',
        willAppear:       'se budou zobrazovat zde.',
        footer:           '2026 by Jakub Cernik. Vyvinuto pro vzdělávací účely jako bakalářská práce.',

        // Manual
        manualTitle:      'Manuální režim',
        keyLabel:         'Klíč (int):',
        valueLabel:       'Hodnota (string/číslo):',
        keyPH:            'např. 13',
        valuePH:          'např. 42',
        btnInsert:        'Vložit',
        btnReset:         '↺ Reset',

        // Random
        randomModeTitle:  'Náhodný režim',
        randomCountLabel: 'Počet:',
        randomCountPH:    'Počet',
        randomKeyMinLabel:'Klíč min:',
        randomKeyMinPH:   'Min',
        randomKeyMaxLabel:'Klíč max:',
        randomKeyMaxPH:   'Max',
        btnGenRandom:     'Generovat',

        // Best/Worst
        bestCaseTitle:    'Nejlepší případ',
        worstCaseTitle:   'Nejhorší případ',
        bestCaseDesc: `<strong>Nejlepší případ</strong> nastane, když je slot vypočtený hashem prázdný.
            Prvek se vloží okamžitě (bez kolizí a bez resize).
            <br><br>Složitost: <strong class="badge">O(1)</strong>`,
        worstCaseDesc: `<strong>Nejhorší případ</strong> nastane, když je tabulka téměř plná a vzniká mnoho kolizí.
            Vložení může projít mnoho slotů a může také vyvolat <strong>resize + rehash</strong>.
            <br><br>Jedna operace: <strong class="badge">O(n)</strong>, amortizovaně: <strong class="badge">O(1)</strong>`,

        btnPrepareBest:   'Připravit Nejlepší případ',
        btnPrepareWorst:  'Připravit Nejhorší případ',
        bestReady:        'Nejlepší případ připraven — tabulka má dost volného místa, další insert trefí prázdný slot.',
        worstReady:       'Nejhorší případ připraven — tabulka je blízko limitu a další insert vyvolá resize.',

        // Meta
        metaSize:         'Velikost',
        metaCapacity:     'Kapacita',
        metaLoad:         'Zaplnění',
        metaThreshold:    'Limit rehash',
        slotStateEmpty:   'prázdný',
        slotStateOccupied:'obsazený',

        // Errors
        invalidInput:     'Zadejte celočíselný klíč a hodnotu.',

        // --- Validace (sdílené) ---
        validationEmpty: 'Vyplňte pole.',
        validationNotInteger: 'Zadejte celé číslo.',
        validationOutOfRange: (min, max) => `Zadejte hodnotu v rozsahu ${min}–${max}.`,
        validationMinGreaterThanMax: 'Minimum nesmí být větší než maximum.',

        // Log
        groupLabel:       (k, step) => `Krok ${step} — vkládám <strong>${k}</strong>`,
        logStep:          (n) => `Krok ${n}`,

        hashStart:        (key, hash, cap, start) => `hash(<strong>${key}</strong>) = <span class="log-badge slot">${hash}</span>, startovní index = <span class="log-badge slot">${hash} mod ${cap} = ${start}</span>`,

        insertCharge:     (c) => `INSERT začíná: přijaty <span class="coin-text">${c} mince</span> (pevný amortizovaný poplatek)`,
        probeCheck:       (i) => `Kontroluji slot <span class="log-badge slot">[${i}]</span>`,
        probeNext:        (i) => `Další slot: <span class="log-badge slot">[${i}]</span>`,
        probeCollision:   (i) => `Kolize ve <span class="log-badge slot">[${i}]</span> — pokračuji dál`,
        updateFound:      (i) => `Klíč už existuje ve <span class="log-badge slot">[${i}]</span> — provádím <strong>UPDATE</strong> (standardní chování hash tabulky)`,
        updateBorrowCoin: (i) => `Slot <span class="log-badge slot">[${i}]</span>: dočasně používám <span class="coin-text">ušetřenou minci</span> na zaplacení UPDATE`,
        updateDone:       (i) => `Hodnota aktualizována ve <span class="log-badge slot">[${i}]</span> — utracena <span class="coin-text">1 mince</span>`,
        updateReturnCoin: (i) => `Vracím <span class="coin-text">1 minci</span> zpět na <span class="log-badge slot">[${i}]</span> (rezerva zůstává pro budoucí rehash)`,
        placeElement:     (i) => `Uloženo do <span class="log-badge slot">[${i}]</span> — utracena <span class="coin-text">1 mince</span>`,
        saveForRehash:    (i) => `Uložena <span class="coin-text">1 mince</span> na <span class="log-badge slot">[${i}]</span> pro budoucí rehash`,

        resizeTitle:      (oldC, newC) => `Potřeba resize — rehash <span class="log-badge capacity">${oldC} → ${newC}</span>`,
        resizeWhy:        () => `Každý uložený prvek má 1 ušetřenou minci. Při rehashi ji utratí za svůj přesun.`,
        moveElement:      (from, to) => `Přesun <span class="log-badge slot">[${from}]</span> → <span class="log-badge slot">[${to}]</span> (utracena <span class="coin-text">1 ušetřená mince</span>)`,
        resizeDone:       (n) => `Rehash hotový — přesunuto <strong>${n}</strong> ${n === 1 ? 'prvek' : (n >= 2 && n <= 4 ? 'prvky' : 'prvků')}`,
    }
};

// ─── Log helpers ──────────────────────────────────────────────────────────────
const LOG_TYPES = {
    // Minimal, unified icon set across the whole web
    INSERT:  { class: 'insert',  icon: '＋' },
    RESIZE:  { class: 'resize',  icon: '↔' },
    PROBE:   { class: 'copy',    icon: '⧉' },
    COPY:    { class: 'copy',    icon: '⧉' },
    INFO:    { class: 'info',    icon: 'i' },
    WARNING: { class: 'warning', icon: '!' },
    SUCCESS: { class: 'insert',  icon: '✓'  },
};

let currentLogGroup = null;
let steps = 0; // shared with hashTable.js (same pattern as other pages)

function beginLogGroup(key) {
    const d = dict[currentLang];
    const panel = document.getElementById('infoPanel');
    const group = document.createElement('div');
    group.classList.add('log-group');

    const header = document.createElement('div');
    header.classList.add('log-group-header');
    header.innerHTML = `
        <span class="log-group-icon">▶</span>
        <span class="log-group-title">${d.groupLabel(key, steps)}</span>
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
    resetHashTable();
    document.querySelectorAll('nav#navigation button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.mode').forEach(s => s.classList.remove('active'));
    document.getElementById(`${mode}Tab`).classList.add('active');
    document.getElementById(`${mode}Mode`).classList.add('active');
}

// ─── Apply language ────────────────────────────────────────────────────────────
function applyLanguage() {
    const d = dict[currentLang];

    document.title = d.pageTitle;
    document.getElementById('pageTitle').textContent        = d.pageTitle;
    document.getElementById('pageNavHomeLabel').textContent = d.pageNavHome;
    document.getElementById('pageNavSimLabel').textContent  = d.pageNavSim;
    document.getElementById('pageNavTheoryLabel').textContent = d.pageNavTheory;

    document.getElementById('manualTab').textContent = d.manual;
    document.getElementById('randomTab').textContent = d.random;
    document.getElementById('bestTab').textContent   = d.best;
    document.getElementById('worstTab').textContent  = d.worst;

    document.getElementById('manualModeTitle').textContent = d.manualTitle;
    document.getElementById('keyLabel').textContent = d.keyLabel;
    document.getElementById('valueLabel').textContent = d.valueLabel;
    document.getElementById('keyInput').placeholder = d.keyPH;
    document.getElementById('valueInput').placeholder = d.valuePH;
    document.getElementById('btnInsert').textContent = d.btnInsert;
    document.getElementById('btnReset').textContent  = d.btnReset;

    document.getElementById('randomModeTitle').textContent = d.randomModeTitle;
    document.getElementById('randomCountLabel').textContent = d.randomCountLabel;
    document.getElementById('randomCount').placeholder = d.randomCountPH;
    document.getElementById('randomKeyMinLabel').textContent = d.randomKeyMinLabel;
    document.getElementById('randomKeyMin').placeholder = d.randomKeyMinPH;
    document.getElementById('randomKeyMaxLabel').textContent = d.randomKeyMaxLabel;
    document.getElementById('randomKeyMax').placeholder = d.randomKeyMaxPH;
    document.getElementById('btnGenRandom').textContent = d.btnGenRandom;

    document.getElementById('bestCaseTitle').textContent = d.bestCaseTitle;
    document.getElementById('bestCaseDesc').innerHTML    = d.bestCaseDesc;
    document.getElementById('btnPrepareBest').textContent = d.btnPrepareBest;

    document.getElementById('worstCaseTitle').textContent = d.worstCaseTitle;
    document.getElementById('worstCaseDesc').innerHTML    = d.worstCaseDesc;
    document.getElementById('btnPrepareWorst').textContent = d.btnPrepareWorst;

    document.getElementById('footerText').textContent = d.footer;

    updateLangToggleUI();
    applyTheme();

    // ensure counters use right labels
    updateStepCounter();
    updateCoinCounter();
    updateMeta();
}

// ─── Page init ────────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
    document.body.classList.add('page-loaded');
    applyLanguage();
});

