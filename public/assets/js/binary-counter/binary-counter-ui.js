/* UI helpers and i18n for the Binary Counter page. */

let currentLang = localStorage.getItem('lang') || 'cz';

// ─── Animation speed ───────────────────────────────────────────────────────────
const animationDelay = 1;
function getDelay(base) {
    if (base === undefined) base = 1;
    var multiplier = 1;
    if (animationDelay === 1) multiplier = 4;
    else if (animationDelay === 2) multiplier = 2;
    else if (animationDelay === 3) multiplier = 1;
    else if (animationDelay === 4) multiplier = 0.4;
    else if (animationDelay === 5) multiplier = 0.15;
    return Math.round(base * multiplier);
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
        randomModeDesc:   'Generate one random counter state with configurable carry depth and run one INCREMENT.',
        randomMinTrailingLabel: 'Min trailing 1s:',
        randomMaxTrailingLabel: 'Max trailing 1s:',
        randomMinTrailingPH: '0',
        randomMaxTrailingPH: '3',
        btnGenRandom:     'Generate',
        bestCaseTitle:    'Best Case',
        worstCaseTitle:   'Worst Case',
        btnPrepareVariant: 'Prepare Variant',
        btnIncrementPrepared: 'Run One Increment',
        stepPrepareLabel: '1) Prepare variant',
        stepRunLabel: '2) Run one increment',
        bitLengthLabel:   'Bit length:',
        bitLengthHint:    'Default 8 bits is for clarity; you can change it.',
        coins:            'Coins',
        operations:       'Steps',
        steps:            'Steps',
        instructions:     'Instructions',
        metricsHelpButton: 'What do metrics mean?',
        metricsHelpTitle: 'Metrics explanation',
        metricsHelpLine1: 'Steps represent the number of INCREMENT requests (one press of the increment button).',
        metricsHelpLine2: 'Instructions represent atomic bit changes 0↔1 (each costs 1 coin).',
        metricsHelpLine3: 'Amortized analysis shows total instructions stay linear in steps.',
        metricsHelpTheoryLink: 'Open theory',
        metricsHelpClose: 'Close',
        badgeOperation: 'STEP',
        badgeInstruction: 'INS',
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
        prepareFirstBest:  'First prepare a Best Case variant, then run the one-step increment.',
        prepareFirstWorst: 'First prepare a Worst Case variant, then run the one-step increment.',
        bestStepExplain:  (flips) => `There was free space immediately at the first bit (LSB=0), so only one bit flipped. One coin paid the flip, so this step is constant-time (O(1), flips: ${flips}).`,
        worstStepExplain: (trailingOnes, flips, isFullWorst = false) => isFullWorst
            ? `Here all bits were 1, so carry had to propagate through the whole register (${flips} flips). This single step is expensive, but rare, so the amortized cost is still O(1).`
            : `There were ${trailingOnes} trailing 1-bits, so carry propagated through them and then set the next 0 to 1 (${flips} flips). This step is heavier, but amortized over many increments it remains O(1).`,

        // Log messages
        earned:         'received',
        spent:          'spent',
        saved:          'saved on bits',
        allocCoins:     ()         => `INCREMENT starts: received <span class="coin-text">2 coins</span> (fixed amortized charge — always exactly 2, no matter how many bits flip)`,
        spendSelf:      (pos)      => `Bit <span class="log-badge slot">[${pos}]</span>: spent <span class="coin-text">1 coin</span> from the 2 received → flipped 0→1`,
        saveCoin:       (pos)      => `Bit <span class="log-badge slot">[${pos}]</span>: stored <span class="coin-text">1 coin</span> on this bit from the current operation charge (reserve for future 1→0 flip)`,
        spendSaved:     (pos)      => `Bit <span class="log-badge slot">[${pos}]</span>: spent <span class="coin-text">1 stored coin</span> (it was deposited here earlier) → flipped 1→0. No new coins needed!`,
        incrDone:       (flips)    => `Done — <strong>${flips}</strong> bit${flips !== 1 ? 's' : ''} flipped`,
        groupLabel:     (from, to, step) => `Step ${step} — increment ${from} → ${to}`,
        logStep:        (n)        => `Step ${n}`,
        randomGenerating: (minT, maxT) => `Generating one random sample (trailing 1-bits range <strong>${minT}–${maxT}</strong>)…`,
        randomPrepared: (t)  => `Generated state with <strong>${t}</strong> trailing 1-bit${t === 1 ? '' : 's'}. Running one INCREMENT.`,
        randomDone:     ()        => 'Done — performed one INCREMENT on the random sample',
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
        randomModeDesc:   'Vygeneruje jeden náhodný stav čítače podle zvolené hloubky přenosu a provede na něm jeden krok INCREMENT.',
        randomMinTrailingLabel: 'Min koncových 1:',
        randomMaxTrailingLabel: 'Max koncových 1:',
        randomMinTrailingPH: '0',
        randomMaxTrailingPH: '3',
        btnGenRandom:     'Generovat',
        bestCaseTitle:    'Nejlepší případ',
        worstCaseTitle:   'Nejhorší případ',
        btnPrepareVariant: 'Připravit variantu',
        btnIncrementPrepared: 'Spustit 1 inkrementaci',
        stepPrepareLabel: '1) Připravit variantu',
        stepRunLabel: '2) Spustit 1 inkrementaci',
        bitLengthLabel:   'Délka čítače:',
        bitLengthHint:    'Výchozích 8 bitů je pro názornost; délku lze změnit.',
        coins:            'Mince',
        operations:       'Kroky',
        steps:            'Kroky',
        instructions:     'Instrukce',
        metricsHelpButton: 'Co znamenají metriky?',
        metricsHelpTitle: 'Vysvětlení metrik',
        metricsHelpLine1: 'Kroky představují počet požadavků na INCREMENT (jedno stisknutí tlačítka).',
        metricsHelpLine2: 'Instrukce představují počet atomických přepnutí bitu 0↔1 (každé stojí 1 minci).',
        metricsHelpLine3: 'Amortizovaná analýza ukazuje, že celkový počet instrukcí zůstává lineární vůči počtu kroků.',
        metricsHelpTheoryLink: 'Otevřít teorii',
        metricsHelpClose: 'Zavřít',
        badgeOperation: 'KROK',
        badgeInstruction: 'INS',
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
        prepareFirstBest:  'Nejprve připravte variantu Best Case a potom spusťte jednokrokovou inkrementaci.',
        prepareFirstWorst: 'Nejprve připravte variantu Worst Case a potom spusťte jednokrokovou inkrementaci.',
        bestStepExplain:  (flips) => `Byl volný hned první bit (LSB=0), takže se přepnul jen on. Utratila se 1 mince za přepnutí, proto je tento krok konstantní, tedy O(1) (přepnutí: ${flips}).`,
        worstStepExplain: (trailingOnes, flips, isFullWorst = false) => isFullWorst
            ? `Tady byly všechny bity 1, takže přenos prošel celým registrem (${flips} přepnutí). Tento jeden krok je drahý, ale je vzácný, takže amortizovaně to stále vychází O(1).`
            : `Na konci bylo ${trailingOnes} jedniček za sebou, proto se přenos postupně propagoval a pak se nastavila další 0 na 1 (${flips} přepnutí). Tento krok je těžší, ale v průměru přes mnoho operací zůstává O(1).`,

        // Log zprávy
        earned:         'přijato celkem',
        spent:          'utraceno',
        saved:          'uloženo na bitech',
        allocCoins:     ()         => `INCREMENT začíná: přijaty <span class="coin-text">2 mince</span> (pevný amortizovaný poplatek — vždy přesně 2, bez ohledu na počet přepnutých bitů)`,
        spendSelf:      (pos)      => `Bit <span class="log-badge slot">[${pos}]</span>: utracena <span class="coin-text">1 mince</span> z přijatých 2 → přepnut 0→1`,
        saveCoin:       (pos)      => `Bit <span class="log-badge slot">[${pos}]</span>: <span class="coin-text">1 mince</span> z dotace aktuální operace uložena k tomuto bitu (rezerva na budoucí přepnutí 1→0)`,
        spendSaved:     (pos)      => `Bit <span class="log-badge slot">[${pos}]</span>: utracena <span class="coin-text">1 mince</span>, která zde byla uložena dříve → přepnut 1→0. Žádné nové mince nejsou potřeba!`,
        incrDone:       (flips)    => `Hotovo — přepnuto <strong>${flips}</strong> ${flips === 1 ? 'bit' : (flips >= 2 && flips <= 4 ? 'bity' : 'bitů')}`,
        groupLabel:     (from, to, step) => `Krok ${step} — inkrementace ${from} → ${to}`,
        logStep:        (n)        => `Krok ${n}`,
        randomGenerating: (minT, maxT) => `Generuji jeden náhodný vzorek (rozsah koncových jedniček <strong>${minT}–${maxT}</strong>)…`,
        randomPrepared: (t)  => `Vygenerován stav s <strong>${t}</strong> koncovými jedničkami. Spouštím jeden krok INCREMENT.`,
        randomDone:     ()        => 'Hotovo — proveden jeden krok INCREMENT na náhodném vzorku',
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
        <span class="log-unit-badge operation">${d.badgeOperation || 'STEP'}</span>
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

function createLogEntry(type, title, details, meta) {
    if (details === undefined) details = null;
    if (meta === undefined) meta = null;
    const target = currentLogGroup || document.getElementById('infoPanel');
    const d = dict[currentLang];
    const entry = document.createElement('div');
    entry.classList.add('log-entry', type.class);

    var unitBadge = '';
    if (meta && meta.unit === 'instruction') {
        unitBadge = '<span class="log-unit-badge instruction">' + (d.badgeInstruction || 'INS') + '</span>';
    }

    let html = `
        <div class="log-header">
            <span class="log-icon">${type.icon}</span>
            <span class="log-title">${title}</span>
            ${unitBadge}
            ${!currentLogGroup ? `<span class="log-step">${d.logStep(steps)}</span>` : ''}
        </div>
    `;
    if (details) {
        if (Array.isArray(details)) {
            html += '<div class="log-details">' + details.join(' • ') + '</div>';
        } else {
            html += '<div class="log-details">' + details + '</div>';
        }
    }
    entry.innerHTML = html;
    target.appendChild(entry);
    const panel = document.getElementById('infoPanel');
    panel.scrollTop = panel.scrollHeight;
}

function updateInfoPanel(msg) { createLogEntry(LOG_TYPES.INFO, msg); }

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function setHtml(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}

function setPlaceholder(id, value) {
    const el = document.getElementById(id);
    if (el) el.placeholder = value;
}

function applyMetricsHelpLanguage(d) {
    setText('metricsHelpButton', d.metricsHelpButton || '');
    setText('metricsHelpTitle', d.metricsHelpTitle || '');
    setText('metricsHelpLine1', d.metricsHelpLine1 || '');
    setText('metricsHelpLine2', d.metricsHelpLine2 || '');
    setText('metricsHelpLine3', d.metricsHelpLine3 || '');
    setText('metricsHelpTheoryLink', d.metricsHelpTheoryLink || '');
    setText('metricsHelpCloseBtn', d.metricsHelpClose || '');

    const closeX = document.getElementById('metricsHelpCloseX');
    if (closeX) closeX.setAttribute('aria-label', d.metricsHelpClose || 'Close');
}

// ─── Theme / Language / Navigation ────────────────────────────────────────────
function reloadWithTransition(beforeReload) {
    const ov = document.getElementById('pageTransitionOverlay');
    ov.classList.add('visible');
    setTimeout(function() {
        if (beforeReload) beforeReload();
        window.location.reload();
    }, 350);
}

function navigateToPage(event, url) {
    event.preventDefault();
    const ov = document.getElementById('pageTransitionOverlay');
    ov.classList.add('visible');
    setTimeout(function() { window.location.href = url; }, 350);
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    reloadWithTransition(function() {
        if (isDark) {
            localStorage.setItem('theme', 'light');
        } else {
            localStorage.setItem('theme', 'dark');
        }
    });
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
    reloadWithTransition(function() {
        localStorage.setItem('lang', next);
    });
}

function updateLangToggleUI() {
    document.getElementById('langOptCZ').classList.toggle('active', currentLang === 'cz');
    document.getElementById('langOptEN').classList.toggle('active', currentLang === 'en');
}

function openMetricsHelp() {
    const modal = document.getElementById('metricsHelpModal');
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
}

function closeMetricsHelp() {
    const modal = document.getElementById('metricsHelpModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
}

function initializeMetricsHelpModal() {
    const modal = document.getElementById('metricsHelpModal');
    if (!modal) return;

    modal.addEventListener('click', function(event) {
        if (event.target === modal) closeMetricsHelp();
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.classList.contains('open')) closeMetricsHelp();
    });
}

// ─── Mode switching ────────────────────────────────────────────────────────────
function setMode(mode) {
    resetCounter();
    var navButtons = document.querySelectorAll('nav#navigation button');
    for (var i = 0; i < navButtons.length; i++) {
        navButtons[i].classList.remove('active');
    }
    var modeSections = document.querySelectorAll('.mode');
    for (var i = 0; i < modeSections.length; i++) {
        modeSections[i].classList.remove('active');
    }
    document.getElementById(mode + 'Tab').classList.add('active');
    document.getElementById(mode + 'Mode').classList.add('active');
    if (typeof updateCaseButtons === 'function') updateCaseButtons();
}

// ─── Apply language ────────────────────────────────────────────────────────────
function applyLanguage() {
    const d = dict[currentLang];

    document.title = d.pageTitle;
    setText('pageTitle', d.pageTitle);
    setText('pageNavHomeLabel', d.pageNavHome);
    setText('pageNavSimLabel', d.pageNavSim);
    setText('pageNavTheoryLabel', d.pageNavTheory);

    setText('manualTab', d.manual);
    setText('randomTab', d.random);
    setText('bestTab', d.best);
    setText('worstTab', d.worst);

    setText('btnIncrement', d.btnIncrement);
    setText('btnReset', d.btnReset);

    setText('randomModeTitle', d.randomModeTitle);
    setText('randomModeDesc', d.randomModeDesc);
    setText('randomMinTrailingLabel', d.randomMinTrailingLabel);
    setText('randomMaxTrailingLabel', d.randomMaxTrailingLabel);
    setPlaceholder('randomMinTrailing', d.randomMinTrailingPH);
    setPlaceholder('randomMaxTrailing', d.randomMaxTrailingPH);
    setText('btnGenRandom', d.btnGenRandom);

    setText('bestCaseTitle', d.bestCaseTitle);
    setHtml('bestCaseDesc', d.bestCaseDesc);
    setText('btnRunBest', d.btnPrepareVariant);
    setText('btnRunBestAlt', d.btnNextVariant);
    setText('btnBestIncrement', d.btnIncrementPrepared);
    setText('bestStepPrepareLabel', d.stepPrepareLabel);
    setText('bestStepRunLabel', d.stepRunLabel);

    setText('worstCaseTitle', d.worstCaseTitle);
    setHtml('worstCaseDesc', d.worstCaseDesc);
    setText('btnRunWorst', d.btnPrepareVariant);
    setText('btnRunWorstAlt', d.btnNextVariant);
    setText('btnWorstIncrement', d.btnIncrementPrepared);
    setText('worstStepPrepareLabel', d.stepPrepareLabel);
    setText('worstStepRunLabel', d.stepRunLabel);

    setText('bitLengthLabel', d.bitLengthLabel);
    setText('bitLengthHint', d.bitLengthHint);

    setText('creditCounter', `${d.coins}: 0`);
    setText('stepCounter', `${d.steps}: 0`);
    const instructionCounter = document.getElementById('instructionCounter');
    if (instructionCounter) instructionCounter.textContent = `${d.instructions}: 0`;
    applyMetricsHelpLanguage(d);
    setText('bankLabel', d.bankLabel);
    setText('footerText', d.footer);

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
document.addEventListener('DOMContentLoaded', function() {
    initializeMetricsHelpModal();
    applyTheme();
    applyLanguage();
});

window.addEventListener('load', function() {
    document.body.classList.add('page-loaded');
});

