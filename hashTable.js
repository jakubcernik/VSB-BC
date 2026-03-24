/* hashTable.js – simulation logic for the Hash Table page.
 *
 * We simulate a classic key→value hash table implemented using:
 *   - open addressing with linear probing
 *   - resizing (capacity doubled) when load factor exceeds a threshold
 *
 * Accounting method (coin argument) used in this demo:
 *   We show amortized O(1) cost of INSERT with respect to RESIZE/REHASH.
 *   Every INSERT is charged a fixed amortized fee of 2 coins:
 *     1 coin pays for the actual placement (the "write"),
 *     1 coin is saved on the stored element to pay for moving it during a future rehash.
 *
 * During RESIZE/REHASH, each moved element spends its saved coin to pay for exactly one move.
 *
 * Important note (academic precision):
 *   Linear probing may require checking many slots in the worst case. This demo logs probing
 *   steps as visual work, but the coin argument here is meant to explain how the Θ(n) rehash
 *   work is amortized over prior inserts (not to deterministically pay for all collision patterns).
 */

// ─── State ────────────────────────────────────────────────────────────────────
const INITIAL_CAPACITY = 8;
const LOAD_THRESHOLD = 0.75;
const INSERT_CHARGE = 2;

let capacity = INITIAL_CAPACITY;
let size = 0; // number of live entries
let table = []; // { key, value } | null
let coinsOnSlot = []; // saved coin per occupied slot (0/1)
let stepsLocal = 0; // internal step count, mirrored to global `steps` from hash-ui.js
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
            kindKey: 'worstKindProbe',
            entries: [{ key: 0, value: 10 }, { key: 8, value: 20 }, { key: 16, value: 30 }, { key: 24, value: 40 }, { key: 32, value: 50 }],
            insert: { key: 40, value: 60 },
        },
        {
            kindKey: 'worstKindResize',
            entries: [{ key: 0, value: 10 }, { key: 8, value: 20 }, { key: 16, value: 30 }, { key: 24, value: 40 }, { key: 32, value: 50 }, { key: 40, value: 60 }],
            insert: { key: 48, value: 70 },
        },
        {
            kindKey: 'worstKindUpdate',
            entries: [{ key: 0, value: 10 }, { key: 8, value: 20 }, { key: 16, value: 30 }, { key: 24, value: 40 }, { key: 32, value: 50 }],
            insert: { key: 32, value: 999 },
        },
    ];
}

function applyPreparedEntries(entries) {
    for (const e of entries) {
        const idx = findSlotForKey(e.key);
        if (idx < 0) continue;
        table[idx] = { key: e.key, value: e.value };
        coinsOnSlot[idx] = 1;
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
    // Educational hash for INT keys.
    // We intentionally keep it trivial so students can compute the start slot in their head:
    //   startIndex = key mod capacity
    // In a real implementation we would mix bits better.
    const k = Number(keyInt);
    // ensure non-negative 32-bit
    return (k >>> 0);
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randKeyInt(min, max) {
    return randInt(min, max);
}

function totalSavedCoins() {
    return coinsOnSlot.reduce((s, c) => s + c, 0);
}

function updateCoinCounter() {
    const d = dict[currentLang];
    const el = document.getElementById('creditCounter');
    if (el) el.textContent = `${d.coins}: ${totalSavedCoins()}`;
}

function updateStepCounter() {
    const d = dict[currentLang];
    const el = document.getElementById('stepCounter');
    if (el) el.textContent = `${d.steps}: ${steps}`;
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
function renderTable(highlightIndex = null) {
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
    updateCoinCounter();
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
function findSlotForKey(keyInt, cap = capacity, arr = table) {
    const h = hashKey(keyInt) % cap;
    for (let offset = 0; offset < cap; offset++) {
        const i = (h + offset) % cap;
        // Standard open-addressing rule: stop either on the matching key (UPDATE)
        // or on the first empty slot (INSERT).
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

    capacity = newCapacity;
    table = new Array(capacity).fill(null);
    coinsOnSlot = new Array(capacity).fill(0);

    // Reinsert old entries. Each entry spends its saved coin to pay for the move.
    let moved = 0;
    let totalProbes = 0;
    let maxProbes = 0;
    for (let from = 0; from < oldCap; from++) {
        const entry = oldTable[from];
        if (!entry) continue;

        // spend the saved coin
        if (oldCoins[from] > 0) oldCoins[from] -= 1;

        // When capacity changes, start slot changes too: hash(key) mod capacity.
        // During re-insert we may need to probe forward due to collisions.
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
            // Should not happen (we resize before full), but keep it safe.
            to = findSlotForKey(entry.key, capacity, table);
        }

        totalProbes += probes;
        if (probes > maxProbes) maxProbes = probes;

        table[to] = entry;
        coinsOnSlot[to] = 1; // coin re-saved on new slot (invariant continues)

        moved++;
        renderTable(to);
        createLogEntry(LOG_TYPES.COPY, d.moveElement(from, to), d.moveElementDetails(entry.key, oldStart, newStart, probes));
        await new Promise(r => setTimeout(r, getDelay(350)));
    }

    createLogEntry(LOG_TYPES.SUCCESS, d.resizeDone(moved), d.rehashSummary(moved, totalProbes, maxProbes));
    renderTable();
}

async function insertKV(keyInt, value) {
    if (isAnimating) return;
    isAnimating = true;

    const d = dict[currentLang];
    steps++;

    beginLogGroup(String(keyInt));
    createLogEntry(LOG_TYPES.INSERT, d.insertCharge(INSERT_CHARGE));

    let resized = false;
    let probeCount = 0;
    let collisionCount = 0;
    let wasUpdate = false;

    // Resize check BEFORE insertion (classic approach)
    const projectedLoad = (size + 1) / capacity;
    createLogEntry(LOG_TYPES.INFO, d.resizeCheck(projectedLoad.toFixed(2), LOAD_THRESHOLD.toFixed(2)));
    if (projectedLoad > LOAD_THRESHOLD) {
        createLogEntry(LOG_TYPES.WARNING, d.resizeNeededNow(projectedLoad.toFixed(2), LOAD_THRESHOLD.toFixed(2)));
        resized = true;
        await resizeAndRehash(capacity * 2);
    } else {
        createLogEntry(LOG_TYPES.INFO, d.resizeNotNeeded(projectedLoad.toFixed(2), LOAD_THRESHOLD.toFixed(2)));
    }

    // operation bank
    let bank = INSERT_CHARGE;

    // probe
    const rawHash = hashKey(keyInt) >>> 0;
    const h = rawHash % capacity;
    createLogEntry(LOG_TYPES.INFO, d.hashStart(String(keyInt), rawHash, capacity, h));
    let placedAt = -1;

    for (let offset = 0; offset < capacity; offset++) {
        const i = (h + offset) % capacity;
        probeCount++;
        renderTable(i);
        createLogEntry(LOG_TYPES.PROBE, d.probeCheck(i));
        await new Promise(r => setTimeout(r, getDelay(250)));

        // If the key already exists, a standard hash table performs UPDATE.
        if (table[i] && table[i].key === keyInt) {
            wasUpdate = true;
            // (Coin model) UPDATE costs 1 step. We pay it using the coin saved on this element.
            createLogEntry(LOG_TYPES.INFO, d.updateFound(i));
            createLogEntry(LOG_TYPES.INFO, d.updateCostExplain(i));
            await new Promise(r => setTimeout(r, getDelay(180)));

            if (coinsOnSlot[i] > 0) {
                coinsOnSlot[i] -= 1;
                bank += 1;
                renderTable(i);
                createLogEntry(LOG_TYPES.INFO, d.updateBorrowCoin(i));
                await new Promise(r => setTimeout(r, getDelay(160)));
            }

            // do the update
            table[i].value = value;
            if (bank > 0) bank -= 1;
            createLogEntry(LOG_TYPES.SUCCESS, d.updateDone(i));
            await new Promise(r => setTimeout(r, getDelay(160)));

            // return the coin back to the element so invariants for rehash stay intact
            if (coinsOnSlot[i] === 0) {
                coinsOnSlot[i] = 1;
                renderTable(i);
                createLogEntry(LOG_TYPES.INFO, d.updateReturnCoin(i));
                await new Promise(r => setTimeout(r, getDelay(140)));
            }

            placedAt = i;
            renderTable(i);
            break;
        }

        // Occupied by a different key => collision, continue probing
        if (table[i]) {
            collisionCount++;
            // Collision: we continue probing.
            // (Note) We do NOT attempt to maintain a strict “coins pay every probe” invariant here.
            // The saved coin model is used to explain amortized resize/rehash.
            createLogEntry(LOG_TYPES.WARNING, d.probeCollision(i, table[i].key));
            await new Promise(r => setTimeout(r, getDelay(200)));

            const next = (i + 1) % capacity;
            renderTable(next);
            createLogEntry(LOG_TYPES.PROBE, d.probeNext(next));
            await new Promise(r => setTimeout(r, getDelay(180)));
            continue;
        }

        createLogEntry(LOG_TYPES.INFO, d.emptySlotFound(i));

        // write
        table[i] = { key: keyInt, value };
        size++;

        // 1 coin pays for placement
        if (bank > 0) bank--;
        createLogEntry(LOG_TYPES.SUCCESS, d.placeElement(i));

        // Save 1 coin on the element for future rehash.
        coinsOnSlot[i] = 1;
        createLogEntry(LOG_TYPES.INFO, d.saveForRehash(i));

        placedAt = i;
        renderTable(i);
        break;
    }

    if (placedAt === -1) {
        // should be impossible with resizing, but safe guard
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
    if (!keyRes.ok) {
        InputValidation.reportValidationError(keyRes.reason, {
            dict: d,
            details: keyRes.details,
            report: (msg) => updateInfoPanel(msg),
        });
        return;
    }

    const valueRes = InputValidation.readInt('valueInput', { required: true });
    if (!valueRes.ok) {
        InputValidation.reportValidationError(valueRes.reason, {
            dict: d,
            details: valueRes.details,
            report: (msg) => updateInfoPanel(msg),
        });
        return;
    }

    await insertKV(keyRes.value, valueRes.value);
}

async function generateRandom() {
    if (isAnimating) return;

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

    const rangeRes = InputValidation.readIntMinMax('randomKeyMin', 'randomKeyMax', { required: true });
    if (!rangeRes.ok) {
        InputValidation.reportValidationError(rangeRes.reason, {
            dict: d,
            details: rangeRes.details,
            report: (msg) => updateInfoPanel(msg),
        });
        return;
    }

    const count = countRes.value;
    const keyMin = rangeRes.min;
    const keyMax = rangeRes.max;

    for (let i = 0; i < count; i++) {
        const k = randKeyInt(keyMin, keyMax);
        const v = randInt(0, 99);
        await insertKV(k, v);
        await new Promise(r => setTimeout(r, getDelay(200)));
    }
}

function prepareBestCase(nextVariant = false) {
    const variants = getBestVariants();
    bestVariantIndex = nextVariant
        ? (bestVariantIndex + 1) % variants.length
        : 0;
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

function prepareWorstCase(nextVariant = false) {
    const variants = getWorstVariants();
    worstVariantIndex = nextVariant
        ? (worstVariantIndex + 1) % variants.length
        : 0;
    const scenario = variants[worstVariantIndex];

    resetHashTable();
    applyPreparedEntries(scenario.entries);
    preparedCaseMode = 'worst';
    preparedScenario = scenario;
    renderTable();

    const d = dict[currentLang];
    const kindLabel = d[scenario.kindKey] || scenario.kindKey;
    updateInfoPanel(d.worstReadyVariant(worstVariantIndex + 1, variants.length, scenario.insert.key, scenario.insert.value, kindLabel));
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
        const kindLabel = d[preparedScenario.kindKey] || preparedScenario.kindKey;
        createLogEntry(
            LOG_TYPES.INFO,
            d.worstInsertExplain(kindLabel, stats.probes, stats.collisions, stats.resized, stats.wasUpdate)
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
    steps = 0;
    stepsLocal = 0;
    isAnimating = false;
    preparedCaseMode = null;
    preparedScenario = null;

    clearInfoPanel();
    renderTable();
    updateCaseButtons();
}

window.addEventListener('load', () => {
    // init state used by render
    table = new Array(capacity).fill(null);
    coinsOnSlot = new Array(capacity).fill(0);
    resetHashTable();
});


