let array = [];
let capacity = 1; // počáteční velikost pole
let credit = 0;
let steps = 0;

function visualizeArray() {
    const arrayContainer = document.getElementById("arrayVisualization");
    arrayContainer.innerHTML = ''; // Vymazání starého obsahu

    // Vytvoření vizualizace každého prvku v poli
    array.forEach((value, index) => {
        const frame = document.createElement("div");
        frame.classList.add("frame");

        // Zobrazíme mince jako kredit nad každým políčkem
        const coinsContainer = document.createElement("div");
        coinsContainer.classList.add("coins");

        const coinsNeeded = Math.min(credit, index + 1); // Počet mincí pro každé políčko
        for (let i = 0; i < coinsNeeded; i++) {
            const coin = document.createElement("div");
            coin.classList.add("coin");
            coinsContainer.appendChild(coin);
        }

        // Přidáme hodnotu prvku
        frame.innerText = value;
        frame.appendChild(coinsContainer);
        arrayContainer.appendChild(frame);
    });

    // Zobrazení prázdných políček po zvětšení kapacity
    const emptySlots = capacity - array.length;
    for (let i = 0; i < emptySlots; i++) {
        const frame = document.createElement("div");
        frame.classList.add("frame");
        frame.innerText = ""; // Prázdné pole
        arrayContainer.appendChild(frame);
    }

    document.getElementById("creditCounter").innerHTML = `Naspořené mince: ${credit}`;
    document.getElementById("stepCounter").innerHTML = `Počet kroků: ${steps}`;
}

function updateInfoPanel(message) {
    document.getElementById("infoPanel").innerHTML = message;
    appendLog(message); // Přidáme zprávu do logu
}

function appendLog(message) {
    const logContainer = document.getElementById("log");
    const entry = document.createElement("div");
    entry.classList.add("log-entry", "newest");
    entry.innerHTML = `<strong>${steps}. krok:</strong> ${message}`;

    // Novou zprávu přidáme na začátek
    logContainer.prepend(entry);

    // Aktualizace starších zpráv (zašednutí)
    const entries = logContainer.querySelectorAll(".log-entry");
    entries.forEach((entry, index) => {
        entry.classList.remove("newest");
        if (index > 0) entry.style.color = `rgba(102, 102, 102, ${1 - index * 0.1})`;
    });
}

function addElement() {
    let value = parseInt(document.getElementById("manualInput").value);
    if (isNaN(value)) {
        updateInfoPanel("Prosím, zadejte číslo, které chcete přidat.");
        return;
    }

    steps++;
    credit += 3; // přidáme "3 mince" za každou operaci

    updateInfoPanel(`Přidáváme prvek ${value}. Naspoříme 3 mince. Aktuální kredit: ${credit}.`);

    if (array.length === capacity) {
        // Potřebujeme zvětšit kapacitu
        let oldCapacity = capacity;
        capacity *= 2;
        credit -= array.length; // odečteme mince potřebné na zvětšení pole
        updateInfoPanel(
            `Pole bylo plné. Zvětšujeme kapacitu z ${oldCapacity} na ${capacity}. ` +
            `Odebíráme ${array.length} mincí za přesun všech prvků. Zbývající kredit: ${credit}.`
        );
    }

    array.push(value);
    visualizeArray();
}

function generateRandomArray() {
    array = [];
    capacity = 2;
    credit = 0;
    steps = 0;
    updateInfoPanel("Generujeme náhodný vstup...");

    for (let i = 0; i < 10; i++) {
        document.getElementById("manualInput").value = Math.floor(Math.random() * 100);
        addElement();
    }
}

function runBestCase() {
    array = [];
    capacity = 2;
    credit = 0;
    steps = 0;
    updateInfoPanel("Simulujeme nejlepší případ, kde se každé vložení vejde bez zvětšení kapacity.");

    for (let i = 0; i < capacity; i++) {
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
