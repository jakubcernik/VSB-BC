/* Binary counter simulation logic.
 *
 * Accounting model used in the animation:
 * - Every INCREMENT receives a fixed amortized charge of 2 coins.
 * - One coin pays the single 0->1 flip, one coin is saved on that bit.
 * - Carry flips 1->0 are paid by coins already saved on flipped 1-bits.
 *
 * Invariant: each bit set to 1 has exactly one saved coin.
 */

// ─── State ────────────────────────────────────────────────────────────────────
const DEFAULT_BITS = 8;
const MIN_BITS = 4;
const MAX_BITS = 12;
const INCREMENT_CHARGE = 2;

let numBits = DEFAULT_BITS;  // Display width (default 8-bit for clarity)
let bits        = new Array(numBits).fill(0);   // bits[0] = LSB
let coinsOnBit  = new Array(numBits).fill(0);   // saved coins per bit position (invariant: 1-bit ↔ 1 coin)
let bank        = 0;         // coins currently in the "operation bank" (transient during one increment)
let totalCoinsEarned = 0;    // total coins received across all increments (= operations × 2)
let totalBitSteps = 0;       // total atomic work = number of bit flips (1 flip = 1 step)
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
    resetCounters();
}

function resetCounters() {
    steps = 0;
    totalBitSteps = 0;
}

function getBestVariants() {
    const maxEven = Math.max(0, maxCounterValue() - (maxCounterValue() % 2));
    var raw = [0, 2, 6, 10, 42, 170, maxEven];
    var seen = [];
    var candidates = [];
    for (var i = 0; i < raw.length; i++) {
        if (raw[i] <= maxEven && !seen.includes(raw[i])) {
            candidates.push(raw[i]);
            seen.push(raw[i]);
        }
    }
    return candidates.length ? candidates : [0];
}

function getWorstVariants() {
    var raw = [1, 2, 3, 4, 6, 8, numBits];
    var seen = [];
    var result = [];
    for (var i = 0; i < raw.length; i++) {
        var k = raw[i];
        if (k >= 1 && k <= numBits && !seen.includes(k)) {
            result.push(k);
            seen.push(k);
        }
    }
    result.sort(function(a, b) { return a - b; });
    return result;
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

const randomIntInclusive = InputValidation.randInt;

function applyRandomStateByTrailingOnes(minTrailing, maxTrailing) {
    const t = randomIntInclusive(minTrailing, maxTrailing);

    bits = new Array(numBits).fill(0);
    coinsOnBit = new Array(numBits).fill(0);

    for (let i = 0; i < numBits; i++) {
        let bit = 0;
        if (i < t) bit = 1;
        else if (i > t) bit = Math.random() < 0.5 ? 0 : 1;

        bits[i] = bit;
        coinsOnBit[i] = bit;
    }

    bank = 0;
    totalCoinsEarned = (steps * 2) + savedCoinsTotal();
    renderBank(0);
    updateCoinCounter();
    renderBits();

    return t;
}

// ─── Coin total helpers ───────────────────────────────────────────────────────
function savedCoinsTotal() {
    var total = 0;
    for (var i = 0; i < coinsOnBit.length; i++) {
        total += coinsOnBit[i];
    }
    return total;
}

function updateCoinCounter() {
    const d = dict[currentLang];
    const saved = savedCoinsTotal();
    const el = document.getElementById('creditCounter');
    if (el) el.textContent = `${d.coins ?? 'Mince'}: ${d.saved ?? 'uloženo'}: ${saved}, ${d.earned ?? 'celkem přijato'}: ${totalCoinsEarned}`;
}

function updateStepCounter() {
    const d = dict[currentLang];
    const el = document.getElementById('stepCounter');
    if (el) el.textContent = `${d.steps}: ${steps}`;
}

function updateInstructionCounter() {
    const d = dict[currentLang];
    const el = document.getElementById('instructionCounter');
    if (el) el.textContent = `${d.instructions}: ${totalBitSteps}`;
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
    var sum = 0;
    for (var i = 0; i < bits.length; i++) {
        sum += bits[i] * Math.pow(2, i);
    }
    return sum;
}

// ─── Animated coin updates ────────────────────────────────────────────────────
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

const sleep = InputValidation.sleep;

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

async function spendCoinFromBank(mode) {
    if (mode === undefined) mode = 'fade';
    const bankDiv = document.getElementById('bankCoins');
    if (!bankDiv) return;
    const last = bankDiv.lastChild;
    if (!last) return;
    if (mode === 'fade') {
        last.classList.add('removing');
        await sleep(getDelay(300));
    }
    last.remove();
    if (bankDiv.childElementCount === 0) {
        const bankEl = document.getElementById('operationBank');
        if (bankEl) bankEl.classList.remove('bank-active');
    }
}

async function moveCoinFromBankToBit(bitIndex) {
    const bankDiv = document.getElementById('bankCoins');
    const targetDiv = document.getElementById(`bit-coins-${bitIndex}`);
    if (!bankDiv || !targetDiv) return;

    const sourceCoin = bankDiv.lastChild;
    if (!sourceCoin) return;

    const from = sourceCoin.getBoundingClientRect();
    const to = targetDiv.getBoundingClientRect();
    const duration = getDelay(360);

    const flying = sourceCoin.cloneNode(true);
    flying.classList.add('flying');
    flying.style.left = `${from.left}px`;
    flying.style.top = `${from.top}px`;
    flying.style.transitionDuration = `${duration}ms`;
    document.body.appendChild(flying);

    // Remove source coin first so the animation visibly starts in the bank.
    await spendCoinFromBank('instant');

    const dx = (to.left + (to.width / 2) - (from.left + from.width / 2));
    const dy = (to.top + (to.height / 2) - (from.top + from.height / 2));
    requestAnimationFrame(() => {
        flying.style.transform = `translate(${dx}px, ${dy}px) scale(1)`;
        flying.style.opacity = '0.95';
    });

    await sleep(duration);
    flying.remove();

    // Create the final coin only after the fly animation finishes.
    const landedCoin = document.createElement('div');
    landedCoin.classList.add('bit-coin');
    targetDiv.appendChild(landedCoin);
}

// ─── Core: increment ──────────────────────────────────────────────────────────
async function increment() {
    if (isAnimating) return;

    const d = dict[currentLang];
    const valueBefore = bitsToDecimal();

    // Reset on max value to keep the demo cyclic for the selected bit width.
    if (valueBefore >= maxCounterValue()) {
        resetCounter();
        return;
    }

    isAnimating = true;
    steps++;
    updateStepCounter();

    const valueAfter = valueBefore + 1;
    beginLogGroup(valueBefore, valueAfter);

    // 1) Receive fixed amortized charge into operation bank.
    totalCoinsEarned += INCREMENT_CHARGE;
    bank = INCREMENT_CHARGE;
    renderBank(INCREMENT_CHARGE);
    createLogEntry(LOG_TYPES.INSERT, d.allocCoins());
    updateCoinCounter();
    await sleep(getDelay(400));

    let flipCount = 0;
    let pos = 0;

    // 2) Carry propagation: 1->0 flips are paid by coins saved on those bits.
    while (pos < numBits && bits[pos] === 1) {
        const frame = document.getElementById(`bit-frame-${pos}`);
        if (frame) frame.classList.add('active-bit');

        createLogEntry(LOG_TYPES.COPY, d.spendSaved(pos), null, { unit: 'instruction' });

        bits[pos] = 0;
        coinsOnBit[pos] = 0;
        updateCoinCounter();

        await animateBitFlip(pos, 0);
        await animateCoins(pos, 0);

        if (frame) frame.classList.remove('active-bit');

        flipCount++;
        totalBitSteps++;
        updateInstructionCounter();
        pos++;
        await sleep(getDelay(200));
    }

    // 3) First zero bit flips to one: one bank coin pays, one is saved on that bit.
    if (pos < numBits) {
        const frame = document.getElementById(`bit-frame-${pos}`);
        if (frame) frame.classList.add('active-bit');

        // Spend + flip together so timing stays visually clear.
        bank -= 1;
        createLogEntry(LOG_TYPES.COPY, d.spendSelf(pos), null, { unit: 'instruction' });
        await spendCoinFromBank('fade');
        await animateBitFlip(pos, 1);

        // Save one coin on the bit for its future 1->0 carry flip.
        bank -= 1;
        bits[pos] = 1;
        coinsOnBit[pos] = 1;
        updateCoinCounter();

        createLogEntry(LOG_TYPES.SUCCESS, d.saveCoin(pos));
        await moveCoinFromBankToBit(pos);

        if (frame) frame.classList.remove('active-bit');

        flipCount++;
        totalBitSteps++;
        updateInstructionCounter();
    }

    // Operation bank must be empty after each increment.
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
    updateInstructionCounter();
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

// ─── Random mode ─────────────────────────────────────────────────────────────
async function generateRandom() {
    if (isAnimating) return;
    const d = dict[currentLang];
    const maxTrailingAllowed = Math.max(0, numBits - 1);
    const rangeRes = InputValidation.readIntMinMax('randomMinTrailing', 'randomMaxTrailing', {
        required: true,
        min: 0,
        max: maxTrailingAllowed,
    });
    if (!rangeRes.ok) {
        InputValidation.reportValidation(rangeRes, d, updateInfoPanel);
        return;
    }

    const minTrailing = rangeRes.min;
    const maxTrailing = rangeRes.max;

    resetCounter();
    createLogEntry(LOG_TYPES.INFO, d.randomGenerating(minTrailing, maxTrailing));

    const t = applyRandomStateByTrailingOnes(minTrailing, maxTrailing);
    createLogEntry(LOG_TYPES.INFO, d.randomPrepared(t));
    await increment();

    createLogEntry(LOG_TYPES.SUCCESS, d.randomDone());
}

// ─── Best case ────────────────────────────────────────────────────────────────
async function prepareBestCase(nextVariant) {
    if (nextVariant === undefined) nextVariant = false;
    // Best case means LSB = 0; cycle through several even values.
    resetCounter();
    const variants = getBestVariants();
    if (nextVariant) {
        bestVariantIndex = (bestVariantIndex + 1) % variants.length;
    } else {
        bestVariantIndex = 0;
    }
    const target = variants[bestVariantIndex];

    for (let i = 0; i < numBits; i++) {
        bits[i] = (target >> i) & 1;
        coinsOnBit[i] = bits[i];
    }
    bank = 0;
    totalCoinsEarned = savedCoinsTotal();
    resetCounters();
    updateCoinCounter();
    updateStepCounter();
    updateInstructionCounter();
    renderBits();

    const d = dict[currentLang];
    const panel = document.getElementById('infoPanel');
    panel.innerHTML = '';
    createLogEntry(LOG_TYPES.SUCCESS, d.bestReady(target, bestVariantIndex + 1, variants.length));
    preparedCaseMode = 'best';
    updateCaseButtons();
}

// ─── Worst case ───────────────────────────────────────────────────────────────
async function prepareWorstCase(nextVariant) {
    if (nextVariant === undefined) nextVariant = false;
    // Variants differ by carry depth (k trailing ones); k=numBits is full worst case.
    resetCounter();
    const variants = getWorstVariants();
    if (nextVariant) {
        worstVariantIndex = (worstVariantIndex + 1) % variants.length;
    } else {
        worstVariantIndex = 0;
    }
    const k = variants[worstVariantIndex];

    for (let i = 0; i < numBits; i++) {
        bits[i] = i < k ? 1 : 0;
        coinsOnBit[i] = bits[i];
    }
    bank = 0;
    totalCoinsEarned = savedCoinsTotal();
    resetCounters();
    updateCoinCounter();
    updateStepCounter();
    updateInstructionCounter();
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

    // Prepared scenario is single-use by design.
    preparedCaseMode = null;
    updateCaseButtons();
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    refreshBitLengthUI();
    updateCaseButtons();
    updateStepCounter();
    updateInstructionCounter();
    renderBits();
});

