let array = [];
let capacity = 1;
let creditsPerSlot = [];
let steps = 0;
let instructions = 0;

let bank = 0;

const simulationController = {
    queue: [],
    isExecuting: false,
    nextOpId: 1,
};

const randomController = {
    running: false,
    paused: false,
    loopActive: false,
    total: 0,
    remaining: 0,
    min: 0,
    max: 0,
};

const sleep = InputValidation.sleep;

function reportValidation(result, dictForLang)
{
    InputValidation.reportValidation(result, dictForLang, updateInfoPanel);
}

function hasValidRandomInputs()
{
    return InputValidation.readInt('randomCount', { required: true, min: 1 }).ok &&
           InputValidation.readIntMinMax('randomMin', 'randomMax', { required: true }).ok;
}

function updateManualStepButtons()
{
    const input = document.getElementById('manualInput');
    const smallBtn = document.getElementById('btnSmallStep');
    const bigBtn = document.getElementById('btnBigStep');
    if (!input || !smallBtn || !bigBtn) return;

    const hasQueuedSteps = simulationController.queue.length > 0;
    const canQueueFromInput = InputValidation.readInt('manualInput').ok;
    const canRun = !simulationController.isExecuting && (hasQueuedSteps || canQueueFromInput);

    smallBtn.disabled = !canRun;
    bigBtn.disabled = !canRun;
    input.disabled = hasQueuedSteps || simulationController.isExecuting;
}

function syncControlStates()
{
    updateManualStepButtons();
    updateRandomButtons();
}

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

async function flyCoin(fromEl, toEl, animate) {
    if (animate === undefined) animate = true;
    if (!animate) return;
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

    await sleep(getDelay(420));
    coin.remove();
}

async function depositToBank(fromSlotIndex, count, animate) {
    if (animate === undefined) animate = true;
    const fromCoins = getSlotCoinsEl(fromSlotIndex);
    const bankEl = getBankEl();
    if (!fromCoins || !bankEl) return;

    for (let k = 0; k < count; k++) {
        // First visually remove one coin from the slot, then fly that coin into the bank.
        var current = creditsPerSlot[fromSlotIndex];
        if (current === undefined || current === null) current = 0;
        const next = Math.max(0, current - 1);
        creditsPerSlot[fromSlotIndex] = next;
        await animateCoinUpdate(fromSlotIndex, next, animate);
        await flyCoin(fromCoins, bankEl, animate);
        bank += 1;
        updateCredits();
    }
}

async function withdrawFromBank(toSlotIndex, count, animate) {
    if (animate === undefined) animate = true;
    const toCoins = getSlotCoinsEl(toSlotIndex);
    const bankEl = getBankEl();
    if (!toCoins || !bankEl) return;

    for (let k = 0; k < count; k++) {
        if (bank <= 0) return;
        await flyCoin(bankEl, toCoins, animate);
        bank -= 1;
        updateCredits();
    }
}

const INSERT_CHARGE = 3;

// ── Helpers ────────────────────────────────────────────

function updateCredits()
{
    const d = dict[currentLang];
    const creditCounterEl = document.getElementById("creditCounter");
    const stepCounterEl = document.getElementById("stepCounter");
    const instructionCounterEl = document.getElementById("instructionCounter");
    const instructionBoundEl = document.getElementById("instructionBound");

    if (creditCounterEl) {
        creditCounterEl.textContent = d.coins + ': ' + bank;
    }

    if (stepCounterEl) {
        stepCounterEl.textContent = d.steps + ': ' + steps;
    }

    if (instructionCounterEl) {
        const instructionsLabel = d.instructions || 'Instructions';
        instructionCounterEl.textContent = instructionsLabel + ': ' + instructions;
    }

    if (instructionBoundEl) {
        if (steps === 0) {
            instructionBoundEl.textContent = d.instructionBoundIdle || '';
            instructionBoundEl.classList.remove('over-limit');
        } else {
            const limit = steps * INSERT_CHARGE;
            const overLimit = instructions > limit;
            if (overLimit) {
                if (typeof d.instructionBoundExceeded === 'function') {
                    instructionBoundEl.textContent = d.instructionBoundExceeded(instructions, steps, limit);
                } else {
                    instructionBoundEl.textContent = instructions + ' / ' + limit;
                }
            } else {
                if (typeof d.instructionBoundWithin === 'function') {
                    instructionBoundEl.textContent = d.instructionBoundWithin(instructions, steps, limit);
                } else {
                    instructionBoundEl.textContent = instructions + ' / ' + limit;
                }
            }
            instructionBoundEl.classList.toggle('over-limit', overLimit);
        }
    }
}

window.renderVectorTrackers = updateCredits;

function resetValues()
{
    array = [];
    creditsPerSlot = [];
    capacity = 1;
    steps = 0;
    instructions = 0;
    bank = 0;
    simulationController.queue = [];
    simulationController.isExecuting = false;
    stopRandomGeneration();

    const d = dict[currentLang];
    updateCredits();

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
    syncControlStates();
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

    updateCredits();
}

async function animateCoinUpdate(frameIndex, coinsNeeded, animate)
{
    if (animate === undefined) animate = true;
    const frame = document.querySelector(`.frame:nth-child(${frameIndex + 1}) .coins`);
    if (!frame) return;
    const currentCoins = frame.childElementCount;

    if (!animate) {
        while (frame.childElementCount < coinsNeeded) {
            const coin = document.createElement("div");
            coin.classList.add("coin");
            frame.appendChild(coin);
        }
        while (frame.childElementCount > coinsNeeded) {
            if (frame.lastChild) frame.lastChild.remove();
        }
        return;
    }

    if (coinsNeeded > currentCoins)
    {
        for (let i = currentCoins; i < coinsNeeded; i++)
        {
            const coin = document.createElement("div");
            coin.classList.add("coin", "adding");
            frame.appendChild(coin);
            await sleep(getDelay(300));
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
            await sleep(getDelay(300));
            coin.remove();
        }
    }
}

async function addElement()
{
    const d = dict[currentLang];

    const valueRes = InputValidation.readInt('manualInput', { required: true });
    if (!valueRes.ok) {
        reportValidation(valueRes, d);
        return;
    }

    const value = valueRes.value;
    enqueueInsertOperation(value, { clearInputs: ['manualInput'] });
    await runBigStep();
}

const getRandomNumber = InputValidation.randInt;

// Compute how many coins would be in the bank after inserting n elements
function bankAfterInserting(n)
{
    let b = 0;
    let cap = 1;
    let size = 0;

    while (size < n)
    {
        if (size === cap)
        {
            b -= cap;
            cap *= 2;
        }

        // deposit 2
        b += 2;
        size += 1;
    }

    return b;
}

function instructionsAfterInserting(n)
{
    let total = 0;
    let cap = 1;
    let size = 0;

    while (size < n)
    {
        if (size === cap)
        {
            total += cap;
            cap *= 2;
        }

        total += 1;
        size += 1;
    }

    return total;
}

// ── Best/Worst case variants ───────────────────────────────────────────────

let bestVariantIndex = 0;
let worstVariantIndex = 0;

const BEST_VARIANTS = [
    { capacity: 4,  size: 1 },
    { capacity: 8,  size: 4 },
    { capacity: 8,  size: 6 },
    { capacity: 16, size: 14 },
    { capacity: 10, size: 9 },
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
    var result = [];
    for (var i = 0; i < n; i++) {
        result.push((i + 1) * 10);
    }
    return result;
}

function createQueueAction(opId, run)
{
    return { opId, run };
}

function enqueueInsertOperation(value, options)
{
    if (options === undefined) options = {};
    const opId = simulationController.nextOpId++;
    const d = dict[currentLang];
    const actions = [];
    const clearInputs = Array.isArray(options.clearInputs) ? options.clearInputs : [];
    const slotIndex = array.length;
    const needsResize = array.length === capacity;
    const oldCapacity = capacity;
    let operationStarted = false;

    function startOperationIfNeeded() {
        if (operationStarted) return;
        steps++;
        updateCredits();
        beginLogGroup(value, steps);
        operationStarted = true;
    }

    if (needsResize) {
        actions.push(createQueueAction(opId, async function(animate) {
            startOperationIfNeeded();
            updateInfoPanel(d.arrayFull);
            capacity *= 2;
            updateInfoPanelWithDetails(
                d.resizeTitle(oldCapacity, capacity),
                d.resizeWhy()
            );
            visualizeArray();
            if (animate) {
                await sleep(getDelay(400));
            }
            updateInfoPanel(d.resizeNewSlots(oldCapacity, capacity));
        }));

        for (let i = 0; i < oldCapacity; i++) {
            actions.push(createQueueAction(opId, async function(animate) {
                startOperationIfNeeded();
                if (bank > 0) {
                    await withdrawFromBank(i, 1, animate);
                }
                instructions += 1;
                updateCredits();
                updateInfoPanel(d.resizeCopySlot(i), { unit: 'instruction' });
            }));
        }

        actions.push(createQueueAction(opId, async function() {
            startOperationIfNeeded();
            updateInfoPanel(d.resizeDoneSlots(oldCapacity));
            visualizeArray();
        }));
    }

    actions.push(createQueueAction(opId, async function(animate) {
        startOperationIfNeeded();
        creditsPerSlot[slotIndex] = 3;
        visualizeArray();
        await animateCoinUpdate(slotIndex, 3, animate);
        updateInfoPanel(d.atomicAllocStep(slotIndex, INSERT_CHARGE));
    }));

    actions.push(createQueueAction(opId, async function(animate) {
        startOperationIfNeeded();
        array.push(value);
        visualizeArray();
        updateInfoPanel(d.atomicInsertStep(value, slotIndex));
        if (animate) {
            await sleep(getDelay(400));
        }
    }));

    actions.push(createQueueAction(opId, async function(animate) {
        startOperationIfNeeded();
        creditsPerSlot[slotIndex] = 2;
        await animateCoinUpdate(slotIndex, 2, animate);
        instructions += 1;
        updateCredits();
        updateInfoPanel(d.atomicSpendStep(slotIndex), { unit: 'instruction' });
    }));

    actions.push(createQueueAction(opId, async function(animate) {
        startOperationIfNeeded();
        await depositToBank(slotIndex, 1, animate);
        updateInfoPanel(d.atomicDepositStep(slotIndex));
    }));

    actions.push(createQueueAction(opId, async function(animate) {
        startOperationIfNeeded();
        await depositToBank(slotIndex, 1, animate);
        updateInfoPanel(d.atomicDepositStep(slotIndex));
        endLogGroup();
        for (var ci = 0; ci < clearInputs.length; ci++) {
            var inputEl = document.getElementById(clearInputs[ci]);
            if (inputEl) inputEl.value = '';
        }
    }));

    for (var ai = 0; ai < actions.length; ai++) {
        simulationController.queue.push(actions[ai]);
    }
    syncControlStates();
}

async function runNextQueueAction(animate)
{
    if (animate === undefined) animate = true;
    if (simulationController.isExecuting) return false;
    const action = simulationController.queue.shift();
    if (!action) return false;

    simulationController.isExecuting = true;
    try {
        await action.run(animate);
    } finally {
        simulationController.isExecuting = false;
        syncControlStates();
    }

    return true;
}

async function runSmallStep()
{
    await runNextQueueAction(true);
}

async function runBigStep()
{
    if (simulationController.queue.length === 0) return;
    const opId = simulationController.queue[0].opId;

    while (simulationController.queue.length > 0 && simulationController.queue[0].opId === opId) {
        await runNextQueueAction(true);
    }
}

function ensureManualOperationQueued()
{
    if (simulationController.queue.length > 0) return true;

    const d = dict[currentLang];
    const valueRes = InputValidation.readInt('manualInput', { required: true });
    if (!valueRes.ok) {
        reportValidation(valueRes, d);
        syncControlStates();
        return false;
    }

    enqueueInsertOperation(valueRes.value, { clearInputs: ['manualInput'] });
    syncControlStates();
    return true;
}

async function runSmallStepFromInput()
{
    if (!ensureManualOperationQueued()) return;
    await runSmallStep();
}

async function runBigStepFromInput()
{
    if (!ensureManualOperationQueued()) return;
    await runBigStep();
}

async function generateRandomArray()
{
    const d = dict[currentLang];

    const countRes = InputValidation.readInt('randomCount', { required: true, min: 1 });
    if (!countRes.ok) {
        reportValidation(countRes, d);
        return;
    }

    const rangeRes = InputValidation.readIntMinMax('randomMin', 'randomMax', { required: true });
    if (!rangeRes.ok) {
        reportValidation(rangeRes, d);
        return;
    }

    randomController.running = true;
    randomController.paused = false;
    randomController.loopActive = false;
    randomController.total = countRes.value;
    randomController.remaining = countRes.value;
    randomController.min = rangeRes.min;
    randomController.max = rangeRes.max;

    updateRandomButtons();
    updateInfoPanel(d.randomGenerating(randomController.total, randomController.min, randomController.max));
    await runRandomLoop();
}

function setRandomSpeedFromSlider(value)
{
    setAnimationSpeedLevel(Number(value));
}

function updateRandomButtons()
{
    const d = dict[currentLang];
    const startBtn = document.getElementById('btnRandomStart');
    const pauseBtn = document.getElementById('btnRandomPause');
    if (!startBtn || !pauseBtn) return;

    startBtn.disabled = randomController.running || simulationController.isExecuting || !hasValidRandomInputs();
    pauseBtn.disabled = !randomController.running;
    pauseBtn.dataset.state = randomController.paused ? 'resume' : 'pause';
    pauseBtn.textContent = randomController.paused ? d.randomResume : d.randomPause;
}

async function runRandomLoop()
{
    if (randomController.loopActive) return;
    randomController.loopActive = true;

    try {
        while (randomController.running && !randomController.paused) {
            if (simulationController.queue.length === 0) {
                if (randomController.remaining <= 0) break;
                const value = getRandomNumber(randomController.min, randomController.max);
                enqueueInsertOperation(value);
                randomController.remaining -= 1;
            }

            await runBigStep();
        }
    } finally {
        randomController.loopActive = false;
    }

    if (randomController.running && !randomController.paused && randomController.remaining === 0 && simulationController.queue.length === 0) {
        const d = dict[currentLang];
        updateInfoPanel(d.randomDone(randomController.total));
        stopRandomGeneration();
    }

    updateRandomButtons();
}

function stopRandomGeneration()
{
    randomController.running = false;
    randomController.paused = false;
    randomController.loopActive = false;
    randomController.total = 0;
    randomController.remaining = 0;
    syncControlStates();
}

async function toggleRandomPause()
{
    if (!randomController.running) return;

    randomController.paused = !randomController.paused;
    updateRandomButtons();

    if (!randomController.paused) {
        await runRandomLoop();
    }
}

function attachControlStateListeners()
{
    const manualInput = document.getElementById('manualInput');
    if (manualInput) {
        manualInput.addEventListener('input', function() { updateManualStepButtons(); });
    }

    var randomIds = ['randomCount', 'randomMin', 'randomMax'];
    for (var ri = 0; ri < randomIds.length; ri++) {
        var elRandom = document.getElementById(randomIds[ri]);
        if (elRandom) {
            elRandom.addEventListener('input', function() { updateRandomButtons(); });
        }
    }

    syncControlStates();
}

attachControlStateListeners();

function prepareBestCase(next)
{
    if (next === undefined) next = false;
    resetValues();
    const d = dict[currentLang];

    if (next) bestVariantIndex = (bestVariantIndex + 1) % BEST_VARIANTS.length;
    const variant = BEST_VARIANTS[bestVariantIndex];

    capacity = variant.capacity;
    array = makeArrayOfSize(variant.size);
    creditsPerSlot = new Array(capacity).fill(0);
    bank = bankAfterInserting(array.length);
    steps = array.length;
    instructions = instructionsAfterInserting(array.length);

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
        reportValidation(valueRes, d);
        return;
    }

    document.getElementById("manualInput").value = valueRes.value;
    await addElement();
    
    // Disable input after done
    input.value = "";
    document.getElementById('bestCaseInputGroup').style.display = 'none';
    
    createLogEntry(LOG_TYPES.SUCCESS, d.bestCaseDone);
}

function prepareWorstCase(next)
{
    if (next === undefined) next = false;
    resetValues();
    const d = dict[currentLang];

    if (next) worstVariantIndex = (worstVariantIndex + 1) % WORST_VARIANTS.length;
    const variant = WORST_VARIANTS[worstVariantIndex];

    capacity = variant.capacity;
    array = makeArrayOfSize(variant.size);
    creditsPerSlot = new Array(capacity).fill(0);
    bank = bankAfterInserting(array.length);
    steps = array.length;
    instructions = instructionsAfterInserting(array.length);

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
        reportValidation(valueRes, d);
        return;
    }

    document.getElementById("manualInput").value = valueRes.value;
    await addElement();

    // Disable input after done
    input.value = "";
    document.getElementById('worstCaseInputGroup').style.display = 'none';

    createLogEntry(LOG_TYPES.SUCCESS, d.worstCaseDone);
}
