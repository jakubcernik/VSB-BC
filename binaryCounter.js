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
const NUM_BITS = 8;          // Display width (8-bit counter, value 0–255)
let bits        = new Array(NUM_BITS).fill(0);   // bits[0] = LSB
let coinsOnBit  = new Array(NUM_BITS).fill(0);   // saved coins per bit position (invariant: 1-bit ↔ 1 coin)
let bank        = 0;         // coins currently in the "operation bank" (transient during one increment)
let totalCoinsEarned = 0;    // total coins received across all increments (= steps × 2)
let isAnimating = false;

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
    for (let i = NUM_BITS - 1; i >= 0; i--) {
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
    if (valueBefore >= Math.pow(2, NUM_BITS) - 1) {
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
    while (pos < NUM_BITS && bits[pos] === 1) {
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
    if (pos < NUM_BITS) {
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
    bits             = new Array(NUM_BITS).fill(0);
    coinsOnBit       = new Array(NUM_BITS).fill(0);
    bank             = 0;
    totalCoinsEarned = 0;
    steps            = 0;

    updateCoinCounter();
    updateStepCounter();
    renderBits();

    const d = dict[currentLang];
    const panel = document.getElementById('infoPanel');
    panel.innerHTML = '';
    const init = document.createElement('div');
    init.classList.add('log-entry', 'info');
    init.innerHTML = `<div class="log-header"><span class="log-icon">👋</span><span>${d.steps} ${d.willAppear}</span></div>`;
    panel.appendChild(init);
}

// ─── Random mode ──────────────────────────────────────────────────────────────
async function generateRandom() {
    if (isAnimating) return;
    const d = dict[currentLang];
    const count = parseInt(document.getElementById('randomCount').value);
    if (isNaN(count) || count < 1) { updateInfoPanel(d.invalidInput); return; }

    resetCounter();
    createLogEntry(LOG_TYPES.INFO, d.randomGenerating(count));

    for (let i = 0; i < count; i++) {
        await increment();
        await sleep(getDelay(100));
        if (bitsToDecimal() >= Math.pow(2, NUM_BITS) - 1) break;
    }

    createLogEntry(LOG_TYPES.SUCCESS, d.randomDone(count));
}

// ─── Best Case ────────────────────────────────────────────────────────────────
async function prepareBestCase() {
    // Set counter to an even number (LSB = 0) → only 1 bit flip on next increment
    // Use value 6 = 0b00000110 (all small, LSB clear)
    resetCounter();
    const target = 6; // 0b00000110
    for (let i = 0; i < NUM_BITS; i++) {
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
    createLogEntry(LOG_TYPES.SUCCESS, d.bestReady(target));
}

// ─── Worst Case ───────────────────────────────────────────────────────────────
async function prepareWorstCase() {
    // Set all k=4 lower bits to 1 (value = 15 = 0b00001111)
    // Next increment will flip all 4 lower bits (carry propagates through all)
    resetCounter();
    const k = 4;
    for (let i = 0; i < NUM_BITS; i++) {
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
    createLogEntry(LOG_TYPES.WARNING, d.worstReady(k));
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    renderBits();
});

