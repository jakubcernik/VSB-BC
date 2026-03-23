let array = [];             // Vložená čísla
let capacity = 1;           // Aktuální kapacita pole
let creditsPerSlot = [];    // Mince nad každým políčkem
let steps = 0;

// Accounting method used by this simulation:
// Charge every push_back a fixed 2 coins:
//   1 coin pays for the insertion itself,
//   1 coin is saved on the newly inserted element (to pay for copying it once during a future resize).
const INSERT_CHARGE = 2;

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

    // Clear log panel and show initial message
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

    visualizeArray();
}

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
            await new Promise(resolve => setTimeout(resolve, getDelay(300)));
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
            await new Promise(resolve => setTimeout(resolve, getDelay(300)));
            coin.remove();
        }
    }
}

async function resizeArray()
{
    const d = dict[currentLang];
    const oldCapacity = capacity;
    capacity *= 2;

    // When resizing, we simply create new empty slots (no coins on empty slots).

    updateInfoPanelWithDetails(
        d.resizeTitle(oldCapacity, capacity),
        d.resizeWhy()
    );

    visualizeArray();
    await new Promise(resolve => setTimeout(resolve, getDelay(400)));

    updateInfoPanel(d.resizeNewSlots(oldCapacity, capacity));

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
            // For educational robustness: if a slot has no coin, we show invariant warning.
            updateInfoPanel(d.invariantBroken(i));
        }
    }

    updateInfoPanel(d.resizeDoneSlots(oldCapacity));
    visualizeArray();
}

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
    const slotIndex = array.length;

    beginLogGroup(value, steps);

    if (array.length === capacity)
    {
        updateInfoPanel(d.arrayFull);
        await resizeArray();
    }

    // Allocate 2 coins (amortized prepayment) for this push_back.
    creditsPerSlot[slotIndex] = 2;
    updateCredits();

    visualizeArray();
    await animateCoinUpdate(slotIndex, 2);

    updateInfoPanelWithDetails(
        d.insertTitle(value, slotIndex),
        [
            d.insertAllocCoins(INSERT_CHARGE),
            d.insertPaySelf(),
            d.insertPayCopy(),
        ].join('<br>')
    );

    array.push(value);
    visualizeArray();
    await new Promise(resolve => setTimeout(resolve, getDelay(400)));

    creditsPerSlot[slotIndex]--;
    updateCredits();
    await animateCoinUpdate(slotIndex, creditsPerSlot[slotIndex]);

    endLogGroup();
    input.value = "";
}

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

function prepareBestCase()
{
    resetValues();
    const d = dict[currentLang];

    // Setup: Capacity 4, 3 items filled (Last spot free)
    capacity = 4;
    array = [10, 20, 30];
    creditsPerSlot = [0, 0, 1, 0];
    steps = 3;

    visualizeArray();
    updateCredits();

    // Toggle UI
    document.getElementById('btnRunBest').style.display = 'none';
    document.getElementById('bestCaseInputGroup').style.display = 'flex';
    document.getElementById('bestInput').focus();
    
    // Override log
    const infoPanel = document.getElementById("infoPanel");
    infoPanel.innerHTML = "";
    createLogEntry(LOG_TYPES.SUCCESS, d.bestCase.ready);
}

async function finishBestCase()
{
    const input = document.getElementById("bestInput");
    const value = parseInt(input.value);
    const d = dict[currentLang];

    if (isNaN(value)) {
        updateInfoPanel(d.pleaseEnterValidNumber);
        return;
    }

    // Reuse logic
    document.getElementById("manualInput").value = value;
    await addElement();
    
    // Disable input after done
    input.value = "";
    document.getElementById('bestCaseInputGroup').style.display = 'none';
    
    createLogEntry(LOG_TYPES.SUCCESS, d.bestCaseDone);
}

function prepareWorstCase()
{
    resetValues();
    const d = dict[currentLang];

    // Setup: Capacity 4, 4 items filled (FULL)
    capacity = 4;
    array = [10, 20, 30, 40];
    creditsPerSlot = [1, 1, 1, 1]; 
    steps = 4;

    visualizeArray();
    updateCredits();

    // Toggle UI
    document.getElementById('btnRunWorst').style.display = 'none';
    document.getElementById('worstCaseInputGroup').style.display = 'flex';
    document.getElementById('worstInput').focus();

    // Override log
    const infoPanel = document.getElementById("infoPanel");
    infoPanel.innerHTML = "";
    createLogEntry(LOG_TYPES.WARNING, d.worstCase.ready);
}

async function finishWorstCase()
{
    const input = document.getElementById("worstInput");
    const value = parseInt(input.value);
    const d = dict[currentLang];

    if (isNaN(value)) {
        updateInfoPanel(d.pleaseEnterValidNumber);
        return;
    }

    // Reuse logic
    document.getElementById("manualInput").value = value;
    await addElement();

    // Disable input after done
    input.value = "";
    document.getElementById('worstCaseInputGroup').style.display = 'none';

    createLogEntry(LOG_TYPES.SUCCESS, d.worstCaseDone);
}
