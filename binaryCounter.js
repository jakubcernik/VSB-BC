/* binaryCounter.js – simulation logic for the Binary Counter page.
 *
 * Accounting method (Banker's / Coin argument):
 *   Each INCREMENT is charged a fixed amortized fee of exactly 2 coins.
 *   These 2 coins arrive at the START of the operation.
 *
 *   How the 2 coins are spent:
 *   - Flip 0→1 (exactly once per INCREMENT): costs 1 coin (from the 2 received).
 *                                             1 coin is SAVED on that bit position.
 *   - Flip 1→0 during carry propagation:     each such flip is paid by the
 *                                             SAVED coin already sitting on that bit.
 *                                             No new coins are needed!
 *
 *   Invariant: every bit that is currently 1 has exactly 1 coin saved on it.
 *   Because carry propagation only touches 1-bits, and each 1-bit already has
 *   its coin, we can NEVER go into debt – no matter how many bits carry.
 *
 *   Therefore: total work for n increments ≤ 2n  →  O(1) amortized per increment.
 */

// ─── State ────────────────────────────────────────────────────────────────────
const DEFAULT_BITS = 8;
const MIN_BITS = 4;
const MAX_BITS = 12;

let numBits = DEFAULT_BITS;  // Display width (default 8-bit for clarity)
let bits        = new Array(numBits).fill(0);   // bits[0] = LSB
let coinsOnBit  = new Array(numBits).fill(0);   // saved coins per bit position (invariant: 1-bit ↔ 1 coin)
let bank        = 0;         // coins currently in the "operation bank" (transient during one increment)
let totalCoinsEarned = 0;    // total coins received across all increments (= steps × 2)
let isAnimating = false;
let bestVariantIndex = 0;
let worstVariantIndex = 0;
let preparedCaseMode = null;

function maxCounterValue() {
    return Math.pow(2, numBits) - 1;
}

function reinitializeCounterState() {
    bits = new Array(numBits).fill(0);
    coinsOnBit = new Array(numBits).fill(0);
    bank = 0;
    totalCoinsEarned = 0;
    steps = 0;
}

function getBestVariants() {
    const maxEven = Math.max(0, maxCounterValue() - (maxCounterValue() % 2));
    const candidates = [0, 2, 6, 10, 42, 170, maxEven]
        .filter(v => v <= maxEven)
        .filter((v, i, a) => a.indexOf(v) === i);
    return candidates.length ? candidates : [0];
}

function getWorstVariants() {
    return [1, 2, 3, 4, 6, 8, numBits]
        .filter(k => k >= 1 && k <= numBits)
        .filter((k, i, a) => a.indexOf(k) === i)
        .sort((a, b) => a - b);
}

function updateCaseButtons() {
    const bestAlt = document.getElementById('btnRunBestAlt');
    const worstAlt = document.getElementById('btnRunWorstAlt');
    const bestInc = document.getElementById('btnBestIncrement');
    const worstInc = document.getElementById('btnWorstIncrement');
    if (!bestAlt || !worstAlt || !bestInc || !worstInc) return;

    const bestVariants = getBestVariants();
    const worstVariants = getWorstVariants();
    bestAlt.disabled = bestVariants.length <= 1;
    worstAlt.disabled = worstVariants.length <= 1;
    bestInc.disabled = preparedCaseMode !== 'best';
    worstInc.disabled = preparedCaseMode !== 'worst';
}

function countTrailingOnes() {
    let t = 0;
    while (t < numBits && bits[t] === 1) t++;
    return t;
}

function refreshBitLengthUI() {
    const select = document.getElementById('bitLengthSelect');
    if (select) select.value = String(numBits);
}

function setBitLengthFromUI() {
    const select = document.getElementById('bitLengthSelect');
    if (!select || isAnimating) return;
    const parsed = Number.parseInt(select.value, 10);
    if (!Number.isInteger(parsed) || parsed < MIN_BITS || parsed > MAX_BITS) {
        refreshBitLengthUI();
        return;
    }
    numBits = parsed;
    bestVariantIndex = 0;
    worstVariantIndex = 0;
    resetCounter();
    updateCaseButtons();
}

// ─── Coin total helpers ───────────────────────────────────────────────────────
function savedCoinsTotal() {
    return coinsOnBit.reduce((s, c) => s + c, 0);
}

function updateCoinCounter() {
    const d = dict[currentLang];
    const saved = savedCoinsTotal();
    const el = document.getElementById('creditCounter');
    if (el) el.textContent = `${d.coins ?? 'Mince'}: ${d.saved ?? 'uloženo'}: ${saved}, ${d.earned ?? 'celkem přijato'}: ${totalCoinsEarned}`;
}

function updateStepCounter() {
    const d = dict[currentLang];
    document.getElementById('stepCounter').textContent = `${d.steps}: ${steps}`;
}

// ─── Visualisation ────────────────────────────────────────────────────────────
function renderBits() {
    const row = document.getElementById('bitsRow');
    row.innerHTML = '';

    // Render MSB → LSB left-to-right for readability
    for (let i = numBits - 1; i >= 0; i--) {
        const cell = document.createElement('div');
        cell.classList.add('bit-cell');
        cell.id = `bit-cell-${i}`;

        // Position label (bit weight)
        const label = document.createElement('div');
        label.classList.add('bit-label');
        label.textContent = `2^${i}`;

        // Bit square
        const frame = document.createElement('div');
        frame.classList.add('bit-frame', bits[i] ? 'bit-one' : 'bit-zero');
        frame.id = `bit-frame-${i}`;
        frame.textContent = bits[i];

        // Coins row
        const coinsDiv = document.createElement('div');
        coinsDiv.classList.add('bit-coins');
        coinsDiv.id = `bit-coins-${i}`;
        for (let c = 0; c < coinsOnBit[i]; c++) {
            const coin = document.createElement('div');
            coin.classList.add('bit-coin');
            coinsDiv.appendChild(coin);
        }

        cell.appendChild(label);
        cell.appendChild(frame);
        cell.appendChild(coinsDiv);
        row.appendChild(cell);
    }

    // Decimal value
    const value = bitsToDecimal();
    const d = dict[currentLang];
    document.getElementById('decimalDisplay').textContent = `${d.value}: ${value}`;
}

function bitsToDecimal() {
    return bits.reduce((sum, b, i) => sum + b * Math.pow(2, i), 0);
}

// ─── Animated coin update for a single bit position ───────────────────────────
async function animateCoins(bitIndex, targetCount) {
    const coinsDiv = document.getElementById(`bit-coins-${bitIndex}`);
    if (!coinsDiv) return;

    const current = coinsDiv.childElementCount;
    if (targetCount > current) {
        for (let i = current; i < targetCount; i++) {
            const coin = document.createElement('div');
            coin.classList.add('bit-coin', 'adding');
            coinsDiv.appendChild(coin);
            await sleep(getDelay(250));
            coin.classList.remove('adding');
        }
    } else if (targetCount < current) {
        for (let i = current; i > targetCount; i--) {
            const last = coinsDiv.lastChild;
            if (!last) break;
            last.classList.add('removing');
            await sleep(getDelay(250));
            last.remove();
        }
    }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function animateBitFlip(bitIndex, newValue) {
    const frame = document.getElementById(`bit-frame-${bitIndex}`);
    if (!frame) return;
    frame.classList.add('flipping');
    await sleep(getDelay(350));
    frame.classList.remove('flipping', 'bit-one', 'bit-zero');
    frame.classList.add(newValue ? 'bit-one' : 'bit-zero');
    frame.textContent = newValue;
}

// ─── Bank helpers ─────────────────────────────────────────────────────────────
function renderBank(count) {
    const bankDiv = document.getElementById('bankCoins');
    const bankEl  = document.getElementById('operationBank');
    if (!bankDiv) return;

    bankDiv.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const coin = document.createElement('div');
        coin.classList.add('bit-coin');
        bankDiv.appendChild(coin);
    }

    if (bankEl) {
        if (count > 0) bankEl.classList.add('bank-active');
        else            bankEl.classList.remove('bank-active');
    }
}

async function spendCoinFromBank() {
    const bankDiv = document.getElementById('bankCoins');
    if (!bankDiv) return;
    const last = bankDiv.lastChild;
    if (!last) return;
    last.classList.add('removing');
    await sleep(getDelay(300));
    last.remove();
    if (bankDiv.childElementCount === 0) {
        const bankEl = document.getElementById('operationBank');
        if (bankEl) bankEl.classList.remove('bank-active');
    }
}

async function moveCoinFromBankToBit(bitIndex) {
    // Vizuálně odebereme minci z banku a přidáme ji na bit
    await spendCoinFromBank();
    await animateCoins(bitIndex, 1);
}

// ─── Core: increment ──────────────────────────────────────────────────────────
async function increment() {
    if (isAnimating) return;

    const d = dict[currentLang];
    const valueBefore = bitsToDecimal();

    // Overflow guard (255 → reset for 8-bit)
    if (valueBefore >= maxCounterValue()) {
        resetCounter();
        return;
    }

    isAnimating = true;
    steps++;
    updateStepCounter();

    const valueAfter = valueBefore + 1;
    beginLogGroup(valueBefore, valueAfter);

    // ── KROK 1: Přijmeme 2 mince – zobrazí se fyzicky v banku ────────────────
    // Pevný poplatek za každý INCREMENT, vždy přesně 2.
    totalCoinsEarned += 2;
    bank = 2;
    renderBank(2);
    createLogEntry(LOG_TYPES.INSERT, d.allocCoins());
    updateCoinCounter();
    await sleep(getDelay(400));

    let flipCount = 0;
    let pos = 0;

    // ── KROK 2: Carry propagace – 1-bity platí ze SVÝCH mincí, banka se nedotýká
    while (pos < numBits && bits[pos] === 1) {
        const frame = document.getElementById(`bit-frame-${pos}`);
        if (frame) frame.classList.add('active-bit');

        createLogEntry(LOG_TYPES.COPY, d.spendSaved(pos));

        bits[pos] = 0;
        coinsOnBit[pos] = 0;
        updateCoinCounter();

        await animateBitFlip(pos, 0);
        await animateCoins(pos, 0);   // mince zmizí z bitu (utracena za flip)

        if (frame) frame.classList.remove('active-bit');

        flipCount++;
        pos++;
        await sleep(getDelay(200));
    }

    // ── KROK 3: Flip 0→1 – 1 mince z banku zaplatí flip, 1 mince přeletí na bit
    if (pos < numBits) {
        const frame = document.getElementById(`bit-frame-${pos}`);
        if (frame) frame.classList.add('active-bit');

        // Utratíme 1 minci z banku za samotný flip (zmizí z banku)
        bank -= 1;
        createLogEntry(LOG_TYPES.COPY, d.spendSelf(pos));
        await spendCoinFromBank();
        await animateBitFlip(pos, 1);

        // Přesuneme 1 minci z banku na bit (rezerva pro budoucí flip 1→0)
        bank -= 1;
        bits[pos] = 1;
        coinsOnBit[pos] = 1;
        updateCoinCounter();

        createLogEntry(LOG_TYPES.SUCCESS, d.saveCoin(pos));
        await moveCoinFromBankToBit(pos);  // mince "přeletí" z banku na bit

        if (frame) frame.classList.remove('active-bit');

        flipCount++;
    }

    // Banka je nyní přesně prázdná (0 mincí)
    renderBank(0);

    document.getElementById('decimalDisplay').textContent = `${d.value}: ${bitsToDecimal()}`;

    createLogEntry(LOG_TYPES.SUCCESS, d.incrDone(flipCount));
    endLogGroup();

    isAnimating = false;
}

// ─── Reset ────────────────────────────────────────────────────────────────────
function resetCounter() {
    isAnimating = false;
    preparedCaseMode = null;
    reinitializeCounterState();

    updateCoinCounter();
    updateStepCounter();
    renderBits();
    refreshBitLengthUI();

    const d = dict[currentLang];
    const panel = document.getElementById('infoPanel');
    panel.innerHTML = '';
    const init = document.createElement('div');
    init.classList.add('log-entry', 'info');
    init.innerHTML = `<div class="log-header"><span class="log-icon">${LOG_TYPES.INFO.icon}</span><span>${d.steps} ${d.willAppear}</span></div>`;
    panel.appendChild(init);
    updateCaseButtons();
}

// ─── Random mode ──────────────────────────────────────────────────────────────
async function generateRandom() {
    if (isAnimating) return;
    const d = dict[currentLang];
    const countRes = InputValidation.readInt('randomCount', { required: true, min: 1, max: 200 });
    if (!countRes.ok) {
        InputValidation.reportValidationError(countRes.reason, {
            dict: d,
            details: countRes.details,
            report: (msg) => updateInfoPanel(msg),
        });
        return;
    }
    const count = countRes.value;

    resetCounter();
    createLogEntry(LOG_TYPES.INFO, d.randomGenerating(count));

    for (let i = 0; i < count; i++) {
        await increment();
        await sleep(getDelay(100));
        if (bitsToDecimal() >= maxCounterValue()) break;
    }

    createLogEntry(LOG_TYPES.SUCCESS, d.randomDone(count));
}

// ─── Best Case ────────────────────────────────────────────────────────────────
async function prepareBestCase(nextVariant = false) {
    // Best case means LSB=0. We cycle through multiple even values for variety.
    resetCounter();
    const variants = getBestVariants();
    bestVariantIndex = nextVariant
        ? (bestVariantIndex + 1) % variants.length
        : 0;
    const target = variants[bestVariantIndex];

    for (let i = 0; i < numBits; i++) {
        bits[i] = (target >> i) & 1;
        coinsOnBit[i] = bits[i]; // each 1-bit has 1 saved coin
    }
    bank = 0;
    totalCoinsEarned = savedCoinsTotal(); // coins on bits = "already earned & saved" from past ops
    steps = 0;
    updateCoinCounter();
    updateStepCounter();
    renderBits();

    const d = dict[currentLang];
    const panel = document.getElementById('infoPanel');
    panel.innerHTML = '';
    createLogEntry(LOG_TYPES.SUCCESS, d.bestReady(target, bestVariantIndex + 1, variants.length));
    preparedCaseMode = 'best';
    updateCaseButtons();
}

// ─── Worst Case ───────────────────────────────────────────────────────────────
async function prepareWorstCase(nextVariant = false) {
    // Worst-side variants by carry depth (k trailing ones). k=numBits is true worst case.
    resetCounter();
    const variants = getWorstVariants();
    worstVariantIndex = nextVariant
        ? (worstVariantIndex + 1) % variants.length
        : 0;
    const k = variants[worstVariantIndex];

    for (let i = 0; i < numBits; i++) {
        bits[i] = i < k ? 1 : 0;
        coinsOnBit[i] = bits[i]; // each 1-bit has 1 saved coin
    }
    bank = 0;
    totalCoinsEarned = savedCoinsTotal();
    steps = 0;
    updateCoinCounter();
    updateStepCounter();
    renderBits();

    const d = dict[currentLang];
    const panel = document.getElementById('infoPanel');
    panel.innerHTML = '';
    createLogEntry(
        LOG_TYPES.WARNING,
        d.worstReady(k, worstVariantIndex + 1, variants.length, k === numBits)
    );
    preparedCaseMode = 'worst';
    updateCaseButtons();
}

async function incrementPreparedCase(mode) {
    if (isAnimating) return;
    const d = dict[currentLang];

    if (preparedCaseMode !== mode) {
        createLogEntry(
            LOG_TYPES.INFO,
            mode === 'best' ? d.prepareFirstBest : d.prepareFirstWorst
        );
        return;
    }

    const trailingOnes = countTrailingOnes();
    const flips = trailingOnes + 1;
    await increment();

    if (mode === 'best') {
        createLogEntry(LOG_TYPES.INFO, d.bestStepExplain(flips));
    } else {
        createLogEntry(LOG_TYPES.INFO, d.worstStepExplain(trailingOnes, flips, trailingOnes === numBits));
    }

    // Prepared scenario is consumed by this one-step action.
    preparedCaseMode = null;
    updateCaseButtons();
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    refreshBitLengthUI();
    updateCaseButtons();
    renderBits();
});

