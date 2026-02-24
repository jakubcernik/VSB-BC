// ============================================================
//  dynamicArray.js – algoritmus dynamického pole s amortizací
//  (první algoritmus – vector<> / push_back)
//
//  Banker's method:
//    Každé vložení zaplatí amortizovanou cenu 3:
//      • 1 mince  = skutečná cena vložení (write)
//      • 1 mince  = záloha na kopírování tohoto prvku při příštím resize
//      • 1 mince  = záloha na kopírování jednoho již existujícího prvku
//                   (při zdvojení kapacity musíme zkopírovat n starých prvků,
//                    ale zálohy na první n/2 z nich jsme vyčerpali dřív –
//                    proto každý nový prvek přispívá i za jednoho starého)
//
//  Zjednodušená vizualizační varianta (2 mince):
//    • 1 mince  = cena vložení  → utracena ihned
//    • 1 mince  = záloha na kopírování → zůstane na políčku
//  Resize pak projde každý prvek a utratí jeho ušetřenou minci za copy.
// ============================================================

let array = [];             // Vložená čísla
let capacity = 1;           // Aktuální kapacita pole
let creditsPerSlot = [];    // Mince nad každým políčkem
let steps = 0;

// ── Pomocné funkce ────────────────────────────────────────────

function updateCredits()
{
    const totalCredits = creditsPerSlot.reduce((sum, c) => sum + c, 0);
    const d = dict[currentLang];
    document.getElementById("creditCounter").textContent = `${d.coins}: ${totalCredits}`;
}

function resetValues()
{
    array = [];
    creditsPerSlot = [];
    capacity = 1;
    steps = 0;

    const d = dict[currentLang];
    document.getElementById("creditCounter").textContent = `${d.coins}: 0`;
    document.getElementById("stepCounter").textContent   = `${d.steps}: 0`;
    document.getElementById("arrayVisualization").innerHTML = "";
    document.getElementById("infoPanel").textContent = d.steps + " " + d.willAppear;
}

// ── Vizualizace ───────────────────────────────────────────────

function visualizeArray()
{
    const arrayContainer = document.getElementById("arrayVisualization");
    arrayContainer.innerHTML = '';

    for (let i = 0; i < capacity; i++)
    {
        const frame = document.createElement("div");
        frame.classList.add("frame");
        frame.innerText = i < array.length ? array[i] : "";

        const coinsContainer = document.createElement("div");
        coinsContainer.classList.add("coins");

        const coinsNeeded = i < creditsPerSlot.length ? creditsPerSlot[i] : 0;
        for (let j = 0; j < coinsNeeded; j++)
        {
            const coin = document.createElement("div");
            coin.classList.add("coin");
            coinsContainer.appendChild(coin);
        }

        frame.appendChild(coinsContainer);
        arrayContainer.appendChild(frame);
    }

    const d = dict[currentLang];
    document.getElementById("stepCounter").textContent = `${d.steps}: ${steps}`;
}

async function animateCoinUpdate(frameIndex, coinsNeeded)
{
    const frame = document.querySelector(`.frame:nth-child(${frameIndex + 1}) .coins`);
    if (!frame) return;
    const currentCoins = frame.childElementCount;

    if (coinsNeeded > currentCoins)
    {
        for (let i = currentCoins; i < coinsNeeded; i++)
        {
            const coin = document.createElement("div");
            coin.classList.add("coin", "adding");
            frame.appendChild(coin);
            await new Promise(resolve => setTimeout(resolve, 300));
            coin.classList.remove("adding");
        }
    }
    else if (coinsNeeded < currentCoins)
    {
        for (let i = currentCoins; i > coinsNeeded; i--)
        {
            const coin = frame.lastChild;
            if (!coin) break;
            coin.classList.add("removing");
            await new Promise(resolve => setTimeout(resolve, 300));
            coin.remove();
        }
    }
}

// ── Resize ────────────────────────────────────────────────────
//
//  Správná amortizovaná logika:
//  Při resize NEALOKUJEME mince na nová prázdná políčka.
//  Každý stávající prvek má 1 ušetřenou minci → ta platí jeho kopírování.
//  Nová prázdná políčka zatím žádné mince nemají (dostanou je při vložení).

async function resizeArray()
{
    const d = dict[currentLang];
    const oldCapacity = capacity;
    capacity *= 2;

    // Nová prázdná políčka – žádné mince, zatím prázdná
    for (let i = oldCapacity; i < capacity; i++)
    {
        creditsPerSlot[i] = 0;
    }

    // Log: hlavička resize
    updateInfoPanelWithDetails(
        d.resizeTitle(oldCapacity, capacity),
        d.resizeWhy()
    );

    // Vizualizuj rozšířenou strukturu (nová prázdná políčka)
    visualizeArray();
    await new Promise(resolve => setTimeout(resolve, 400));

    // Informace o nových prázdných slotech
    updateInfoPanel(d.resizeNewSlots(oldCapacity, capacity));

    // Kopírování – každý starý prvek utratí svou 1 ušetřenou minci
    for (let i = 0; i < oldCapacity; i++)
    {
        if (creditsPerSlot[i] > 0)
        {
            creditsPerSlot[i]--;
            updateCredits();
            await animateCoinUpdate(i, creditsPerSlot[i]);
            updateInfoPanel(d.resizeCopySlot(i));
        }
        else
        {
            // Nemělo by nastat při správném průběhu – pojistka
            updateInfoPanel(`⚠️ Slot [${i}] had no saved coin for copy — invariant violated!`);
        }
    }

    updateInfoPanel(d.resizeDoneSlots(oldCapacity));
    visualizeArray();
}

// ── Vložení prvku ─────────────────────────────────────────────
//
//  Amortizovaná cena každého vložení = 2 mince:
//    • 1 mince utracena ihned za write (vložení)
//    • 1 mince zůstane jako záloha na budoucí kopírování

async function addElement()
{
    const input = document.getElementById("manualInput");
    const value = parseInt(input.value);
    const d = dict[currentLang];

    if (isNaN(value))
    {
        updateInfoPanel(d.pleaseEnterValidNumber);
        return;
    }

    steps++;
    const slotIndex = array.length; // index políčka, kam vložíme

    // --- Resize pokud je pole plné ---
    if (array.length === capacity)
    {
        updateInfoPanel(d.arrayFull);
        await resizeArray();
    }

    // --- Alokace 2 mincí na cílové políčko ---
    // (políčko je buď nové z resize s 0 mincemi, nebo první vložení)
    creditsPerSlot[slotIndex] = 2;
    updateCredits();
    visualizeArray();
    await animateCoinUpdate(slotIndex, 2);

    // Log: přidělení mincí
    updateInfoPanelWithDetails(
        d.insertTitle(value, slotIndex),
        [
            d.insertAllocCoins(2),
            d.insertPaySelf(),
            d.insertPayCopy(),
        ].join('<br>')
    );

    // --- Vložení hodnoty ---
    array.push(value);
    visualizeArray();
    await new Promise(resolve => setTimeout(resolve, 400));

    // --- Utrat 1 minci za vložení ---
    creditsPerSlot[slotIndex]--;
    updateCredits();
    await animateCoinUpdate(slotIndex, creditsPerSlot[slotIndex]);

    // Log: výsledný stav políčka
    const remaining = creditsPerSlot[slotIndex];
    updateInfoPanel(d.insertRemaining(remaining));

    input.value = "";
}

// ── Náhodné generování ────────────────────────────────────────

function getRandomNumber(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateRandomArray()
{
    const d = dict[currentLang];
    const count = parseInt(document.getElementById("randomCount").value);
    const min   = parseInt(document.getElementById("randomMin").value);
    const max   = parseInt(document.getElementById("randomMax").value);

    if (isNaN(count) || isNaN(min) || isNaN(max) || count <= 0 || min > max)
    {
        updateInfoPanel(d.invalidInput);
        return;
    }

    updateInfoPanel(d.randomGenerating(count, min, max));

    for (let i = 0; i < count; i++)
    {
        document.getElementById("manualInput").value = getRandomNumber(min, max);
        await addElement();
    }

    updateInfoPanel(d.randomDone(count));
}

// ── Best / Worst case (zatím připravené kostrami) ─────────────

function runBestCase()
{
    resetValues();
    // TODO: implementace nejlepšího případu
}

function runWorstCase()
{
    resetValues();
    // TODO: implementace nejhoršího případu
}
