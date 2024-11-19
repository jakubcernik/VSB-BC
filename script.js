let array = [];
let capacity = 1; // počáteční velikost pole
let creditsPerSlot = []; // Počet mincí nad každým políčkem
let credit = 0;
let steps = 0;

function visualizeArray() {
    const arrayContainer = document.getElementById("arrayVisualization");
    arrayContainer.innerHTML = ''; // Vymazání starého obsahu

    for (let i = 0; i < capacity; i++) {
        const frame = document.createElement("div");
        frame.classList.add("frame");

        // Zobrazíme hodnotu, pokud políčko obsahuje prvek
        if (i < array.length) {
            frame.innerText = array[i];
        } else {
            frame.innerText = ""; // Prázdné políčko
        }

        // Zobrazíme mince podle kreditu políčka
        const coinsContainer = document.createElement("div");
        coinsContainer.classList.add("coins");

        const coinsNeeded = i < creditsPerSlot.length ? creditsPerSlot[i] : 0;
        for (let j = 0; j < coinsNeeded; j++) {
            const coin = document.createElement("div");
            coin.classList.add("coin");
            coinsContainer.appendChild(coin);
        }

        frame.appendChild(coinsContainer);
        arrayContainer.appendChild(frame);
    }

    document.getElementById("stepCounter").innerHTML = `Počet kroků: ${steps}`;
}


async function addElement() {
    const input = document.getElementById("manualInput");
    const value = parseInt(input.value);

    if (isNaN(value)) {
        updateInfoPanel("Prosím, zadejte platné číslo.");
        return;
    }

    steps++;

    if (array.length === capacity) {
        // Pokud je pole plné, zvětšíme kapacitu
        let oldCapacity = capacity;
        capacity *= 2;

        let totalCreditsNeeded = array.length; // Mince potřebné na kopírování
        for (let i = 0; i < creditsPerSlot.length && totalCreditsNeeded > 0; i++) {
            const creditsToUse = Math.min(creditsPerSlot[i], totalCreditsNeeded);
            creditsPerSlot[i] -= creditsToUse;
            totalCreditsNeeded -= creditsToUse;

            if (creditsPerSlot[i] === 0) {
                updateInfoPanel(`Pole ${i} spotřebovalo všechny své mince.`);
            }
        }

        if (array.length === capacity) {
            let oldCapacity = capacity;
            capacity *= 2;

            updateInfoPanel(`Pole bylo plné. Zvětšujeme kapacitu z ${oldCapacity} na ${capacity}.`);
            await consumeCreditsForExpansion(); // Spotřebujeme mince pro zvětšení pole
        }

    }

    // Přidáme nový prvek a jeho mince
    array.push(value);
    creditsPerSlot.push(3); // Každé políčko začíná se 3 mincemi

    updateInfoPanel(`Přidali jsme prvek ${value}. Nad políčkem jsou nyní 3 mince.`);
    visualizeArray(); // Aktualizujeme vizualizaci
    input.value = ""; // Vyčistíme vstup
}

async function consumeCreditsForExpansion() {
    let totalCreditsNeeded = array.length; // Mince potřebné na kopírování
    for (let i = 0; i < creditsPerSlot.length && totalCreditsNeeded > 0; i++) {
        while (creditsPerSlot[i] > 0 && totalCreditsNeeded > 0) {
            creditsPerSlot[i]--;
            totalCreditsNeeded--;

            visualizeArray(); // Aktualizujeme vizualizaci po každém odebrání mince

            // Simulujeme krátkou prodlevu pro vizualizaci
            await new Promise((resolve) => setTimeout(resolve, 300));
        }

        if (creditsPerSlot[i] === 0) {
            const frame = document.querySelector(`.frame:nth-child(${i + 1})`);
            frame.style.border = "2px solid red"; // Zvýraznění
            await new Promise((resolve) => setTimeout(resolve, 500)); // Krátká prodleva
            frame.style.border = ""; // Zrušíme zvýraznění
            updateInfoPanel(`Pole ${i} spotřebovalo všechny své mince.`);
        }
    }
}

function updateInfoPanel(message) {
    const infoPanel = document.getElementById("infoPanel");
    const logEntry = document.createElement("div");
    logEntry.textContent = message;
    logEntry.style.marginBottom = "5px";
    logEntry.style.fontSize = "14px";

    infoPanel.prepend(logEntry); // Přidáme novou zprávu na začátek
}


function runBestCase() {
    array = [];
    capacity = 1; // Opraveno
    creditsPerSlot = [];
    steps = 0;

    updateInfoPanel("Simulujeme nejlepší případ, kde se každé vložení vejde bez zvětšení kapacity.");
    for (let i = 0; i < 10; i++) {
        document.getElementById("manualInput").value = i;
        addElement();
    }
}


function runWorstCase() {
    array = [];
    capacity = 2;
    credit = 0;
    steps = 0;
    updateInfoPanel("Simulujeme nejhorší případ, kde dochází ke zvětšení kapacity téměř po každém vložení.");

    for (let i = 0; i < 16; i++) { // nastavíme delší řadu
        document.getElementById("manualInput").value = i;
        addElement();
    }
}
