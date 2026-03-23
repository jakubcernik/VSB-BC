let array = [];             // Vložená čísla
let capacity = 1;           // Aktuální kapacita pole
let creditsPerSlot = [];    // Mince nad každým políčkem
let steps = 0;

// Central "bank" used for the borrowing/accounting story.
// Coins are accumulated over cheap operations and spent during expensive resizes.
let bank = 0;

// ── Bank animation helpers ─────────────────────────────────────────────────

function getBankEl() {
    return document.getElementById('creditCounter');
}

function getSlotCoinsEl(slotIndex) {
    return document.querySelector(`.frame:nth-child(${slotIndex + 1}) .coins`);
}

function createFlyingCoinFromRect(rect) {
    const coin = document.createElement('div');
    coin.classList.add('coin', 'flying');
    coin.style.position = 'fixed';
    coin.style.left = `${rect.left + rect.width / 2 - 8}px`;
    coin.style.top = `${rect.top + rect.height / 2 - 8}px`;
    coin.style.width = '16px';
    coin.style.height = '16px';
    coin.style.zIndex = '9999';
    coin.style.pointerEvents = 'none';
    document.body.appendChild(coin);
    return coin;
}

async function flyCoin(fromEl, toEl) {
    if (!fromEl || !toEl) return;
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    const coin = createFlyingCoinFromRect(fromRect);

    // Force layout
    coin.getBoundingClientRect();

    const dx = (toRect.left + toRect.width / 2) - (fromRect.left + fromRect.width / 2);
    const dy = (toRect.top + toRect.height / 2) - (fromRect.top + fromRect.height / 2);
    coin.style.transition = `transform ${getDelay(380)}ms ease, opacity ${getDelay(380)}ms ease`;
    coin.style.transform = `translate(${dx}px, ${dy}px) scale(0.6)`;
    coin.style.opacity = '0.2';

    await new Promise(r => setTimeout(r, getDelay(420)));
    coin.remove();
}

async function depositToBank(fromSlotIndex, count) {
    const fromCoins = getSlotCoinsEl(fromSlotIndex);
    const bankEl = getBankEl();
    if (!fromCoins || !bankEl) return;

    for (let k = 0; k < count; k++) {
        // First visually remove one coin from the slot, then fly that coin into the bank.
        const current = creditsPerSlot[fromSlotIndex] ?? 0;
        const next = Math.max(0, current - 1);
        creditsPerSlot[fromSlotIndex] = next;
        await animateCoinUpdate(fromSlotIndex, next);
        await flyCoin(fromCoins, bankEl);
        bank += 1;
        updateCredits();
    }
}

async function withdrawFromBank(toSlotIndex, count) {
    const toCoins = getSlotCoinsEl(toSlotIndex);
    const bankEl = getBankEl();
    if (!toCoins || !bankEl) return;

    for (let k = 0; k < count; k++) {
        if (bank <= 0) return;
        await flyCoin(bankEl, toCoins);
        bank -= 1;
        updateCredits();
    }
}

// Accounting method used by this simulation (borrowing / bank model):
// Charge every push_back a fixed 3 coins:
//   1 coin pays for the insertion itself,
//   2 coins are saved into a central bank.
// During RESIZE (doubling), copying each element costs 1 coin, paid from the bank.
const INSERT_CHARGE = 3;

// ── Pomocné funkce ────────────────────────────────────────────

function updateCredits()
{
    const d = dict[currentLang];
    // We display the bank (saved coins) as the main invariant-relevant counter.
    document.getElementById("creditCounter").textContent = `${d.coins}: ${bank}`;
}

function resetValues()
{
    array = [];
    creditsPerSlot = [];
    capacity = 1;
    steps = 0;
    bank = 0;

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
        // Copying one element costs 1 coin, paid from the central bank.
        // Animate a withdrawal from the bank for better intuition.
        if (bank > 0) {
            await withdrawFromBank(i, 1);
        }

        updateInfoPanel(d.resizeCopySlot(i));
    }

    updateInfoPanel(d.resizeDoneSlots(oldCapacity));
    visualizeArray();
}

async function addElement()
{
    const input = document.getElementById("manualInput");
    const d = dict[currentLang];

    const valueRes = InputValidation.readInt('manualInput', { required: true });
    if (!valueRes.ok) {
        InputValidation.reportValidationError(valueRes.reason, {
            dict: d,
            details: valueRes.details,
            report: (msg) => updateInfoPanel(msg),
        });
        return;
    }

    const value = valueRes.value;

    steps++;
    const slotIndex = array.length;

    beginLogGroup(value, steps);

    if (array.length === capacity)
    {
        updateInfoPanel(d.arrayFull);
        await resizeArray();
    }

    // Visualize the 3-coin amortized charge on the new slot:
    // start with 3 coins, spend 1 for insertion, deposit 2 into the bank.
    creditsPerSlot[slotIndex] = 3;
    visualizeArray();
    await animateCoinUpdate(slotIndex, 3);

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

    // Spend 1 coin for the actual insertion (3 -> 2 on the slot)
    creditsPerSlot[slotIndex] = 2;
    await animateCoinUpdate(slotIndex, 2);

    // Deposit the remaining 2 coins into the bank (they will finance future copies).
    // Expectation: only 1 coin disappears for insertion, the remaining 2 directly fly into the bank.
    await depositToBank(slotIndex, 2);

    endLogGroup();
    input.value = "";
}

function getRandomNumber(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Compute how many coins would be in the bank after inserting `n` elements
// starting from an empty dynamic array with initial capacity 1, using our model:
//  - each insertion deposits 2 coins into bank
//  - each resize from C -> 2C copies C elements and withdraws C coins from bank
function bankAfterInserting(n)
{
    let b = 0;
    let cap = 1;
    let size = 0;

    while (size < n)
    {
        if (size === cap)
        {
            // resize: copy `cap` elements
            b -= cap;
            cap *= 2;
        }

        // insertion: deposit 2
        b += 2;
        size += 1;
    }

    return b;
}

// ── Best/Worst case variants ───────────────────────────────────────────────

let bestVariantIndex = 0;
let worstVariantIndex = 0;

const BEST_VARIANTS = [
    // Various free-capacity situations (still O(1) for the next insertion)
    { capacity: 4,  size: 1 },  // many free slots
    { capacity: 8,  size: 4 },  // ~50% full
    { capacity: 8,  size: 6 },  // ~75% full
    { capacity: 16, size: 14 }, // almost full, but still 2 free slots
    { capacity: 10, size: 9 },  // exactly 1 free slot
];

const WORST_VARIANTS = [
    { capacity: 2,  size: 2 },
    { capacity: 4,  size: 4 },
    { capacity: 8,  size: 8 },
    { capacity: 6,  size: 6 },
    { capacity: 10, size: 10 },
];

function makeArrayOfSize(n)
{
    // deterministic simple values for clarity
    return Array.from({ length: n }, (_, i) => (i + 1) * 10);
}

async function generateRandomArray()
{
    const d = dict[currentLang];

    const countRes = InputValidation.readInt('randomCount', { required: true, min: 1 });
    if (!countRes.ok) {
        InputValidation.reportValidationError(countRes.reason, {
            dict: d,
            details: countRes.details,
            report: (msg) => updateInfoPanel(msg),
        });
        return;
    }

    const rangeRes = InputValidation.readIntMinMax('randomMin', 'randomMax', { required: true });
    if (!rangeRes.ok) {
        InputValidation.reportValidationError(rangeRes.reason, {
            dict: d,
            details: rangeRes.details,
            report: (msg) => updateInfoPanel(msg),
        });
        return;
    }

    const count = countRes.value;
    const min = rangeRes.min;
    const max = rangeRes.max;

    updateInfoPanel(d.randomGenerating(count, min, max));

    for (let i = 0; i < count; i++)
    {
        document.getElementById("manualInput").value = getRandomNumber(min, max);
        await addElement();
    }

    updateInfoPanel(d.randomDone(count));
}

function prepareBestCase(next = false)
{
    resetValues();
    const d = dict[currentLang];

    if (next) bestVariantIndex = (bestVariantIndex + 1) % BEST_VARIANTS.length;
    const variant = BEST_VARIANTS[bestVariantIndex];

    // Setup: one free slot => O(1) insertion (no resize)
    capacity = variant.capacity;
    array = makeArrayOfSize(variant.size);
    // Under the 3-coin + bank model, long-term saved coins live in the bank.
    creditsPerSlot = new Array(capacity).fill(0);
    bank = bankAfterInserting(array.length);
    steps = array.length;

    visualizeArray();
    updateCredits();

    // Toggle UI
    document.getElementById('btnRunBest').style.display = 'none';
    document.getElementById('btnNextBest').style.display = 'inline-block';
    document.getElementById('bestCaseInputGroup').style.display = 'flex';
    document.getElementById('bestInput').focus();
    
    // Override log
    const infoPanel = document.getElementById("infoPanel");
    infoPanel.innerHTML = "";
    if (d.bestCase && typeof d.bestCase.readyVariant === 'function') {
        createLogEntry(LOG_TYPES.SUCCESS, d.bestCase.readyVariant(capacity, array.length));
    } else {
        createLogEntry(LOG_TYPES.SUCCESS, d.bestCase.ready);
    }
}

async function finishBestCase()
{
    const input = document.getElementById("bestInput");
    const d = dict[currentLang];

    const valueRes = InputValidation.readInt('bestInput', { required: true });
    if (!valueRes.ok) {
        InputValidation.reportValidationError(valueRes.reason, {
            dict: d,
            details: valueRes.details,
            report: (msg) => updateInfoPanel(msg),
        });
        return;
    }

    const value = valueRes.value;

    // Reuse logic
    document.getElementById("manualInput").value = value;
    await addElement();
    
    // Disable input after done
    input.value = "";
    document.getElementById('bestCaseInputGroup').style.display = 'none';
    
    createLogEntry(LOG_TYPES.SUCCESS, d.bestCaseDone);
}

function prepareWorstCase(next = false)
{
    resetValues();
    const d = dict[currentLang];

    if (next) worstVariantIndex = (worstVariantIndex + 1) % WORST_VARIANTS.length;
    const variant = WORST_VARIANTS[worstVariantIndex];

    // Setup: full array => next insertion triggers resize, costing O(N) where
    // N is the current number of stored elements copied during the resize.
    capacity = variant.capacity;
    array = makeArrayOfSize(variant.size);
    creditsPerSlot = new Array(capacity).fill(0);
    bank = bankAfterInserting(array.length);
    steps = array.length;

    visualizeArray();
    updateCredits();

    // Toggle UI
    document.getElementById('btnRunWorst').style.display = 'none';
    document.getElementById('btnNextWorst').style.display = 'inline-block';
    document.getElementById('worstCaseInputGroup').style.display = 'flex';
    document.getElementById('worstInput').focus();

    // Override log
    const infoPanel = document.getElementById("infoPanel");
    infoPanel.innerHTML = "";
    if (d.worstCase && typeof d.worstCase.readyVariant === 'function') {
        createLogEntry(LOG_TYPES.WARNING, d.worstCase.readyVariant(capacity));
    } else {
        createLogEntry(LOG_TYPES.WARNING, d.worstCase.ready);
    }
}

async function finishWorstCase()
{
    const input = document.getElementById("worstInput");
    const d = dict[currentLang];

    const valueRes = InputValidation.readInt('worstInput', { required: true });
    if (!valueRes.ok) {
        InputValidation.reportValidationError(valueRes.reason, {
            dict: d,
            details: valueRes.details,
            report: (msg) => updateInfoPanel(msg),
        });
        return;
    }

    const value = valueRes.value;

    // Reuse logic
    document.getElementById("manualInput").value = value;
    await addElement();

    // Disable input after done
    input.value = "";
    document.getElementById('worstCaseInputGroup').style.display = 'none';

    createLogEntry(LOG_TYPES.SUCCESS, d.worstCaseDone);
}
