
let currentLang = localStorage.getItem('lang') || 'cz';

const dict = {
    en: {
        manual: 'Manual',
        random: 'Random',
        best: 'Best Case',
        worst: 'Worst Case',
        addNumber: 'Add Number',
        enterNumber: 'Enter a number',
        generateRandom: 'Generate Random Array',
        coins: 'Coins',
        steps: 'Steps',
        willAppear: 'will appear here.',
        footer: '2025 by Jakub Cernik. Developed for educational purposes as a Bachelor Thesis.',
        pleaseEnterValidNumber: 'Please enter a valid number.',
        invalidInput: 'Invalid input. Please check the values and try again.',

        // --- Insertion ---
        insertTitle:        (val, idx) => `Inserting <strong>${val}</strong> into slot <span class="log-badge slot">[${idx}]</span>`,
        insertAllocCoins:   (n)        => `💰 Allocated <span class="coin-text">${n} coin${n !== 1 ? 's' : ''}</span> (amortized prepayment)`,
        insertPaySelf:      ()         => `💳 Spent <span class="coin-text">1 coin</span> for insertion`,
        insertPayCopy:      ()         => `🏦 Saved <span class="coin-text">1 coin</span> for future copy`,
        insertRemaining:    (n)        => `Slot now holds <span class="coin-text">${n} coin${n !== 1 ? 's' : ''}</span>`,

        // --- Resize ---
        resizeTitle:        (old, nw)  => `Array full — resizing <span class="log-badge capacity">${old} → ${nw}</span>`,
        resizeWhy:          ()         => `Each element had 1 saved coin. These coins now pay for copying!`,
        resizeCopySlot:     (i)        => `Slot <span class="log-badge slot">[${i}]</span>: spent <span class="log-badge coin">1 coin</span> to copy`,
        resizeDoneSlots:    (n)        => `✅ All <strong>${n} elements</strong> copied! Spent: <span class="log-badge coin">${n} coins</span>`,
        resizeNewSlots:     (old, nw)  => `📦 Created <span class="log-badge capacity">${nw - old} new slots</span> [${old}–${nw - 1}]`,

        // --- Random ---
        randomGenerating:   (n, mn, mx)=> `Generating <strong>${n}</strong> random numbers in range [${mn}, ${mx}]`,
        randomDone:         (n)        => `Done — inserted <strong>${n}</strong> values`,

        // --- Errors ---
        arrayFull:          '🔴 Array full. Resizing needed!',
        noCoinsLeft:        'No coins left for insertion in slot',
    },
    cz: {
        manual: 'Manuálně',
        random: 'Náhodně',
        best: 'Nejlepší případ',
        worst: 'Nejhorší případ',
        addNumber: 'Přidat číslo',
        enterNumber: 'Zadej číslo',
        generateRandom: 'Vygenerovat pole',
        coins: 'Mince',
        steps: 'Kroky',
        willAppear: 'se budou zobrazovat zde.',
        footer: '2024 by Jakub Cernik. Vyvinuto pro vzdělávací účely jako bakalářská práce.',
        pleaseEnterValidNumber: 'Zadejte platné číslo.',
        invalidInput: 'Neplatný vstup. Zkontrolujte hodnoty a zkuste to znovu.',

        // --- Vložení ---
        insertTitle:        (val, idx) => `Vkládám <strong>${val}</strong> na pozici <span class="log-badge slot">[${idx}]</span>`,
        insertAllocCoins:   (n)        => `💰 Přiděleno <span class="coin-text">${n} ${n === 1 ? 'mince' : (n >= 2 && n <= 4 ? 'mince' : 'mincí')}</span> (amortizovaná záloha)`,
        insertPaySelf:      ()         => `💳 Utracena <span class="coin-text">1 mince</span> za samotné vložení`,
        insertPayCopy:      ()         => `🏦 Ušetřena <span class="coin-text">1 mince</span> na budoucí kopírování`,
        insertRemaining:    (n)        => `Na políčku zbývá <span class="coin-text">${n} ${n === 1 ? 'mince' : (n >= 2 && n <= 4 ? 'mince' : 'mincí')}</span>`,

        // --- Resize ---
        resizeTitle:        (old, nw)  => `Pole plné — zvětšuji <span class="log-badge capacity">${old} → ${nw}</span>`,
        resizeWhy:          ()         => `Každý prvek měl 1 ušetřenou minci. Ty teď platí za kopírování!`,
        resizeCopySlot:     (i)        => `Pozice <span class="log-badge slot">[${i}]</span>: utracena <span class="log-badge coin">1 mince</span> za kopírování`,
        resizeDoneSlots:    (n)        => `✅ Všech <strong>${n} prvků</strong> zkopírováno! Utraceno: <span class="log-badge coin">${n} mincí</span>`,
        resizeNewSlots:     (old, nw)  => `📦 Vytvořeno <span class="log-badge capacity">${nw - old} nových políček</span> [${old}–${nw - 1}]`,

        // --- Náhodné ---
        randomGenerating:   (n, mn, mx)=> `Generuji <strong>${n}</strong> náhodných čísel v rozsahu [${mn}, ${mx}]`,
        randomDone:         (n)        => `Hotovo — vloženo <strong>${n}</strong> hodnot`,

        // --- Chyby ---
        arrayFull:          '🔴 Pole je plné. Potřeba zvětšení!',
        noCoinsLeft:        'Nedostatek mincí na pozici',
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
}

// Log types with icons
const LOG_TYPES = {
    INSERT: { class: 'insert', icon: '➕' },
    RESIZE: { class: 'resize', icon: '📏' },
    COPY: { class: 'copy', icon: '📋' },
    BORROW: { class: 'borrow', icon: '💸' },
    WARNING: { class: 'warning', icon: '⚠️' },
    INFO: { class: 'info', icon: 'ℹ️' },
    SUCCESS: { class: 'insert', icon: '✓' }
};

function createLogEntry(type, title, details = null)
{
    const infoPanel = document.getElementById("infoPanel");
    const logEntry = document.createElement("div");
    logEntry.classList.add('log-entry', type.class);

    let html = `
        <div class="log-header">
            <span class="log-icon">${type.icon}</span>
            <span class="log-title">${title}</span>
            <span class="log-step">Krok ${steps}</span>
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
    infoPanel.appendChild(logEntry);

    // Auto-scroll to bottom
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
    } else if (message.includes('⚠️') || message.includes('invariant')) {
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

    document.querySelector('#manualMode .input-group button').textContent = d.addNumber;
    document.getElementById('manualInput').placeholder = d.enterNumber;
    document.querySelector('#randomMode button').textContent = d.generateRandom;

    document.getElementById('creditCounter').textContent = `${d.coins}: 0`;
    document.getElementById('stepCounter').textContent   = `${d.steps}: 0`;

    document.getElementById('footerText').textContent = d.footer;

    const infoPanel = document.getElementById("infoPanel");
    infoPanel.innerHTML = "";
    const initialEntry = document.createElement("div");
    initialEntry.classList.add('log-entry', 'info');
    initialEntry.innerHTML = `
        <div class="log-header">
            <span class="log-icon">👋</span>
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
