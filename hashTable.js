/* hashTable.js – simulation logic for the Hash Table page.
 *
 * We simulate a classic key→value hash table implemented using:
 *   - open addressing with linear probing
 *   - resizing (capacity doubled) when load factor exceeds a threshold
 *
 * Accounting method (coin argument):
 *   Every INSERT is charged a constant amortized fee of 3 coins.
 *     1 coin pays for the actual placement (the "write"),
 *     1 coin is saved on the stored element to pay for moving it during a future rehash,
 *     1 coin is a small reserve used to pay for probing steps (collisions).
 *
 * During RESIZE/REHASH, each moved element spends its saved coin to pay for its move.
 * Therefore the total cost of rehash is paid by previously saved coins.
 */

// ─── State ────────────────────────────────────────────────────────────────────
const INITIAL_CAPACITY = 8;
const LOAD_THRESHOLD = 0.75;
const INSERT_CHARGE = 3;

let capacity = INITIAL_CAPACITY;
let size = 0; // number of live entries
let table = []; // { key, value } | null
let coinsOnSlot = []; // saved coin per occupied slot (0/1)
let stepsLocal = 0; // internal step count, mirrored to global `steps` from hash-ui.js
let isAnimating = false;

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

    if (elSize) elSize.textContent = `${d.metaSize}: ${size}`;
    if (elCap) elCap.textContent = `${d.metaCapacity}: ${capacity}`;
    if (elLoad) elLoad.textContent = `${d.metaLoad}: ${(currentLoadFactor()).toFixed(2)}`;
    if (elTh) elTh.textContent = `${d.metaThreshold}: ${LOAD_THRESHOLD}`;
}

// ─── Visualisation ────────────────────────────────────────────────────────────
function renderTable(highlightIndex = null) {
    const grid = document.getElementById('hashTableVisualization');
    if (!grid) return;
    grid.innerHTML = '';

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
        state.textContent = table[i] ? 'occupied' : 'empty';

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
            <span class="log-icon">👋</span>
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
        if (!arr[i] || arr[i].key === keyInt) return i;
    }
    return -1; // full
}

async function resizeAndRehash(newCapacity) {
    const d = dict[currentLang];
    createLogEntry(LOG_TYPES.RESIZE, d.resizeTitle(capacity, newCapacity), d.resizeWhy());

    const oldCap = capacity;
    const oldTable = table;
    const oldCoins = coinsOnSlot;

    capacity = newCapacity;
    table = new Array(capacity).fill(null);
    coinsOnSlot = new Array(capacity).fill(0);

    // Reinsert old entries. Each entry spends its saved coin to pay for the move.
    let moved = 0;
    for (let from = 0; from < oldCap; from++) {
        const entry = oldTable[from];
        if (!entry) continue;

        // spend the saved coin
        if (oldCoins[from] > 0) oldCoins[from] -= 1;

        const to = findSlotForKey(entry.key, capacity, table);
        table[to] = entry;
        coinsOnSlot[to] = 1; // coin re-saved on new slot (invariant continues)

        moved++;
        renderTable(to);
        createLogEntry(LOG_TYPES.COPY, d.moveElement(from, to));
        await new Promise(r => setTimeout(r, getDelay(350)));
    }

    createLogEntry(LOG_TYPES.SUCCESS, d.resizeDone(moved));
    renderTable();
}

async function insertKV(keyInt, value) {
    if (isAnimating) return;
    isAnimating = true;

    const d = dict[currentLang];
    steps++;

    beginLogGroup(String(keyInt));
    createLogEntry(LOG_TYPES.INSERT, d.insertCharge(INSERT_CHARGE));

    // Resize check BEFORE insertion (classic approach)
    if ((size + 1) / capacity > LOAD_THRESHOLD) {
        await resizeAndRehash(capacity * 2);
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
        renderTable(i);
        createLogEntry(LOG_TYPES.PROBE, d.probeCheck(i));
        await new Promise(r => setTimeout(r, getDelay(250)));

        if (table[i] && table[i].key !== keyInt) {
            // collision
            if (bank > 0) bank--; // spend 1 coin for a probing step
            createLogEntry(LOG_TYPES.WARNING, d.probeCollision(i));
            await new Promise(r => setTimeout(r, getDelay(200)));
            continue;
        }

        // write / update
        const isNew = !table[i];
        table[i] = { key: keyInt, value };
        if (isNew) size++;

        // 1 coin pays for placement
        if (bank > 0) bank--;
        createLogEntry(LOG_TYPES.SUCCESS, d.placeElement(i));

        // 1 coin saved on element for future rehash (only if new)
        if (isNew) {
            coinsOnSlot[i] = 1;
            createLogEntry(LOG_TYPES.INFO, d.saveForRehash(i));
        }

        placedAt = i;
        renderTable(i);
        break;
    }

    if (placedAt === -1) {
        // should be impossible with resizing, but safe guard
        createLogEntry(LOG_TYPES.WARNING, 'Table is full even after resize.');
    }

    endLogGroup();
    renderTable();
    isAnimating = false;
}

// ─── Modes ────────────────────────────────────────────────────────────────────
async function addManual() {
    const keyRaw = (document.getElementById('keyInput')?.value || '').trim();
    const value = (document.getElementById('valueInput')?.value || '').trim();
    const keyInt = Number(keyRaw);
    if (keyRaw === '' || !Number.isFinite(keyInt) || !Number.isInteger(keyInt) || value === '') {
        alert(dict[currentLang].invalidInput);
        return;
    }
    await insertKV(keyInt, value);
}

async function generateRandom() {
    if (isAnimating) return;

    const count = parseInt(document.getElementById('randomCount')?.value || '0', 10);
    const keyMin = parseInt(document.getElementById('randomKeyMin')?.value || '0', 10);
    const keyMax = parseInt(document.getElementById('randomKeyMax')?.value || '99', 10);
    if (!Number.isFinite(count) || count <= 0 || !Number.isFinite(keyMin) || !Number.isFinite(keyMax) || keyMin > keyMax) {
        alert(dict[currentLang].invalidInput);
        return;
    }

    for (let i = 0; i < count; i++) {
        const k = randKeyInt(keyMin, keyMax);
        const v = randInt(0, 99);
        await insertKV(k, v);
        await new Promise(r => setTimeout(r, getDelay(200)));
    }
}

function prepareBestCase() {
    resetHashTable();
    // keep table mostly empty, easy insertion
    updateInfoPanel(dict[currentLang].bestReady);
    renderTable();
}

async function prepareWorstCase() {
    resetHashTable();
    // Fill to threshold - 1 so the next insert triggers resize.
    const target = Math.max(0, Math.floor(capacity * LOAD_THRESHOLD) - 1);
    for (let i = 0; i < target; i++) {
        // Choose keys that share the same start slot: k % capacity = 0 (guaranteed collisions)
        const k = i * capacity;
        const idx = findSlotForKey(k);
        table[idx] = { key: k, value: i };
        coinsOnSlot[idx] = 1;
        size++;
    }
    updateInfoPanel(dict[currentLang].worstReady);
    renderTable();
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

    clearInfoPanel();
    renderTable();
}

window.addEventListener('load', () => {
    // init state used by render
    table = new Array(capacity).fill(null);
    coinsOnSlot = new Array(capacity).fill(0);
    resetHashTable();
});


