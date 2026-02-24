
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
        insertTitle:        (val, idx) => `Inserting <strong>${val}</strong> into slot [${idx}]`,
        insertAllocCoins:   (n)        => `Allocated <strong>${n} coins</strong> to the slot (amortized prepayment).`,
        insertPaySelf:      ()         => `Spent <strong>1 coin</strong> for the insertion itself.`,
        insertPayCopy:      ()         => `Saved <strong>1 coin</strong> for a future copy during resize.`,
        insertRemaining:    (n)        => `Slot now holds <strong>${n} coin${n !== 1 ? 's' : ''}</strong> in reserve.`,

        // --- Resize ---
        resizeTitle:        (old, nw)  => `Array full — resizing from capacity <strong>${old} → ${nw}</strong>`,
        resizeWhy:          ()         => `Each element had 1 saved coin. These coins now pay for copying — no extra cost!`,
        resizeCopySlot:     (i)        => `Slot [${i}]: spent <strong>1 saved coin</strong> to copy its value.`,
        resizeDoneSlots:    (n)        => `All <strong>${n} elements</strong> copied. Total coins spent = ${n} (already prepaid).`,
        resizeNewSlots:     (old, nw)  => `Created <strong>${nw - old} new empty slots</strong> [${old}–${nw - 1}].`,

        // --- Random ---
        randomGenerating:   (n, mn, mx)=> `Generating <strong>${n}</strong> random numbers in range [${mn}, ${mx}].`,
        randomDone:         (n)        => `Done — inserted <strong>${n}</strong> values.`,

        // --- Errors ---
        arrayFull:          'Array full. Resizing needed.',
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
        insertTitle:        (val, idx) => `Vkládám <strong>${val}</strong> na pozici [${idx}]`,
        insertAllocCoins:   (n)        => `Přiděleno <strong>${n} mincí</strong> políčku (amortizovaná záloha).`,
        insertPaySelf:      ()         => `Utracena <strong>1 mince</strong> za samotné vložení.`,
        insertPayCopy:      ()         => `Ušetřena <strong>1 mince</strong> jako záloha na budoucí kopírování při resize.`,
        insertRemaining:    (n)        => `Na políčku zbývá <strong>${n} ${n === 1 ? 'mince' : (n >= 2 && n <= 4 ? 'mince' : 'mincí')}</strong> v záloze.`,

        // --- Resize ---
        resizeTitle:        (old, nw)  => `Pole plné — zvětšuji kapacitu <strong>${old} → ${nw}</strong>`,
        resizeWhy:          ()         => `Každý prvek měl 1 ušetřenou minci. Ty teď platí za kopírování — žádná extra cena!`,
        resizeCopySlot:     (i)        => `Pozice [${i}]: utracena <strong>1 ušetřená mince</strong> za zkopírování hodnoty.`,
        resizeDoneSlots:    (n)        => `Všech <strong>${n} prvků</strong> zkopírováno. Celkem utraceno = ${n} mincí (již zálohovány).`,
        resizeNewSlots:     (old, nw)  => `Vytvořeno <strong>${nw - old} nových prázdných políček</strong> [${old}–${nw - 1}].`,

        // --- Náhodné ---
        randomGenerating:   (n, mn, mx)=> `Generuji <strong>${n}</strong> náhodných čísel v rozsahu [${mn}, ${mx}].`,
        randomDone:         (n)        => `Hotovo — vloženo <strong>${n}</strong> hodnot.`,

        // --- Chyby ---
        arrayFull:          'Pole je plné. Potřeba zvětšení.',
        noCoinsLeft:        'V poli není dost mincí pro vložení na pozici',
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

function updateInfoPanel(message)
{
    const infoPanel = document.getElementById("infoPanel");

    const logEntry = document.createElement("div");
    logEntry.classList.add('log-entry');
    logEntry.innerHTML = `<strong>Step ${steps}:</strong> ${message}`;

    infoPanel.appendChild(logEntry);
}

function updateInfoPanelWithDetails(mainMessage, details)
{
    const infoPanel = document.getElementById("infoPanel");

    const logEntry = document.createElement("div");
    logEntry.classList.add('log-entry');

    logEntry.innerHTML = `
        <strong>Step ${steps}:</strong> ${mainMessage}
        <button onclick="toggleDetails(this)">Details</button>
        <div class="details" style="display: none; margin-top: 10px; font-size: 12px; color: #666;">
            ${details}
        </div>
    `;

    infoPanel.appendChild(logEntry);
}

function toggleDetails(button)
{
    const details = button.nextElementSibling;
    details.style.display = details.style.display === "none" ? "block" : "none";
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
    document.getElementById("infoPanel").textContent  = d.steps + " " + d.willAppear;

    updateLangToggleUI();
}

document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    applyLanguage();
});

window.addEventListener('load', () => {
    document.body.classList.add('page-loaded');
});
