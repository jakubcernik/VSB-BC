let currentLang = localStorage.getItem('lang') || 'cz';

// Rychlost animací je řízená sliderem (1 = nejpomalejší, 5 = nejrychlejší).
let animationDelay = 3;
let instantAnimationMode = false;

// Vrátí zpoždění v ms pro danou základní hodnotu
function getDelay(base = 1) {
    if (instantAnimationMode) return 0;
    const multipliers = { 1: 4, 2: 2, 3: 1, 4: 0.4, 5: 0.15 };
    return Math.round(base * (multipliers[animationDelay] || 1));
}

function getSpeedMultiplierValue(level = animationDelay) {
    const multipliers = { 1: 0.25, 2: 0.5, 3: 1, 4: 2.5, 5: 6.67 };
    return multipliers[level] || 1;
}

function updateRandomSpeedValue() {
    const speedEl = document.getElementById('randomSpeedValue');
    if (!speedEl) return;
    speedEl.textContent = `${getSpeedMultiplierValue().toFixed(2)}x`;
}

function setAnimationSpeedLevel(level) {
    animationDelay = Math.max(1, Math.min(5, Number(level) || 3));
    const slider = document.getElementById('randomSpeed');
    if (slider) slider.value = String(animationDelay);
    updateRandomSpeedValue();
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
        manualStepTitle: 'Step Controls',
        stepHelpLabel: 'What is small vs big step?',
        stepHelpSmall: 'Small step: executes one atomic coin-cost action (for example copying one element).',
        stepHelpBig: 'Big step: completes one full push_back operation from the entered value, including resize/copy if needed.',
        randomParamsTitle: 'Generation Parameters',
        randomRunTitle: 'Run',
        randomSpeedTitle: 'Simulation Speed',
        smallStep: 'Small Step',
        bigStep: 'Big Step (Full Insert)',
        randomPause: 'Pause',
        randomResume: 'Resume',
        randomSpeed: 'Speed:',
        coins: 'Coins',
        operations: 'Steps',
        steps: 'Steps',
        instructions: 'Instructions',
        instructionBoundIdle: 'Instruction limit is shown after first operation.',
        instructionBoundWithin: (instructionCount, operationCount, limit) => `Within limit: ${instructionCount}/${limit} instructions for ${operationCount} steps.`,
        instructionBoundExceeded: (instructionCount, operationCount, limit) => `Limit exceeded: ${instructionCount}/${limit} instructions for ${operationCount} steps.`,
        metricsHelpButton: 'What do metrics mean?',
        metricsHelpTitle: 'Metrics explained',
        metricsHelpLine1: 'Step means one push_back request from the user.',
        metricsHelpLine2: 'Instruction means one atomic action that costs one coin (insert one item or copy one item).',
        metricsHelpLine3: 'In this simulation, instruction count should stay at most three times the operation count.',
        metricsHelpTheoryLink: 'Open theory section',
        metricsHelpClose: 'Close',
        badgeOperation: 'STEP',
        badgeInstruction: 'INS',
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
        atomicAllocStep:    (idx, n)   => `Slot <span class="log-badge slot">[${idx}]</span>: allocated <span class="coin-text">${n} coins</span>`,
        atomicInsertStep:   (val, idx) => `Inserting <strong>${val}</strong> into slot <span class="log-badge slot">[${idx}]</span>`,
        atomicSpendStep:    (idx)      => `Slot <span class="log-badge slot">[${idx}]</span>: spent <span class="coin-text">1 coin</span> for insertion`,
        atomicDepositStep:  (idx)      => `Slot <span class="log-badge slot">[${idx}]</span>: saved <span class="coin-text">1 coin</span> to bank`,

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
        manualStepTitle: 'Krokování simulace',
        stepHelpLabel: 'Co je malý a velký krok?',
        stepHelpSmall: 'Malý krok: provede jednu atomickou akci za minci (např. zkopírování jednoho prvku).',
        stepHelpBig: 'Velký krok: dokončí celé vložení hodnoty ze vstupu, včetně resize/kopírování pokud je potřeba.',
        randomParamsTitle: 'Parametry generování',
        randomRunTitle: 'Spuštění',
        randomSpeedTitle: 'Rychlost simulace',
        smallStep: 'Malý krok',
        bigStep: 'Velký krok (celé vložení)',
        randomPause: 'Pozastavit',
        randomResume: 'Pokračovat',
        randomSpeed: 'Rychlost:',
        coins: 'Mince',
        operations: 'Kroky',
        steps: 'Kroky',
        instructions: 'Instrukce',
        instructionBoundIdle: 'Limit instrukcí se zobrazí po prvním kroku.',
        instructionBoundWithin: (instructionCount, operationCount, limit) => `V limitu: ${instructionCount}/${limit} instrukcí pro ${operationCount} kroků.`,
        instructionBoundExceeded: (instructionCount, operationCount, limit) => `Limit překročen: ${instructionCount}/${limit} instrukcí pro ${operationCount} kroků.`,
        metricsHelpButton: 'Co znamenají metriky?',
        metricsHelpTitle: 'Vysvětlení metrik',
        metricsHelpLine1: 'Krok znamená jeden požadavek push_back od uživatele.',
        metricsHelpLine2: 'Instrukce znamená jednu atomickou akci za jednu minci (vložit prvek nebo zkopírovat prvek).',
        metricsHelpLine3: 'V této simulaci by počet instrukcí měl být nejvýše trojnásobek počtu kroků.',
        metricsHelpTheoryLink: 'Otevřít část teorie',
        metricsHelpClose: 'Zavřít',
        badgeOperation: 'KROK',
        badgeInstruction: 'INS',
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
        atomicAllocStep:    (idx, n)   => `Pozice <span class="log-badge slot">[${idx}]</span>: přiděleny <span class="coin-text">${n} mince</span>`,
        atomicInsertStep:   (val, idx) => `Vkládám <strong>${val}</strong> na pozici <span class="log-badge slot">[${idx}]</span>`,
        atomicSpendStep:    (idx)      => `Pozice <span class="log-badge slot">[${idx}]</span>: utracena <span class="coin-text">1 mince</span> za vložení`,
        atomicDepositStep:  (idx)      => `Pozice <span class="log-badge slot">[${idx}]</span>: uložena <span class="coin-text">1 mince</span> do banky`,

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

function openMetricsHelp()
{
    const modal = document.getElementById('metricsHelpModal');
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
}

function closeMetricsHelp()
{
    const modal = document.getElementById('metricsHelpModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
}

function initializeMetricsHelpModal()
{
    const modal = document.getElementById('metricsHelpModal');
    if (!modal) return;

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeMetricsHelp();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('open')) {
            closeMetricsHelp();
        }
    });
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

    const randomPause = document.getElementById('btnRandomPause');
    if (randomPause) {
        randomPause.disabled = true;
        randomPause.dataset.state = 'pause';
    }

    if (typeof stopRandomGeneration === 'function') {
        stopRandomGeneration();
    }
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
        <span class="log-unit-badge operation">${d.badgeOperation || 'STEP'}</span>
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

function createLogEntry(type, title, details = null, meta = null)
{
    const target = currentLogGroup || document.getElementById("infoPanel");
    const logEntry = document.createElement("div");
    logEntry.classList.add('log-entry', type.class);

    const d = dict[currentLang];
    const unitBadge = meta && meta.unit === 'instruction'
        ? `<span class="log-unit-badge instruction">${d.badgeInstruction || 'INS'}</span>`
        : '';
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

function updateInfoPanel(message, meta = null)
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

    createLogEntry(type, message, null, meta);
}

function updateInfoPanelWithDetails(mainMessage, details, meta = null)
{
    let type = LOG_TYPES.INFO;

    if (mainMessage.includes('Vkládám') || mainMessage.includes('Inserting')) {
        type = LOG_TYPES.INSERT;
    } else if (mainMessage.includes('zvětšuji') || mainMessage.includes('resizing')) {
        type = LOG_TYPES.RESIZE;
    }

    createLogEntry(type, mainMessage, details, meta);
}

function setText(id, text)
{
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function setHtml(id, html)
{
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}

function setPlaceholder(id, value)
{
    const el = document.getElementById(id);
    if (el) el.placeholder = value;
}

function applyLanguage()
{
    const d = dict[currentLang];

    setText('manualTab', d.manual);
    setText('randomTab', d.random);
    setText('bestTab', d.best);
    setText('worstTab', d.worst);

    if (d.bestCase) {
        setText('bestCaseTitle', d.bestCase.title);
        setHtml('bestCaseDesc', d.bestCase.desc);
        setText('btnRunBest', d.bestCase.btn);
        const nextBest = document.getElementById('btnNextBest');
        if (nextBest && d.bestCase.btnAlt) nextBest.textContent = d.bestCase.btnAlt;
        setPlaceholder('bestInput', d.enterNumber);
        document.querySelector('#bestCaseInputGroup button').textContent = d.bestCase.insert;
    }

    if (d.worstCase) {
        setText('worstCaseTitle', d.worstCase.title);
        setHtml('worstCaseDesc', d.worstCase.desc);
        setText('btnRunWorst', d.worstCase.btn);
        const nextWorst = document.getElementById('btnNextWorst');
        if (nextWorst && d.worstCase.btnAlt) nextWorst.textContent = d.worstCase.btnAlt;
        setPlaceholder('worstInput', d.enterNumber);
        document.querySelector('#worstCaseInputGroup button').textContent = d.worstCase.insert;
    }

    setPlaceholder('manualInput', d.enterNumber);
    setText('manualStepTitle', d.manualStepTitle);
    setText('stepHelpSummary', d.stepHelpLabel);
    setHtml('stepHelpText', `${d.stepHelpSmall}<br>${d.stepHelpBig}`);
    setText('btnSmallStep', d.smallStep);
    setText('btnBigStep', d.bigStep);

    document.querySelector('label[for="randomCount"]').textContent = d.randomCountLabel;
    document.querySelector('label[for="randomMin"]').textContent   = d.randomMinLabel;
    document.querySelector('label[for="randomMax"]').textContent   = d.randomMaxLabel;
    setPlaceholder('randomCount', d.randomCountPlaceholder);
    setPlaceholder('randomMin', d.randomMinPlaceholder);
    setPlaceholder('randomMax', d.randomMaxPlaceholder);
    setText('randomParamsTitle', d.randomParamsTitle);
    setText('randomRunTitle', d.randomRunTitle);
    setText('randomSpeedTitle', d.randomSpeedTitle);
    setText('btnRandomStart', d.generateRandom);

    const randomPause = document.getElementById('btnRandomPause');
    if (randomPause) {
        const state = randomPause.dataset.state || 'pause';
        randomPause.textContent = state === 'resume' ? d.randomResume : d.randomPause;
    }

    setText('randomSpeedLabel', d.randomSpeed);
    updateRandomSpeedValue();

    document.querySelector('header h1').textContent = d.pageTitle;
    setText('pageNavHomeLabel', d.pageNavHome);
    setText('pageNavSimLabel', d.pageNavSim);
    setText('pageNavTheoryLabel', d.pageNavTheory);

    const creditCounter = document.getElementById('creditCounter');
    if (creditCounter) creditCounter.textContent = `${d.coins}: 0`;

    const stepCounter = document.getElementById('stepCounter');
    if (stepCounter) {
        stepCounter.textContent = `${d.steps}: 0`;
    }

    const instructionCounter = document.getElementById('instructionCounter');
    if (instructionCounter) instructionCounter.textContent = `${d.instructions}: 0`;

    const instructionBound = document.getElementById('instructionBound');
    if (instructionBound) instructionBound.textContent = d.instructionBoundIdle || '';

    const metricsHelpButton = document.getElementById('metricsHelpButton');
    if (metricsHelpButton) metricsHelpButton.textContent = d.metricsHelpButton || '';

    const metricsHelpTitle = document.getElementById('metricsHelpTitle');
    if (metricsHelpTitle) metricsHelpTitle.textContent = d.metricsHelpTitle || '';

    const metricsHelpLine1 = document.getElementById('metricsHelpLine1');
    if (metricsHelpLine1) metricsHelpLine1.textContent = d.metricsHelpLine1 || '';

    const metricsHelpLine2 = document.getElementById('metricsHelpLine2');
    if (metricsHelpLine2) metricsHelpLine2.textContent = d.metricsHelpLine2 || '';

    const metricsHelpLine3 = document.getElementById('metricsHelpLine3');
    if (metricsHelpLine3) metricsHelpLine3.textContent = d.metricsHelpLine3 || '';

    const metricsHelpTheoryLink = document.getElementById('metricsHelpTheoryLink');
    if (metricsHelpTheoryLink) metricsHelpTheoryLink.textContent = d.metricsHelpTheoryLink || '';

    const metricsHelpCloseBtn = document.getElementById('metricsHelpCloseBtn');
    if (metricsHelpCloseBtn) metricsHelpCloseBtn.textContent = d.metricsHelpClose || '';

    const metricsHelpCloseX = document.getElementById('metricsHelpCloseX');
    if (metricsHelpCloseX) metricsHelpCloseX.setAttribute('aria-label', d.metricsHelpClose || 'Close');

    if (typeof window.renderVectorTrackers === 'function') {
        window.renderVectorTrackers();
    }

    setText('footerText', d.footer);

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
    initializeMetricsHelpModal();
    applyTheme();
    applyLanguage();
    setAnimationSpeedLevel(3);
});

window.addEventListener('load', () => {
    document.body.classList.add('page-loaded');
});
