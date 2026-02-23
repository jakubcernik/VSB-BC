let currentLang = 'cz';

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
        switchToDark: 'Switch to Dark Mode',
        switchToLight: 'Switch to Light Mode',
        footer: '2025 by Jakub Cernik. Developed for educational purposes as a Bachelor Thesis.',
        pleaseEnterValidNumber: 'Please enter a valid number.',
        invalidInput: 'Invalid input. Please check the values and try again.',
        arrayFull: 'Array full. Resizing needed.',
        noCoinsLeft: 'No coins left for insertion in slot',
        addedValue: 'Added value',
        newSlotHas: 'New slot has',
        spentInsertion: 'Spent 1 coin for insertion.'
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
        switchToDark: 'Přepnout do tmavého režimu',
        switchToLight: 'Přepnout do světlého režimu',
        footer: '2024 by Jakub Cernik. Vyvinuto pro vzdělávací účely jako bakalářská práce.',
        pleaseEnterValidNumber: 'Zadejte platné číslo.',
        invalidInput: 'Neplatný vstup. Zkontrolujte hodnoty a zkuste to znovu.',
        arrayFull: 'Pole je plné. Potřeba zvětšení.',
        noCoinsLeft: 'V poli není dost mincí pro vložení na pozici',
        addedValue: 'Přidána hodnota',
        newSlotHas: 'Nové políčko má',
        spentInsertion: 'Utracena 1 mince za vložení.'
    }
};

function toggleTheme()
{
    const body = document.body;
    const button = document.getElementById("themeToggle");

    body.classList.toggle("dark-mode");

    const d = dict[currentLang];
    button.textContent = body.classList.contains("dark-mode") ? d.switchToLight : d.switchToDark;
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
        <button onclick="toggleDetails(this)" style="margin-left: 10px; font-size: 12px; padding: 2px 6px; border: none; background: #eee; cursor: pointer;">Details</button>
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

function toggleLanguage()
{
    currentLang = currentLang === 'cz' ? 'en' : 'cz';
    applyLanguage();
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
    
    document.getElementById('creditCounter').textContent =
        `${d.coins}: ${typeof creditsPerSlot !== 'undefined' ? creditsPerSlot.reduce((s, c) => s + c, 0) : 0}`;
    document.getElementById('stepCounter').textContent =
        `${d.steps}: ${typeof steps !== 'undefined' ? steps : 0}`;
    
    document.querySelector('footer p').textContent = d.footer;
    
    const themeBtn = document.getElementById('themeToggle');
    themeBtn.textContent = document.body.classList.contains('dark-mode') ? d.switchToLight : d.switchToDark;
    
    const langBtn = document.getElementById('langToggle');
    if (langBtn) langBtn.textContent = currentLang === 'cz' ? 'CZ' : 'EN';
}

applyLanguage();