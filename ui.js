let currentLang = localStorage.getItem('lang') || 'cz';

// Pevná pomalá rychlost animací
const animationDelay = 1;

// Vrátí zpoždění v ms pro danou základní hodnotu
function getDelay(base = 1) {
    const multipliers = { 1: 4, 2: 2, 3: 1, 4: 0.4, 5: 0.15 };
    return Math.round(base * (multipliers[animationDelay] || 1));
}


const dict = {
    en: {
        manual: 'Manual',
        random: 'Random',
        pageTitle: 'Amortized complexity for vector<>',
        randomModeTitle: 'Random Mode',
        pageNavHome:   'Home',
        pageNavSim:    'Simulation',
        pageNavTheory: 'Theory',

        bestCase: {
            title: 'Best Case',
            desc: `The <strong>Best Case</strong> scenario occurs when the array still has <strong class="highlight-green">unused capacity</strong>.<br>
                   Inserting a new element is instant because no resizing or copying is needed.<br><br>
                   Complexity: <strong class="badge">O(1)</strong>`,
            btn: 'Prepare Best Case',
            btnAlt: 'Other Best Case',
            insert: 'Insert into Best Case',
            ready: 'Best Case prepared! Array has capacity [4] but only 3 elements. Adding a number will be instant.',
            readyVariant: (cap, size) => `Best Case prepared! Capacity is [${cap}] and currently used slots are [${size}/${cap}]. Adding a number will be instant.`,
        },
        worstCase: {
            title: 'Worst Case',
            desc: `The <strong>Worst Case</strong> scenario occurs when the array is <strong class="highlight-red">completely full</strong>.<br>
                   Inserting a new element forces a <strong>resize</strong>—allocating a larger array, copying all elements, and then inserting.<br><br>
                   Complexity: <strong class="badge">O(N)</strong>, where <strong>N</strong> is the current number of stored elements that must be copied during the resize`,
            btn: 'Prepare Worst Case',
            btnAlt: 'Other Worst Case',
            insert: 'Insert into Worst Case',
            ready: 'Worst Case prepared! Array is full [4/4]. Adding a number will trigger a resize.',
            readyVariant: (cap) => `Worst Case prepared! Array is full [${cap}/${cap}]. Adding a number will trigger a resize and copy ${cap} elements.`,
        },

        best: 'Best Case',
        worst: 'Worst Case',
        addNumber: 'Add Number',
        generateRandom: 'Generate Random Array',
        randomCountLabel: 'Count:',
        randomMinLabel: 'Min:',
        randomMaxLabel: 'Max:',
        randomCountPlaceholder: 'Enter count',
        randomMinPlaceholder: 'Min value',
        randomMaxPlaceholder: 'Max value',
        coins: 'Coins',
        steps: 'Steps',
        willAppear: 'will appear here.',
        footer: '2026 by Jakub Cernik. Developed for educational purposes as a Bachelor Thesis.',
        pleaseEnterValidNumber: 'Please enter a valid number.',
        invalidInput: 'Invalid input. Please check the values and try again.',

        // --- Validation (shared) ---
        validationEmpty: 'Please fill out the field.',
        validationNotInteger: 'Please enter an integer.',
        validationOutOfRange: (min, max) => `Please enter a value in range ${min}–${max}.`,
        validationMinGreaterThanMax: 'Minimum must not be greater than maximum.',

        // --- Insertion ---
        insertTitle:        (val, idx) => `Inserting <strong>${val}</strong> into slot <span class="log-badge slot">[${idx}]</span>`,
        insertAllocCoins:   (n)        => `Allocated <span class="coin-text">${n} coin${n !== 1 ? 's' : ''}</span> (amortized prepayment)`,
        insertPaySelf:      ()         => `Spent <span class="coin-text">1 coin</span> for insertion`,
        insertPayCopy:      ()         => `Saved <span class="coin-text">2 coins</span> for future copy`,

        // --- Resize ---
        resizeTitle:        (old, nw)  => `Array full — resizing <span class="log-badge capacity">${old} → ${nw}</span>`,
        resizeWhy:          ()         => `For each existing element we need to pay 1 coin for copying`,
        resizeCopySlot:     (i)        => `Slot <span class="log-badge slot">[${i}]</span>: spent <span class="coin-text">1 coin</span> to copy`,
        resizeDoneSlots:    (n)        => `All <strong>${n} elements</strong> copied! Spent: <span class="coin-text">${n} coins</span>`,
        resizeNewSlots:     (old, nw)  => `Created <span class="log-badge capacity">${nw - old} new slots</span> [${old}–${nw - 1}]`,

        // --- Random ---
        randomGenerating:   (n, mn, mx)=> `Generating <strong>${n}</strong> random numbers in range [${mn}, ${mx}]`,
        randomDone:         (n)        => `Done — inserted <strong>${n}</strong> values`,

        // --- Errors ---
        arrayFull:          '🔴 Array full. Resizing needed!',
        noCoinsLeft:        'No coins left for insertion in slot',
        groupLabel:         (val, step) => `Step ${step} — inserting <strong>${val}</strong>`,
        logStep:            (n)         => `Step ${n}`,

        // --- Borrow / Invariant ---
        borrowFromSlot:     (i, lender) => `Slot <span class="log-badge slot">[${i}]</span> has <span class="log-badge coin">0 coins</span> — borrowing from <span class="log-badge slot">[${lender}]</span>`,
        invariantBroken:    (i)         => `Slot <span class="log-badge slot">[${i}]</span> — invariant broken, no coins!`,

        // --- Best / Worst finish ---
        bestCaseDone:       'Best Case — only one coin spent for push.',
        worstCaseDone:      'Worst Case — full array caused resize + coins spent for push.',
    },
    cz: {
        manual: 'Manuálně',
        random: 'Náhodně',
        pageTitle: 'Amortizovaná složitost pro vector<>',
        randomModeTitle: 'Náhodný režim',
        pageNavHome:   'Domů',
        pageNavSim:    'Simulace',
        pageNavTheory: 'Teorie',

        bestCase: {
            title: 'Nejlepší případ',
            desc: `<strong>Nejlepší případ</strong> nastává, když má pole stále <strong class="highlight-green">volnou kapacitu</strong>.<br>
                   Vložení nového prvku je okamžité, protože není potřeba zvětšovat pole ani kopírovat prvky.<br><br>
                   Složitost: <strong class="badge">O(1)</strong>`,
            btn: 'Připravit Nejlepší případ',
            btnAlt: 'Jiný nejlepší případ',
            insert: 'Vložit do Nejlepšího případu',
            ready: 'Nejlepší případ připraven! Pole má kapacitu [4], ale jen 3 prvky. Vložení bude okamžité.',
            readyVariant: (cap, size) => `Nejlepší případ připraven! Kapacita je [${cap}] a aktuálně je obsazeno [${size}/${cap}]. Vložení bude okamžité.`,
        },
        worstCase: {
            title: 'Nejhorší případ',
            desc: `<strong>Nejhorší případ</strong> nastává, když je pole <strong class="highlight-red">zcela zaplněné</strong>.<br>
                   Vložení nového prvku vynutí <strong>zvětšení (resize)</strong> — alokaci většího pole, zkopírování všech prvků a teprve poté vložení.<br><br>
                   Složitost: <strong class="badge">O(N)</strong>, kde <strong>N</strong> je aktuální počet uložených prvků, které se při resize musí zkopírovat`,
            btn: 'Připravit Nejhorší případ',
            btnAlt: 'Jiný nejhorší případ',
            insert: 'Vložit do Nejhoršího případu',
            ready: 'Nejhorší případ připraven! Pole je plné [4/4]. Vložení spustí resize.',
            readyVariant: (cap) => `Nejhorší případ připraven! Pole je plné [${cap}/${cap}]. Vložení spustí resize a zkopíruje ${cap} prvků.`,
        },

        best: 'Nejlepší případ',
        worst: 'Nejhorší případ',
        addNumber: 'Přidat číslo',
        enterNumber: 'Zadej číslo',
        generateRandom: 'Vygenerovat pole',
        randomCountLabel: 'Počet:',
        randomMinLabel: 'Min:',
        randomMaxLabel: 'Max:',
        randomCountPlaceholder: 'Zadej počet',
        randomMinPlaceholder: 'Min hodnota',
        randomMaxPlaceholder: 'Max hodnota',
        coins: 'Mince',
        steps: 'Kroky',
        willAppear: 'se budou zobrazovat zde.',
        footer: '2026 by Jakub Cernik. Vyvinuto pro vzdělávací účely jako bakalářská práce.',
        pleaseEnterValidNumber: 'Zadejte platné číslo.',
        invalidInput: 'Neplatný vstup. Zkontrolujte hodnoty a zkuste to znovu.',

        // --- Validace (sdílené) ---
        validationEmpty: 'Vyplňte pole.',
        validationNotInteger: 'Zadejte celé číslo.',
        validationOutOfRange: (min, max) => `Zadejte hodnotu v rozsahu ${min}–${max}.`,
        validationMinGreaterThanMax: 'Minimum nesmí být větší než maximum.',

        // --- Vložení ---
        insertTitle:        (val, idx) => `Vkládám <strong>${val}</strong> na pozici <span class="log-badge slot">[${idx}]</span>`,
        insertAllocCoins:   (n)        => `Přiděleno <span class="coin-text">${n} ${n === 1 ? 'mince' : (n >= 2 && n <= 4 ? 'mince' : 'mincí')}</span> (amortizovaná záloha)`,
        insertPaySelf:      ()         => `Utracena <span class="coin-text">1 mince</span> za samotné vložení`,
        insertPayCopy:      ()         => `Ušetřeny <span class="coin-text">2 mince</span> na budoucí kopírování`,

        // --- Resize ---
        resizeTitle:        (old, nw)  => `Pole plné — zvětšuji <span class="log-badge capacity">${old} → ${nw}</span>`,
        resizeWhy:          ()         => `Za každý již existující prvek musíme zaplatit 1 minci za kopírování`,
        resizeCopySlot:     (i)        => `Pozice <span class="log-badge slot">[${i}]</span>: utracena <span class="coin-text">1 mince</span> za kopírování`,
        resizeDoneSlots:    (n)        => `Všech <strong>${n} prvků</strong> zkopírováno! Utraceno: <span class="coin-text">${n} mincí</span>`,
        resizeNewSlots:     (old, nw)  => `Vytvořeno <span class="log-badge capacity">${nw - old} nových políček</span> [${old}–${nw - 1}]`,

        // --- Náhodné ---
        randomGenerating:   (n, mn, mx)=> `Generuji <strong>${n}</strong> náhodných čísel v rozsahu [${mn}, ${mx}]`,
        randomDone:         (n)        => `Hotovo — vloženo <strong>${n}</strong> hodnot`,

        // --- Chyby ---
        arrayFull:          'Pole je plné. Potřeba zvětšení!',
        noCoinsLeft:        'Nedostatek mincí na pozici',
        groupLabel:         (val, step) => `Krok ${step} — vkládám <strong>${val}</strong>`,
        logStep:            (n)         => `Krok ${n}`,

        // --- Půjčování / Invariant ---
        borrowFromSlot:     (i, lender) => `Pozice <span class="log-badge slot">[${i}]</span> má <span class="log-badge coin">0 mincí</span> — půjčujeme z <span class="log-badge slot">[${lender}]</span>`,
        invariantBroken:    (i)         => `Pozice <span class="log-badge slot">[${i}]</span> — invariant porušen, žádné mince!`,

        // --- Dokončení Best / Worst ---
        bestCaseDone:       'Nejlepší případ — utracena pouze jedna mince za vložení.',
        worstCaseDone:      'Nejhorší případ — plné pole vyvolalo resize + mince utraceny za vložení.',
    }
};

function reloadWithTransition(beforeReload)
{
    const overlay = document.getElementById('pageTransitionOverlay');
    overlay.classList.add('visible');

    setTimeout(() => {
        if (beforeReload) beforeReload();
        window.location.reload();
    }, 350);
}

function navigateToPage(event, url)
{
    event.preventDefault();
    const overlay = document.getElementById('pageTransitionOverlay');
    overlay.classList.add('visible');
    setTimeout(() => { window.location.href = url; }, 350);
}

function toggleTheme()
{
    const isDark = document.body.classList.contains('dark-mode');
    reloadWithTransition(() => {
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });
}

function applyTheme()
{
    const saved = localStorage.getItem('theme') || 'light';
    if (saved === 'dark') document.body.classList.add('dark-mode');

    updateThemeToggleUI();
}

function updateThemeToggleUI()
{
    const isDark = document.body.classList.contains('dark-mode');
    document.getElementById('themeOptLight').classList.toggle('active', !isDark);
    document.getElementById('themeOptDark').classList.toggle('active', isDark);
}

function toggleLanguage()
{
    const next = currentLang === 'cz' ? 'en' : 'cz';
    reloadWithTransition(() => {
        localStorage.setItem('lang', next);
    });
}

function updateLangToggleUI()
{
    document.getElementById('langOptCZ').classList.toggle('active', currentLang === 'cz');
    document.getElementById('langOptEN').classList.toggle('active', currentLang === 'en');
}

function setMode(mode)
{
    resetValues();

    document.querySelectorAll('nav button').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.mode').forEach(section => section.classList.remove('active'));

    document.getElementById(`${mode}Tab`).classList.add('active');
    document.getElementById(`${mode}Mode`).classList.add('active');

    // Reset special UI states for best/worst
    document.getElementById('bestCaseInputGroup').style.display = 'none';
    document.getElementById('btnRunBest').style.display = 'inline-block';

    document.getElementById('worstCaseInputGroup').style.display = 'none';
    document.getElementById('btnRunWorst').style.display = 'inline-block';
}

// Log types with icons
const LOG_TYPES = {
    // Minimal, unified icon set across the whole web
    INSERT:  { class: 'insert',  icon: '＋' },
    RESIZE:  { class: 'resize',  icon: '↔' },
    COPY:    { class: 'copy',    icon: '⧉' },
    BORROW:  { class: 'borrow',  icon: '⇄' },
    WARNING: { class: 'warning', icon: '!' },
    INFO:    { class: 'info',    icon: 'i' },
    SUCCESS: { class: 'insert',  icon: '✓' }
};

// Aktuálně otevřená skupina kroků
let currentLogGroup = null;

function beginLogGroup(value, stepNum) {
    const infoPanel = document.getElementById("infoPanel");
    const d = dict[currentLang];

    const group = document.createElement("div");
    group.classList.add("log-group");

    const header = document.createElement("div");
    header.classList.add("log-group-header");
    header.innerHTML = `
        <span class="log-group-icon">▶</span>
        <span class="log-group-title">${d.groupLabel ? d.groupLabel(value, stepNum) : d.logStep(stepNum) + ` — ${value}`}</span>
    `;

    const body = document.createElement("div");
    body.classList.add("log-group-body");

    group.appendChild(header);
    group.appendChild(body);
    infoPanel.appendChild(group);
    infoPanel.scrollTop = infoPanel.scrollHeight;

    currentLogGroup = body;
}

function endLogGroup() {
    currentLogGroup = null;
}

function createLogEntry(type, title, details = null)
{
    const target = currentLogGroup || document.getElementById("infoPanel");
    const logEntry = document.createElement("div");
    logEntry.classList.add('log-entry', type.class);

    const d = dict[currentLang];
    let html = `
        <div class="log-header">
            <span class="log-icon">${type.icon}</span>
            <span class="log-title">${title}</span>
            ${!currentLogGroup ? `<span class="log-step">${d.logStep(steps)}</span>` : ''}
        </div>
    `;

    if (details) {
        if (Array.isArray(details)) {
            const detailsText = details.join(' • ');
            html += `<div class="log-details">${detailsText}</div>`;
        } else {
            html += `<div class="log-details">${details}</div>`;
        }
    }

    logEntry.innerHTML = html;
    target.appendChild(logEntry);

    // Auto-scroll to bottom
    const infoPanel = document.getElementById("infoPanel");
    infoPanel.scrollTop = infoPanel.scrollHeight;
}

function updateInfoPanel(message)
{
    let type = LOG_TYPES.INFO;

    if (message.includes('Vkládám') || message.includes('Inserting')) {
        type = LOG_TYPES.INSERT;
    } else if (message.includes('zvětšuji') || message.includes('resizing')) {
        type = LOG_TYPES.RESIZE;
    } else if (message.includes('zkopírováno') || message.includes('copied')) {
        type = LOG_TYPES.SUCCESS;
    } else if (message.includes('půjčujeme') || message.includes('borrow')) {
        type = LOG_TYPES.BORROW;
    } else if (message.includes('invariant') || message.includes('Invariant') || message.includes('porušen')) {
        type = LOG_TYPES.WARNING;
    } else if (message.includes('utracena') || message.includes('spent')) {
        type = LOG_TYPES.COPY;
    }

    createLogEntry(type, message);
}

function updateInfoPanelWithDetails(mainMessage, details)
{
    let type = LOG_TYPES.INFO;

    if (mainMessage.includes('Vkládám') || mainMessage.includes('Inserting')) {
        type = LOG_TYPES.INSERT;
    } else if (mainMessage.includes('zvětšuji') || mainMessage.includes('resizing')) {
        type = LOG_TYPES.RESIZE;
    }

    createLogEntry(type, mainMessage, details);
}

function applyLanguage()
{
    const d = dict[currentLang];

    document.getElementById('manualTab').textContent = d.manual;
    document.getElementById('randomTab').textContent = d.random;
    document.getElementById('bestTab').textContent = d.best;
    document.getElementById('worstTab').textContent = d.worst;

    if (d.bestCase) {
        document.getElementById('bestCaseTitle').textContent = d.bestCase.title;
        document.getElementById('bestCaseDesc').innerHTML = d.bestCase.desc;
        document.getElementById('btnRunBest').textContent = d.bestCase.btn;
        const nextBest = document.getElementById('btnNextBest');
        if (nextBest && d.bestCase.btnAlt) nextBest.textContent = d.bestCase.btnAlt;
        document.getElementById('bestInput').placeholder = d.enterNumber;
        document.querySelector('#bestCaseInputGroup button').textContent = d.bestCase.insert;
    }

    if (d.worstCase) {
        document.getElementById('worstCaseTitle').textContent = d.worstCase.title;
        document.getElementById('worstCaseDesc').innerHTML = d.worstCase.desc;
        document.getElementById('btnRunWorst').textContent = d.worstCase.btn;
        const nextWorst = document.getElementById('btnNextWorst');
        if (nextWorst && d.worstCase.btnAlt) nextWorst.textContent = d.worstCase.btnAlt;
        document.getElementById('worstInput').placeholder = d.enterNumber;
        document.querySelector('#worstCaseInputGroup button').textContent = d.worstCase.insert;
    }

    document.querySelector('#manualMode .input-group button').textContent = d.addNumber;
    document.getElementById('manualInput').placeholder = d.enterNumber;

    document.querySelector('#randomMode h2').textContent = d.randomModeTitle;
    document.querySelector('label[for="randomCount"]').textContent = d.randomCountLabel;
    document.querySelector('label[for="randomMin"]').textContent   = d.randomMinLabel;
    document.querySelector('label[for="randomMax"]').textContent   = d.randomMaxLabel;
    document.getElementById('randomCount').placeholder = d.randomCountPlaceholder;
    document.getElementById('randomMin').placeholder   = d.randomMinPlaceholder;
    document.getElementById('randomMax').placeholder   = d.randomMaxPlaceholder;
    document.querySelector('#randomMode button').textContent = d.generateRandom;

    document.querySelector('header h1').textContent = d.pageTitle;
    document.getElementById('pageNavHomeLabel').textContent   = d.pageNavHome;
    document.getElementById('pageNavSimLabel').textContent    = d.pageNavSim;
    document.getElementById('pageNavTheoryLabel').textContent = d.pageNavTheory;

    document.getElementById('creditCounter').textContent = `${d.coins}: 0`;
    document.getElementById('stepCounter').textContent   = `${d.steps}: 0`;

    document.getElementById('footerText').textContent = d.footer;

    const infoPanel = document.getElementById("infoPanel");
    infoPanel.innerHTML = "";
    const initialEntry = document.createElement("div");
    initialEntry.classList.add('log-entry', 'info');
    initialEntry.innerHTML = `
        <div class="log-header">
            <span class="log-icon">${LOG_TYPES.INFO.icon}</span>
            <span>${d.steps} ${d.willAppear}</span>
        </div>
    `;
    infoPanel.appendChild(initialEntry);

    updateLangToggleUI();
}

document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    applyLanguage();
});

window.addEventListener('load', () => {
    document.body.classList.add('page-loaded');
});
