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
        valueLabel:       'Value (int):',
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
        worstCaseDesc: `The <strong>Worst Case</strong> for a single insert is typically when it triggers <strong>resize + rehash</strong>,
            because many stored elements must be moved.
            Collisions can still increase probing work, but with a good hash function and bounded load factor, probing is expected to stay constant on average.
            <br><br>Single operation: <strong class="badge">O(n)</strong>, amortized over many inserts: <strong class="badge">O(1)</strong>`,

        btnPrepareBest:   'Prepare Best Case',
        btnPrepareWorst:  'Prepare Worst Case',
        btnNextVariant:   'Next Variant',
        btnInsertPrepared: 'Insert Prepared Element',
        stepPrepareLabel: '1) Prepare variant',
        stepRunLabel:     '2) Insert prepared element',
        bestReady:        'Best Case prepared — table has plenty of free space, next insert hits an empty slot.',
        worstReady:       'Worst Case prepared — primary worst-case path is set: table is near the load-factor limit and next insert will trigger resize + rehash.',
        bestReadyVariant: (v, total, key, value) => `Best Case variant ${v}/${total} prepared — next insert uses key=${key}, value=${value}.`,
        worstReadyVariant: (v, total, key, value, kind, projected, threshold, willResize) =>
            `Worst Case variant ${v}/${total} prepared (${kind}) — next insert uses key=${key}, value=${value}. ` +
            `Projected load after insert: ${projected} (threshold ${threshold})${willResize ? ', so this insert will trigger resize + rehash (the primary single-operation worst case).' : ', so this run is a probing/update variant (didactic), not the primary asymptotic worst-case trigger.'}`,
        prepareFirstBest:  'First prepare a Best Case variant, then run the insert action.',
        prepareFirstWorst: 'First prepare a Worst Case variant, then run the insert action.',
        worstKindProbe:    'adversarial probing input',
        worstKindResize:   'resize + rehash',
        worstKindUpdate:   'update existing key',
        bestInsertExplain: (probes, collisions, resized) => `Best Case explanation: first hashed slot was free, so insert finished immediately. Cost: O(1) (probes=${probes}, collisions=${collisions}, resize=${resized ? 'yes' : 'no'}).`,
        worstInsertExplain: (kind, probes, collisions, resized, wasUpdate) => `Worst Case explanation (${kind}): the primary expensive case is resize/rehash, where many elements are moved${resized ? ', and this run included it' : ', while this run illustrates a probing/update-heavy path'}. Under good hashing with bounded load factor, probing is expected O(1) on average${wasUpdate ? '; this run ended as UPDATE of an existing key' : ''}. Observed: probes=${probes}, collisions=${collisions}.`,

        // Meta
        metaSize:         'Size',
        metaCapacity:     'Capacity',
        metaLoad:         'Load factor',
        metaThreshold:    'Resize threshold',
        metaThresholdHelp: 'If (size + 1) / capacity exceeds this threshold, the table resizes and rehashes all elements.',
        metaThresholdHelpAria: 'Explain resize threshold',
        slotStateEmpty:   'empty',
        slotStateOccupied:'occupied',

        // Errors
        invalidInput:     'Please enter an integer key and an integer value.',

        // --- Validation (shared) ---
        validationEmpty: 'Please fill out the field.',
        validationNotInteger: 'Please enter an integer.',
        validationOutOfRange: (min, max) => `Please enter a value in range ${min}–${max}.`,
        validationMinGreaterThanMax: 'Minimum must not be greater than maximum.',

        // Log
        groupLabel:       (k, v, step) => v === null || v === undefined
            ? `Step ${step} — inserting key <strong>${k}</strong>`
            : `Step ${step} — inserting value <strong>${v}</strong> with key <strong>${k}</strong>`,
        logStep:          (n) => `Step ${n}`,

        hashStart:        (key, hash, cap, start) => `hash(<strong>${key}</strong>) = <span class="log-badge slot">${hash}</span>, start index = <span class="log-badge slot">${hash} mod ${cap} = ${start}</span>`,

        insertCharge:     (c) => `INSERT starts: received <span class="coin-text">${c} coins</span> (fixed amortized charge)`,
        resizeCheck:      (projected, threshold) => `Before insert: projected load factor is <span class="log-badge slot">${projected}</span> (threshold ${threshold}).`,
        resizeNeededNow:  (projected, threshold) => `Projected load ${projected} exceeds threshold ${threshold} — resize + rehash is required now. This is the primary single-operation worst-case trigger (O(n)) because many stored elements must be moved.`,
        resizeNotNeeded:  (projected, threshold) => `Projected load ${projected} is within threshold ${threshold} — no resize before this insert, so the primary worst-case trigger is not active in this step; amortized reserve stays for future rehash.`,
        probeCheck:       (i) => `Probe slot <span class="log-badge slot">[${i}]</span>`,
        probeNext:        (i) => `Next slot to try: <span class="log-badge slot">[${i}]</span>`,
        probeCollision:   (i, key) => `Collision at <span class="log-badge slot">[${i}]</span> (occupied by key <strong>${key}</strong>) — continue probing to preserve correctness of open addressing. On adversarial inputs probing can be longer; with good hashing and bounded load factor it is expected O(1) on average.`,
        updateFound:      (i) => `Key already exists in <span class="log-badge slot">[${i}]</span> — performing <strong>UPDATE</strong> (no new element is inserted)`,
        updateCostExplain:(i) => `UPDATE keeps table size unchanged. Cost: value overwrite in <span class="log-badge slot">[${i}]</span> is O(1); extra work can come from probing before this slot is found, while average-case probing remains expected O(1) under good hashing and bounded load factor.`,
        updateBorrowCoin: (i) => `Slot <span class="log-badge slot">[${i}]</span>: temporarily use the <span class="coin-text">saved coin</span> to pay for UPDATE`,
        updateDone:       (i) => `Updated value in <span class="log-badge slot">[${i}]</span> — spent <span class="coin-text">1 coin</span>`,
        updateReturnCoin: (i) => `Returned <span class="coin-text">1 coin</span> back onto <span class="log-badge slot">[${i}]</span> (reserve stays for future rehash)`,
        emptySlotFound:   (i) => `Found first empty slot at <span class="log-badge slot">[${i}]</span> — insert stops here because linear probing always writes into the first available position.`,
        placeElement:     (i) => `Placed element into <span class="log-badge slot">[${i}]</span> — spent <span class="coin-text">1 coin</span>`,
        saveForRehash:    (i) => `Saved <span class="coin-text">1 coin</span> on <span class="log-badge slot">[${i}]</span> for future rehash`,
        insertSummary:    (sizeNow, capNow, loadNow) => `Insert finished — size=${sizeNow}, capacity=${capNow}, load factor=${loadNow}`,

        resizeTitle:      (oldC, newC) => `Resize needed — rehash <span class="log-badge capacity">${oldC} → ${newC}</span>`,
        resizeWhy:        () => `Each stored element has 1 saved coin. During rehash, each element spends its coin to pay for its move.`,
        rehashStats:      (oldC, newC, size, oldLoad, newLoad) => `Rehash stats: size = <span class="log-badge slot">${size}</span>, load factor <span class="log-badge slot">${oldLoad}</span> → <span class="log-badge slot">${newLoad}</span> (capacity <span class="log-badge capacity">${oldC} → ${newC}</span>)`,
        moveElement:      (from, to) => `Move from <span class="log-badge slot">[${from}]</span> → <span class="log-badge slot">[${to}]</span> (spent <span class="coin-text">1 saved coin</span>)`,
        moveElementDetails:(key, oldStart, newStart, probes) => `key <span class="log-badge slot">${key}</span>: start <span class="log-badge slot">${oldStart}</span> → <span class="log-badge slot">${newStart}</span>, probes during re-insert: <span class="log-badge slot">${probes}</span>`,
        rehashSummary:    (moved, totalProbes, maxProbes) => `Rehash summary: moved <strong>${moved}</strong> element${moved !== 1 ? 's' : ''}, total probes <span class="log-badge slot">${totalProbes}</span>, max probes for one element <span class="log-badge slot">${maxProbes}</span>`,
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
        valueLabel:       'Hodnota (int):',
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
        worstCaseDesc: `<strong>Nejhorší případ</strong> jedné operace nastává typicky tehdy, když vložení vyvolá <strong>resize + rehash</strong>,
            protože je potřeba přesunout mnoho uložených prvků.
            Kolize mohou zvýšit práci probingem, ale při dobré hash funkci a omezeném zaplnění je očekávaný počet probingů v průměru konstantní.
            <br><br>Jedna operace: <strong class="badge">O(n)</strong>, amortizovaně přes mnoho vložení: <strong class="badge">O(1)</strong>`,

        btnPrepareBest:   'Připravit Nejlepší případ',
        btnPrepareWorst:  'Připravit Nejhorší případ',
        btnNextVariant:   'Další varianta',
        btnInsertPrepared: 'Vložit připravený prvek',
        stepPrepareLabel: '1) Připravit variantu',
        stepRunLabel:     '2) Vložit připravený prvek',
        bestReady:        'Nejlepší případ připraven — tabulka má dost volného místa, další insert trefí prázdný slot.',
        worstReady:       'Nejhorší případ připraven — nastaven hlavní worst-case průchod: tabulka je blízko limitu zaplnění a další insert vyvolá resize + rehash.',
        bestReadyVariant: (v, total, key, value) => `Připravena varianta Best Case ${v}/${total} — další vložení použije klíč=${key}, hodnota=${value}.`,
        worstReadyVariant: (v, total, key, value, kind, projected, threshold, willResize) =>
            `Připravena varianta Worst Case ${v}/${total} (${kind}) — další vložení použije klíč=${key}, hodnota=${value}. ` +
            `Očekávané zaplnění po vložení: ${projected} (limit ${threshold})${willResize ? ', takže tento insert vyvolá resize + rehash (hlavní nejhorší případ jedné operace).' : ', takže tento běh je spíše probing/update varianta (didaktická), ne hlavní asymptotický trigger nejhoršího případu.'}`,
        prepareFirstBest:  'Nejprve připravte variantu Best Case a potom spusťte vložení.',
        prepareFirstWorst: 'Nejprve připravte variantu Worst Case a potom spusťte vložení.',
        worstKindProbe:    'nepříznivý vstup pro probing',
        worstKindResize:   'resize + rehash',
        worstKindUpdate:   'update existujícího klíče',
        bestInsertExplain: (probes, collisions, resized) => `Vysvětlení Best Case: první hashovaný slot byl volný, takže vložení skončilo hned. Cena: O(1) (probes=${probes}, kolize=${collisions}, resize=${resized ? 'ano' : 'ne'}).`,
        worstInsertExplain: (kind, probes, collisions, resized, wasUpdate) => `Vysvětlení Worst Case (${kind}): hlavní drahý případ je resize/rehash, kdy se přesouvá mnoho prvků${resized ? ', a v tomto běhu k němu došlo' : ', zatímco tento běh ukazuje cestu s více probingem/update'}. Při dobrém hashování a omezeném zaplnění má probing v průměru očekávaně O(1)${wasUpdate ? '; tento běh skončil jako UPDATE existujícího klíče' : ''}. Naměřeno: probes=${probes}, kolize=${collisions}.`,

        // Meta
        metaSize:         'Velikost',
        metaCapacity:     'Kapacita',
        metaLoad:         'Zaplnění',
        metaThreshold:    'Limit rehash',
        metaThresholdHelp: 'Pokud (size + 1) / capacity překročí tento limit, tabulka se zvětší a znovu přehashuje všechny prvky.',
        metaThresholdHelpAria: 'Vysvětlivka k limitu rehash',
        slotStateEmpty:   'prázdný',
        slotStateOccupied:'obsazený',

        // Errors
        invalidInput:     'Zadejte celočíselný klíč a celočíselnou hodnotu.',

        // --- Validace (sdílené) ---
        validationEmpty: 'Vyplňte pole.',
        validationNotInteger: 'Zadejte celé číslo.',
        validationOutOfRange: (min, max) => `Zadejte hodnotu v rozsahu ${min}–${max}.`,
        validationMinGreaterThanMax: 'Minimum nesmí být větší než maximum.',

        // Log
        groupLabel:       (k, v, step) => v === null || v === undefined
            ? `Krok ${step} — vkládám klíč <strong>${k}</strong>`
            : `Krok ${step} — vkládám hodnotu <strong>${v}</strong> s klíčem <strong>${k}</strong>`,
        logStep:          (n) => `Krok ${n}`,

        hashStart:        (key, hash, cap, start) => `hash(<strong>${key}</strong>) = <span class="log-badge slot">${hash}</span>, startovní index = <span class="log-badge slot">${hash} mod ${cap} = ${start}</span>`,

        insertCharge:     (c) => `INSERT začíná: přijaty <span class="coin-text">${c} mince</span> (pevný amortizovaný poplatek)`,
        resizeCheck:      (projected, threshold) => `Před vložením: očekávané zaplnění je <span class="log-badge slot">${projected}</span> (limit ${threshold}).`,
        resizeNeededNow:  (projected, threshold) => `Očekávané zaplnění ${projected} překračuje limit ${threshold} — je potřeba resize + rehash. Jde o hlavní trigger nejhoršího případu jedné operace (O(n)), protože je nutné přesunout mnoho uložených prvků.`,
        resizeNotNeeded:  (projected, threshold) => `Očekávané zaplnění ${projected} je v limitu ${threshold} — před tímto vložením není resize potřeba, takže hlavní trigger nejhoršího případu se v tomto kroku neaktivuje; amortizovaná rezerva zůstává na budoucí rehash.`,
        probeCheck:       (i) => `Kontroluji slot <span class="log-badge slot">[${i}]</span>`,
        probeNext:        (i) => `Další slot: <span class="log-badge slot">[${i}]</span>`,
        probeCollision:   (i, key) => `Kolize ve <span class="log-badge slot">[${i}]</span> (je tam klíč <strong>${key}</strong>) — pokračuji probingem dál, aby bylo zachováno správné chování otevřeného adresování. Na nepříznivých vstupech může být probing delší; při dobrém hashování a omezeném zaplnění je v průměru očekávaně O(1).`,
        updateFound:      (i) => `Klíč už existuje ve <span class="log-badge slot">[${i}]</span> — provádím <strong>UPDATE</strong> (nevkládá se nový prvek)`,
        updateCostExplain:(i) => `UPDATE nemění velikost tabulky. Cena: samotný přepis hodnoty ve <span class="log-badge slot">[${i}]</span> je O(1); dodatečná práce může vzniknout probingem před nalezením tohoto slotu, zatímco v průměrném případě zůstává probing při dobrém hashování a omezeném zaplnění očekávaně O(1).`,
        updateBorrowCoin: (i) => `Slot <span class="log-badge slot">[${i}]</span>: dočasně používám <span class="coin-text">ušetřenou minci</span> na zaplacení UPDATE`,
        updateDone:       (i) => `Hodnota aktualizována ve <span class="log-badge slot">[${i}]</span> — utracena <span class="coin-text">1 mince</span>`,
        updateReturnCoin: (i) => `Vracím <span class="coin-text">1 minci</span> zpět na <span class="log-badge slot">[${i}]</span> (rezerva zůstává pro budoucí rehash)`,
        emptySlotFound:   (i) => `Nalezen první prázdný slot <span class="log-badge slot">[${i}]</span> — vložení končí zde, protože lineární probing zapisuje do první volné pozice.`,
        placeElement:     (i) => `Uloženo do <span class="log-badge slot">[${i}]</span> — utracena <span class="coin-text">1 mince</span>`,
        saveForRehash:    (i) => `Uložena <span class="coin-text">1 mince</span> na <span class="log-badge slot">[${i}]</span> pro budoucí rehash`,
        insertSummary:    (sizeNow, capNow, loadNow) => `Vložení dokončeno — velikost=${sizeNow}, kapacita=${capNow}, zaplnění=${loadNow}`,

        resizeTitle:      (oldC, newC) => `Potřeba resize — rehash <span class="log-badge capacity">${oldC} → ${newC}</span>`,
        resizeWhy:        () => `Každý uložený prvek má 1 ušetřenou minci. Při rehashi ji utratí za svůj přesun.`,
        rehashStats:      (oldC, newC, size, oldLoad, newLoad) => `Statistiky rehashe: velikost = <span class="log-badge slot">${size}</span>, zaplnění <span class="log-badge slot">${oldLoad}</span> → <span class="log-badge slot">${newLoad}</span> (kapacita <span class="log-badge capacity">${oldC} → ${newC}</span>)`,
        moveElement:      (from, to) => `Přesun <span class="log-badge slot">[${from}]</span> → <span class="log-badge slot">[${to}]</span> (utracena <span class="coin-text">1 ušetřená mince</span>)`,
        moveElementDetails:(key, oldStart, newStart, probes) => `klíč <span class="log-badge slot">${key}</span>: start <span class="log-badge slot">${oldStart}</span> → <span class="log-badge slot">${newStart}</span>, probing při vložení: <span class="log-badge slot">${probes}</span>`,
        rehashSummary:    (moved, totalProbes, maxProbes) => `Souhrn rehashe: přesunuto <strong>${moved}</strong> ${moved === 1 ? 'prvek' : (moved >= 2 && moved <= 4 ? 'prvky' : 'prvků')}, probing celkem <span class="log-badge slot">${totalProbes}</span>, maximum u jednoho prvku <span class="log-badge slot">${maxProbes}</span>`,
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

function beginLogGroup(key, value = null) {
    const d = dict[currentLang];
    const panel = document.getElementById('infoPanel');
    const group = document.createElement('div');
    group.classList.add('log-group');

    const header = document.createElement('div');
    header.classList.add('log-group-header');
    header.innerHTML = `
        <span class="log-group-icon">▶</span>
        <span class="log-group-title">${d.groupLabel(key, value, steps)}</span>
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
    document.getElementById('btnBestNextVariant').textContent = d.btnNextVariant;
    document.getElementById('btnBestInsertPrepared').textContent = d.btnInsertPrepared;
    document.getElementById('bestStepPrepareLabel').textContent = d.stepPrepareLabel;
    document.getElementById('bestStepRunLabel').textContent = d.stepRunLabel;

    document.getElementById('worstCaseTitle').textContent = d.worstCaseTitle;
    document.getElementById('worstCaseDesc').innerHTML    = d.worstCaseDesc;
    document.getElementById('btnPrepareWorst').textContent = d.btnPrepareWorst;
    document.getElementById('btnWorstNextVariant').textContent = d.btnNextVariant;
    document.getElementById('btnWorstInsertPrepared').textContent = d.btnInsertPrepared;
    document.getElementById('worstStepPrepareLabel').textContent = d.stepPrepareLabel;
    document.getElementById('worstStepRunLabel').textContent = d.stepRunLabel;

    const helpIcon = document.getElementById('metaThresholdHelp');
    const helpText = document.getElementById('metaThresholdHelpText');
    if (helpIcon) {
        helpIcon.setAttribute('aria-label', d.metaThresholdHelpAria);
        helpIcon.setAttribute('title', d.metaThresholdHelp);
    }
    if (helpText) helpText.textContent = d.metaThresholdHelp;

    document.getElementById('footerText').textContent = d.footer;

    updateLangToggleUI();
    applyTheme();

    // ensure counters use right labels
    updateStepCounter();
    updateCoinCounter();
    updateMeta();
    if (typeof updateCaseButtons === 'function') updateCaseButtons();
}

// ─── Page init ────────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
    document.body.classList.add('page-loaded');
    applyLanguage();
});

