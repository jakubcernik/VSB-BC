// ─── State ────────────────────────────────────────────────────────────────────
const INITIAL_CAPACITY = 8;
const LOAD_THRESHOLD = 0.75;
const INSERT_CHARGE = 3;

let capacity = INITIAL_CAPACITY;
let size = 0; // number of live entries
let table = []; // { key, value } | null
let coinsOnSlot = [];
let bank = 0;
let instructions = 0;
let isAnimating = false;
let preparedCaseMode = null;
let preparedScenario = null;
let bestVariantIndex = 0;
let worstVariantIndex = 0;

function getBestVariants() {
    return [
        { entries: [], insert: { key: 5, value: 50 } },
        { entries: [{ key: 0, value: 10 }, { key: 2, value: 20 }], insert: { key: 5, value: 55 } },
        { entries: [{ key: 1, value: 11 }, { key: 4, value: 44 }, { key: 7, value: 77 }, { key: 3, value: 33 }], insert: { key: 6, value: 66 } },
    ];
}

function getWorstVariants() {
    return [
        {
            kindKey: 'worstKindResize',
            entries: [{ key: 0, value: 10 }, { key: 8, value: 20 }, { key: 16, value: 30 }, { key: 24, value: 40 }, { key: 32, value: 50 }, { key: 40, value: 60 }],
            insert: { key: 48, value: 70 },
        },
    ];
}

function applyPreparedEntries(entries) {
    for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        const idx = findSlotForKey(e.key);
        if (idx < 0) continue;
        table[idx] = { key: e.key, value: e.value };
        coinsOnSlot[idx] = 1;
        bank++;
        size++;
    }
}

function updateCaseButtons() {
    const bestInsertBtn = document.getElementById('btnBestInsertPrepared');
    const worstInsertBtn = document.getElementById('btnWorstInsertPrepared');
    if (!bestInsertBtn || !worstInsertBtn) return;
    bestInsertBtn.disabled = preparedCaseMode !== 'best';
    worstInsertBtn.disabled = preparedCaseMode !== 'worst';
}

// ─── Helpers (hashing, random) ────────────────────────────────────────────────
function hashKey(keyInt) {
    const k = Number(keyInt);
    return (k >>> 0);
}


function totalSavedCoins() {
    var total = 0;
    for (var i = 0; i < coinsOnSlot.length; i++) {
        total += coinsOnSlot[i];
    }
    return total;
}

function updateCoinCounter() {
    const d = dict[currentLang];
    const el = document.getElementById('creditCounter');
    if (el) el.textContent = `${d.coins}: ${totalSavedCoins()}`;
}

function updateBankCounter() {
    const d = dict[currentLang];
    const el = document.getElementById('bankCounter');
    if (el) el.textContent = `${d.bank}: ${bank}`;
}

function updateStepCounter() {
    const d = dict[currentLang];
    const el = document.getElementById('stepCounter');
    if (el) el.textContent = `${d.steps}: ${steps}`;
}

function updateInstructionCounter() {
    const d = dict[currentLang];
    const el = document.getElementById('instructionCounter');
    if (el) el.textContent = `${d.instructions || d.steps}: ${instructions}`;
}

function currentLoadFactor() {
    return capacity === 0 ? 0 : (size / capacity);
}

function updateMeta() {
    const d = dict[currentLang];
    const elSize = document.getElementById('metaSize');
    const elCap = document.getElementById('metaCapacity');
    const elLoad = document.getElementById('metaLoad');
    const elTh = document.getElementById('metaThreshold');
    const elThLabel = document.getElementById('metaThresholdLabel');
    const elThValue = document.getElementById('metaThresholdValue');

    if (elSize) elSize.textContent = `${d.metaSize}: ${size}`;
    if (elCap) elCap.textContent = `${d.metaCapacity}: ${capacity}`;
    if (elLoad) elLoad.textContent = `${d.metaLoad}: ${(currentLoadFactor()).toFixed(2)}`;
    if (elThLabel && elThValue) {
        elThLabel.textContent = d.metaThreshold;
        elThValue.textContent = String(LOAD_THRESHOLD);
    } else if (elTh) {
        // Fallback for older markup.
        elTh.textContent = `${d.metaThreshold}: ${LOAD_THRESHOLD}`;
    }
}

// ─── Visualisation ────────────────────────────────────────────────────────────

function renderTableState(cap, tbl, coins, highlightIndex) {
    if (highlightIndex === undefined) highlightIndex = null;
    const grid = document.getElementById('hashTableVisualization');
    if (!grid) return;
    grid.innerHTML = '';
    const d = dict[currentLang];
    for (let i = 0; i < cap; i++) {
        const slot = document.createElement('div');
        slot.classList.add('hash-slot');
        if (highlightIndex === i) slot.classList.add('slot-highlight');
        const header = document.createElement('div');
        header.classList.add('slot-header');
        const idx = document.createElement('div');
        idx.classList.add('slot-index');
        idx.textContent = `[${i}]`;
        const state = document.createElement('div');
        state.classList.add('slot-state');
        state.textContent = tbl[i] ? d.slotStateOccupied : d.slotStateEmpty;
        header.appendChild(idx);
        header.appendChild(state);
        const body = document.createElement('div');
        body.classList.add('slot-body');
        const kv = document.createElement('div');
        kv.classList.add('hash-kv');
        kv.textContent = tbl[i] ? `${tbl[i].key} → ${tbl[i].value}` : '';
        const coinsEl = document.createElement('div');
        coinsEl.classList.add('hash-coins');
        const cnt = coins[i] || 0;
        for (let c = 0; c < cnt; c++) {
            const coin = document.createElement('div');
            coin.classList.add('hash-coin');
            coinsEl.appendChild(coin);
        }
        body.appendChild(kv);
        body.appendChild(coinsEl);
        slot.appendChild(header);
        slot.appendChild(body);
        grid.appendChild(slot);
    }
}

function renderTable(highlightIndex) {
    if (highlightIndex === undefined) highlightIndex = null;
    const grid = document.getElementById('hashTableVisualization');
    if (!grid) return;
    grid.innerHTML = '';
    const d = dict[currentLang];

    for (let i = 0; i < capacity; i++) {
        const slot = document.createElement('div');
        slot.classList.add('hash-slot');
        if (highlightIndex === i) slot.classList.add('slot-highlight');

        const header = document.createElement('div');
        header.classList.add('slot-header');

        const idx = document.createElement('div');
        idx.classList.add('slot-index');
        idx.textContent = `[${i}]`;

        const state = document.createElement('div');
        state.classList.add('slot-state');
        state.textContent = table[i] ? d.slotStateOccupied : d.slotStateEmpty;

        header.appendChild(idx);
        header.appendChild(state);

        const body = document.createElement('div');
        body.classList.add('slot-body');

        const kv = document.createElement('div');
        kv.classList.add('hash-kv');
        kv.textContent = table[i] ? `${table[i].key} → ${table[i].value}` : '';

        const coins = document.createElement('div');
        coins.classList.add('hash-coins');
        const cnt = coinsOnSlot[i] || 0;
        for (let c = 0; c < cnt; c++) {
            const coin = document.createElement('div');
            coin.classList.add('hash-coin');
            coins.appendChild(coin);
        }

        body.appendChild(kv);
        body.appendChild(coins);

        slot.appendChild(header);
        slot.appendChild(body);
        grid.appendChild(slot);
    }

    updateMeta();
    updateStepCounter();
    updateInstructionCounter();
    updateCoinCounter();
    updateBankCounter();
}

function clearInfoPanel() {
    const infoPanel = document.getElementById('infoPanel');
    if (!infoPanel) return;
    infoPanel.innerHTML = '';
    const d = dict[currentLang];
    const initialEntry = document.createElement('div');
    initialEntry.classList.add('log-entry', 'info');
    initialEntry.innerHTML = `
        <div class="log-header">
            <span class="log-icon">${LOG_TYPES.INFO.icon}</span>
            <span>${d.steps} ${d.willAppear}</span>
        </div>
    `;
    infoPanel.appendChild(initialEntry);
}

// ─── Core operations ──────────────────────────────────────────────────────────
function findSlotForKey(keyInt, cap, arr) {
    if (cap === undefined) cap = capacity;
    if (arr === undefined) arr = table;
    const h = hashKey(keyInt) % cap;
    for (let offset = 0; offset < cap; offset++) {
        const i = (h + offset) % cap;
        if (!arr[i] || arr[i].key === keyInt) return i;
    }
    return -1; // full
}

async function resizeAndRehash(newCapacity) {
    const d = dict[currentLang];
    const oldCapForMsg = capacity;
    const oldSizeForMsg = size;
    const oldLoadForMsg = oldCapForMsg === 0 ? 0 : (oldSizeForMsg / oldCapForMsg);
    const newLoadForMsg = newCapacity === 0 ? 0 : (oldSizeForMsg / newCapacity);

    createLogEntry(
        LOG_TYPES.RESIZE,
        d.resizeTitle(oldCapForMsg, newCapacity),
        [
            d.resizeWhy(),
            d.rehashStats(oldCapForMsg, newCapacity, oldSizeForMsg, oldLoadForMsg.toFixed(2), newLoadForMsg.toFixed(2))
        ]
    );

    const oldCap = capacity;
    const oldTable = table;
    const oldCoins = coinsOnSlot;

    // Show old table state once so the user sees all elements with their coins before rehash begins.
    renderTable();
    await sleep(getDelay(300));

    capacity = newCapacity;
    table = new Array(capacity).fill(null);
    coinsOnSlot = new Array(capacity).fill(0);

    let moved = 0;
    let totalProbes = 0;
    let maxProbes = 0;
    for (let from = 0; from < oldCap; from++) {
        const entry = oldTable[from];
        if (!entry) continue;

        renderTableState(oldCap, oldTable, oldCoins, from);
        await sleep(getDelay(200));

        let paidFromBank = false;
        if (oldCoins[from] > 0) {
            oldCoins[from] -= 1;
        } else {
            bank -= 1;
            paidFromBank = true;
            updateBankCounter();
        }
        renderTableState(oldCap, oldTable, oldCoins, from);
        await sleep(getDelay(150));

        // Find target slot in the new table
        const oldStart = (hashKey(entry.key) % oldCap);
        const newStart = (hashKey(entry.key) % capacity);

        let probes = 0;
        let to = -1;
        for (let offset = 0; offset < capacity; offset++) {
            probes++;
            const i = (newStart + offset) % capacity;
            if (!table[i]) { to = i; break; }
        }
        if (to === -1) {
            to = findSlotForKey(entry.key, capacity, table);
        }

        totalProbes += probes;
        if (probes > maxProbes) maxProbes = probes;

        // Place element in new slot
        table[to] = entry;
        coinsOnSlot[to] = 0;
        instructions++;

        moved++;
        renderTable(to);
        createLogEntry(
            LOG_TYPES.COPY,
            d.moveElement(from, to, paidFromBank),
            d.moveElementDetails(entry.key, oldStart, newStart, probes),
            { unit: 'instruction' }
        );
        await sleep(getDelay(350));
    }

    createLogEntry(LOG_TYPES.SUCCESS, d.resizeDone(moved), d.rehashSummary(moved, totalProbes, maxProbes));
    renderTable();
}

async function insertKV(keyInt, value) {
    if (isAnimating) return;
    isAnimating = true;

    const d = dict[currentLang];
    steps++;

    beginLogGroup(String(keyInt), String(value));
    createLogEntry(LOG_TYPES.INSERT, d.insertCharge(INSERT_CHARGE));

    let resized = false;
    let probeCount = 0;
    let collisionCount = 0;
    let wasUpdate = false;

    // Resize check before insert
    const projectedLoad = (size + 1) / capacity;
    createLogEntry(LOG_TYPES.INFO, d.resizeCheck(projectedLoad.toFixed(2), LOAD_THRESHOLD.toFixed(2)));
    if (projectedLoad > LOAD_THRESHOLD) {
        createLogEntry(LOG_TYPES.WARNING, d.resizeNeededNow(projectedLoad.toFixed(2), LOAD_THRESHOLD.toFixed(2)));
        resized = true;
        await resizeAndRehash(capacity * 2);
    } else {
        createLogEntry(LOG_TYPES.INFO, d.resizeNotNeeded(projectedLoad.toFixed(2), LOAD_THRESHOLD.toFixed(2)));
    }

    let opBank = INSERT_CHARGE;

    // probe
    const rawHash = hashKey(keyInt) >>> 0;
    const h = rawHash % capacity;
    createLogEntry(LOG_TYPES.INFO, d.hashStart(String(keyInt), rawHash, capacity, h));
    let placedAt = -1;

    for (let offset = 0; offset < capacity; offset++) {
        const i = (h + offset) % capacity;
        probeCount++;
        instructions++;
        renderTable(i);
        createLogEntry(LOG_TYPES.PROBE, d.probeCheck(i), null, { unit: 'instruction' });
        await sleep(getDelay(250));

        // UPDATE
        if (table[i] && table[i].key === keyInt) {
            wasUpdate = true;
            createLogEntry(LOG_TYPES.INFO, d.updateFound(i));
            createLogEntry(LOG_TYPES.INFO, d.updateCostExplain(i));
            await sleep(getDelay(180));

            if (coinsOnSlot[i] > 0) {
                coinsOnSlot[i] -= 1;
                opBank += 1;
                renderTable(i);
                createLogEntry(LOG_TYPES.INFO, d.updateBorrowCoin(i));
                await sleep(getDelay(160));
            }

            // do the update
            table[i].value = value;
            instructions++;
            if (opBank > 0) opBank -= 1;
            createLogEntry(LOG_TYPES.SUCCESS, d.updateDone(i), null, { unit: 'instruction' });
            await sleep(getDelay(160));

            if (coinsOnSlot[i] === 0) {
                coinsOnSlot[i] = 1;
                renderTable(i);
                createLogEntry(LOG_TYPES.INFO, d.updateReturnCoin(i));
                await sleep(getDelay(140));
            }

            placedAt = i;
            renderTable(i);
            break;
        }

        // collision, continue probing
        if (table[i]) {
            collisionCount++;
            createLogEntry(LOG_TYPES.WARNING, d.probeCollision(i, table[i].key));
            await sleep(getDelay(200));

            const next = (i + 1) % capacity;
            renderTable(next);
            createLogEntry(LOG_TYPES.PROBE, d.probeNext(next));
            await sleep(getDelay(180));
            continue;
        }

        createLogEntry(LOG_TYPES.INFO, d.emptySlotFound(i));

        // write
        table[i] = { key: keyInt, value };
        size++;
        instructions++; // one write instruction

        // 1 coin pays for placement
        if (opBank > 0) opBank--;
        createLogEntry(LOG_TYPES.SUCCESS, d.placeElement(i), null, { unit: 'instruction' });

        // 1 coin saved on the slot for future rehash.
        coinsOnSlot[i] = 1;
        createLogEntry(LOG_TYPES.INFO, d.saveForRehash(i));

        // 3rd coin goes to the global bank.
        bank++;
        updateBankCounter();
        createLogEntry(LOG_TYPES.INFO, d.sendToBank(i));

        placedAt = i;
        renderTable(i);
        break;
    }

    if (placedAt === -1) {
        createLogEntry(LOG_TYPES.WARNING, 'Table is full even after resize.');
    } else {
        createLogEntry(LOG_TYPES.INFO, d.insertSummary(size, capacity, currentLoadFactor().toFixed(2)));
    }

    endLogGroup();
    renderTable();
    isAnimating = false;

    return {
        resized,
        probes: probeCount,
        collisions: collisionCount,
        wasUpdate,
        placedAt,
    };
}

// ─── Modes ────────────────────────────────────────────────────────────────────
async function addManual() {
    const d = dict[currentLang];

    const keyRes = InputValidation.readInt('keyInput', { required: true });
    if (!keyRes.ok) { InputValidation.reportValidation(keyRes, d, updateInfoPanel); return; }

    const valueRes = InputValidation.readInt('valueInput', { required: true });
    if (!valueRes.ok) { InputValidation.reportValidation(valueRes, d, updateInfoPanel); return; }

    await insertKV(keyRes.value, valueRes.value);
}

async function generateRandom() {
    if (isAnimating) return;

    const d = dict[currentLang];
    const countRes = InputValidation.readInt('randomCount', { required: true, min: 1 });
    if (!countRes.ok) { InputValidation.reportValidation(countRes, d, updateInfoPanel); return; }

    const rangeRes = InputValidation.readIntMinMax('randomKeyMin', 'randomKeyMax', { required: true });
    if (!rangeRes.ok) { InputValidation.reportValidation(rangeRes, d, updateInfoPanel); return; }

    const count = countRes.value;
    const keyMin = rangeRes.min;
    const keyMax = rangeRes.max;

    for (let i = 0; i < count; i++) {
        const k = randInt(keyMin, keyMax);
        const v = randInt(0, 99);
        await insertKV(k, v);
        await sleep(getDelay(200));
    }
}

function prepareBestCase(nextVariant) {
    if (nextVariant === undefined) nextVariant = false;
    const variants = getBestVariants();
    if (nextVariant) {
        bestVariantIndex = (bestVariantIndex + 1) % variants.length;
    } else {
        bestVariantIndex = 0;
    }
    const scenario = variants[bestVariantIndex];

    resetHashTable();
    applyPreparedEntries(scenario.entries);
    preparedCaseMode = 'best';
    preparedScenario = scenario;
    renderTable();

    const d = dict[currentLang];
    updateInfoPanel(d.bestReadyVariant(bestVariantIndex + 1, variants.length, scenario.insert.key, scenario.insert.value));
    updateCaseButtons();
}

function prepareWorstCase(nextVariant) {
    if (nextVariant === undefined) nextVariant = false;
    const variants = getWorstVariants();
    if (nextVariant) {
        worstVariantIndex = (worstVariantIndex + 1) % variants.length;
    } else {
        worstVariantIndex = 0;
    }
    const scenario = variants[worstVariantIndex];

    resetHashTable();
    applyPreparedEntries(scenario.entries);
    preparedCaseMode = 'worst';
    preparedScenario = scenario;
    renderTable();

    const d = dict[currentLang];
    const projectedLoad = ((size + 1) / capacity).toFixed(2);
    const threshold = LOAD_THRESHOLD.toFixed(2);
    const willResize = ((size + 1) / capacity) > LOAD_THRESHOLD;
    updateInfoPanel(
        d.worstReadyVariant(
            worstVariantIndex + 1,
            variants.length,
            scenario.insert.key,
            scenario.insert.value,
            projectedLoad,
            threshold,
            willResize
        )
    );
    updateCaseButtons();
}

async function runPreparedCaseInsert(mode) {
    if (isAnimating) return;
    const d = dict[currentLang];

    if (preparedCaseMode !== mode || !preparedScenario) {
        updateInfoPanel(mode === 'best' ? d.prepareFirstBest : d.prepareFirstWorst);
        return;
    }

    const stats = await insertKV(preparedScenario.insert.key, preparedScenario.insert.value);
    if (!stats) return;

    if (mode === 'best') {
        createLogEntry(LOG_TYPES.INFO, d.bestInsertExplain(stats.probes, stats.collisions, stats.resized));
    } else {
        createLogEntry(
            LOG_TYPES.INFO,
            d.worstInsertExplain(stats.probes, stats.collisions, stats.resized)
        );
    }

    preparedCaseMode = null;
    preparedScenario = null;
    updateCaseButtons();
}

// ─── Reset / Init ─────────────────────────────────────────────────────────────
function resetHashTable() {
    capacity = INITIAL_CAPACITY;
    size = 0;
    table = new Array(capacity).fill(null);
    coinsOnSlot = new Array(capacity).fill(0);
    bank = 0;
    steps = 0;
    instructions = 0;
    isAnimating = false;
    preparedCaseMode = null;
    preparedScenario = null;

    clearInfoPanel();
    renderTable();
    updateCaseButtons();
}

window.addEventListener('load', function() {
    table = new Array(capacity).fill(null);
    coinsOnSlot = new Array(capacity).fill(0);
    resetHashTable();
});

