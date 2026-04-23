/* binary-counter-theory.js – i18n & logic for binary-counter-theory.html */

let currentLang = localStorage.getItem('lang') || 'cz';

// ─── Dictionary ────────────────────────────────────────────────────────────────
const theoryDict = {
    en: {
        pageTitle:     'Amortized Complexity — Binary Counter',
        footer:        '2026 by Jakub Cernik. Developed for educational purposes as a Bachelor Thesis.',
        navHome:       'Home',
        navSimulation: 'Simulation',
        navTheory:     'Theory',

        mainTitle: 'Amortized Complexity — Binary Counter',

        // Section titles
        titleIntro:     '1. What is a Binary Counter?',
        titleIncrement: '2. The INCREMENT Operation',
        titleNaive:     '3. Why Naive Analysis Overestimates',
        titleAmortized: '4. Amortized Analysis',
        titleTable:     '5. Bit-Flip Frequency Table',
        titleSummary:   '6. Complexity Summary',

        // Intro
        introP1: 'A <strong>binary counter</strong> is a k-bit register that starts at 0 and supports a single operation: <code>INCREMENT</code>. Each call adds 1 to the stored value using binary addition with carry propagation. In the simulation, 8 bits are used by default for clarity, but k can be changed.',
        introP2: 'The register is stored as an array <code>A[0..k−1]</code> where <code>A[0]</code> is the least-significant bit (LSB). Incrementing is done by scanning from the LSB, flipping <code>1→0</code> until a <code>0</code> is found, then flipping that <code>0→1</code>.',
        introBox: '💡 Key insight: each INCREMENT flips <em>at least</em> 1 bit (the 0→1 flip) and <em>at most</em> k bits (when all bits are 1). The worst case depends on the chosen bit length k and is rare — that is what amortized analysis captures.',

        // INCREMENT
        incrementP1: 'The cost of one INCREMENT call equals the <strong>number of bits flipped</strong>. This depends on how many trailing 1-bits the counter currently has. In the simulation, Best/Worst tabs provide multiple prepared variants to compare these patterns:',
        cardBestTitle: 'Best Case — O(1)',
        cardBestDesc:  'LSB is 0. Only bit 0 is flipped (0→1). Cost = 1 bit flip.',
        cardWorstTitle:'Worst Case — O(k)',
        cardWorstDesc: 'All k bits are 1 (counter = 2^k − 1). Every bit is flipped. Cost = k bit flips. This happens once per 2^k increments for the selected bit length.',

        // Naive
        naiveP1: 'A naive analysis looks at the worst-case cost of a single INCREMENT: <strong>O(k)</strong>. Multiplied by N operations this gives <strong>O(Nk)</strong> — but this assumes every increment flips all k bits, which is impossible.',
        naiveP2: 'In reality, bit 0 flips every increment, bit 1 every 2nd, bit 2 every 4th, etc. The high-cost cases become exponentially rarer. Amortized analysis accounts for this.',

        // Amortized
        amortizedP1: 'Three classical methods all confirm the amortized cost is O(1) per INCREMENT:',

        tabAggregate:  'Aggregate Method',
        tabAccounting: 'Accounting Method',
        tabPotential:  'Potential Method',

        aggregateTitle: 'Aggregate Method',
        aggregateP1:    'Count the total number of bit flips for N increments by summing per-bit flip counts.',
        aggregateMath:  'Bit i flips exactly ⌊N / 2^i⌋ times in N increments.',
        aggregateP2:    'Total flips:',
        aggregateMath2: 'Σ_{i=0}^{k−1} ⌊N/2^i⌋  ≤  N · Σ_{i=0}^{∞} 1/2^i  =  N · 2  =  2N',
        aggregateConclusion: 'Total cost is <strong>at most 2N</strong> bit flips for N increments (i.e., total cost ≤ 2N). Dividing by N gives amortized cost <strong>at most 2 = O(1) per INCREMENT</strong>.',

        accountingTitle: 'Accounting Method',
        accountingP1:    'Each INCREMENT is charged a fixed amortized fee of <strong>2 coins</strong>. They are used as follows:',
        coinStep1: '<strong>2 coins</strong> are allocated as the amortized charge for this increment.',
        coinStep2: '<strong>1 coin</strong> pays for one instruction that changes a bit value (the 0→1 flip).',
        coinStep3: '<strong>1 coin</strong> is set aside on the newly set bit as a reserve for its future 1→0 carry flip.',
        coinStep4: 'Each carry flip (1→0) is paid by the <strong>1 stored coin</strong> already placed on that bit — no extra charge needed.',
        accountingMath:  'Every 1-bit carries exactly 1 stored coin reserve. When carry flips it to 0, that coin pays for the flip. No deficit ever occurs.',
        accountingConclusion: 'Since every INCREMENT is charged at most 2 coins and no operation borrows from the future, the amortized cost is <strong>O(1) per INCREMENT</strong>.',

        potentialTitle: 'Potential Method',
        potentialP1:    'Define the potential Φ as the number of 1-bits currently set in the counter:',
        potentialMath:  'Φ = number of 1-bits in the counter  (always ≥ 0)',
        potentialP2:    'Let t be the number of consecutive 1-bits from the least-significant bit before INCREMENT (these are the bits flipped 1→0). The actual cost is t + 1 (flip t ones to zero, then flip one zero to one). ΔΦ is 1 − t (one new 1-bit, t 1-bits removed). Amortized cost:',
        potentialMath2: 'â = (t + 1) + (1 − t) = 2',
        potentialConclusion: 'In every case â = 2 = <strong>O(1)</strong>. The potential method confirms the amortized cost is constant regardless of the number of carry propagations.',

        // Bit-flip table
        tableP1: 'The table below shows how often each bit position is flipped during N increments:',
        thBit:     'Bit position',
        thWeight:  'Weight',
        thFreq:    'Flips per N increments',
        thContrib: 'Total flips',
        tdFreq0:    'N',
        tdContrib0: 'N',
        tdFreq1:    '⌊N/2⌋',
        tdContrib1: '≤ N/2',
        tdFreq2:    '⌊N/4⌋',
        tdContrib2: '≤ N/4',
        tdBitK:     'bit i',
        tdWeightK:  '2^i',
        tdFreqK:    '⌊N/2^i⌋',
        tdContribK: '≤ N/2^i',
        tableP2: 'Summing the geometric series: N + N/2 + N/4 + … < 2N. Therefore the average cost per increment is <strong>< 2, and in particular O(1)</strong>.',

        // Complexity summary (unified: best / amortized / single worst)
        opIncrement:      'INCREMENT (amortized)',
        opIncrementBest:  'INCREMENT (best)',
        opIncrementWorst: 'INCREMENT (single worst)',
        noteIncrement:      'Amortized over N operations',
        noteIncrementBest:  'LSB is 0 → 1 bit flip',
        noteIncrementWorst: 'When all k bits are 1 for the selected length — extremely rare',
        legendAmortized: '* Amortized O(1) — the average cost per INCREMENT over any N operations is O(1), even though individual calls can cost O(k). In the simulation you can vary k; the default k=8 is for readability.',

        // CTA
        ctaText:   'Ready to see carry propagation and coin accounting in action? Open the interactive simulation.',
        ctaButton: '⚙️ Open Simulation',
    },

    cz: {
        pageTitle:     'Amortizovaná složitost — Binární čítač',
        footer:        '2026 by Jakub Cernik. Vyvinuto pro vzdělávací účely jako bakalářská práce.',
        navHome:       'Domů',
        navSimulation: 'Simulace',
        navTheory:     'Teorie',

        mainTitle: 'Amortizovaná složitost — Binární čítač',

        // Nadpisy sekcí
        titleIntro:     '1. Co je binární čítač?',
        titleIncrement: '2. Operace INCREMENT',
        titleNaive:     '3. Proč naivní analýza nadhodnocuje',
        titleAmortized: '4. Amortizovaná analýza',
        titleTable:     '5. Tabulka frekvencí přepínání bitů',
        titleSummary:   '6. Přehled složitostí',

        // Úvod
        introP1: '<strong>Binární čítač</strong> je k-bitový registr, který začíná na 0 a podporuje jedinou operaci: <code>INCREMENT</code>. Každé volání přičte 1 k uložené hodnotě pomocí binárního sčítání s přenosem. V simulaci je kvůli názornosti výchozí délka 8 bitů, ale hodnotu k lze měnit.',
        introP2: 'Registr je uložen jako pole <code>A[0..k−1]</code>, kde <code>A[0]</code> je nejméně významný bit (LSB). Inkrementování probíhá od LSB: přepínáme <code>1→0</code>, dokud nenarazíme na <code>0</code>, tu pak přepneme <code>0→1</code>.',
        introBox: '💡 Klíčové pozorování: každý INCREMENT přepne <em>nejméně</em> 1 bit (přepnutí 0→1) a <em>nejvýše</em> k bitů (jsou-li všechny bity 1). Nejhorší případ závisí na zvolené délce k a je vzácný — to zachycuje amortizovaná analýza.',

        // INCREMENT
        incrementP1: 'Cena jednoho volání INCREMENT se rovná <strong>počtu přepnutých bitů</strong>. Závisí na tom, kolik koncových jedniček čítač právě obsahuje. V simulaci proto najdete u záložek Best/Worst více připravených variant pro porovnání:',
        cardBestTitle: 'Nejlepší případ — O(1)',
        cardBestDesc:  'LSB je 0. Přepne se pouze bit 0 (0→1). Cena = 1 přepnutí.',
        cardWorstTitle:'Nejhorší případ — O(k)',
        cardWorstDesc: 'Všech k bitů je 1 (čítač = 2^k − 1). Přepnou se všechny bity. Cena = k přepnutí. Pro zvolenou délku registru nastane jednou za 2^k inkrementací.',

        // Naivní
        naiveP1: 'Naivní analýza by se podívala na nejhorší cenu jednoho INCREMENT: <strong>O(k)</strong>. Vynásobením N operacemi by dostala <strong>O(Nk)</strong> — to ale předpokládá, že každé inkrementování přepíná všech k bitů, což není možné.',
        naiveP2: 'Ve skutečnosti se bit 0 přepíná při každém inkrementování, bit 1 každý druhý, bit 2 každý čtvrtý atd. Drahé případy jsou exponenciálně vzácnější. Amortizovaná analýza to zohledňuje.',

        // Amortizovaná
        amortizedP1: 'Tři klasické metody potvrzují, že amortizovaná cena je O(1) na INCREMENT:',

        tabAggregate:  'Agregační metoda',
        tabAccounting: 'Účetní metoda',
        tabPotential:  'Potenciálová metoda',

        aggregateTitle: 'Agregační metoda',
        aggregateP1:    'Spočítáme celkový počet přepnutí bitů pro N inkrementací sečtením počtů přepnutí pro každou bitovou pozici.',
        aggregateMath:  'Bit i se přepne přesně ⌊N / 2^i⌋-krát při N inkrementacích.',
        aggregateP2:    'Celkový počet přepnutí:',
        aggregateMath2: 'Σ_{i=0}^{k−1} ⌊N/2^i⌋  ≤  N · Σ_{i=0}^{∞} 1/2^i  =  N · 2  =  2N',
        aggregateConclusion: 'Celková cena je <strong>nejvýše 2N</strong> přepnutí bitů pro N inkrementací (tj. celková cena ≤ 2N). Po vydělení N vychází amortizovaná cena <strong>nejvýše 2 = O(1) na INCREMENT</strong>.',

        accountingTitle: 'Účetní metoda',
        accountingP1:    'Každé INCREMENT je účtováno pevným amortizovaným poplatkem <strong>2 mince</strong>. Jsou použity takto:',
        coinStep1: '<strong>2 mince</strong> jsou přiděleny jako amortizovaný poplatek za tuto inkrementaci.',
        coinStep2: '<strong>1 mince</strong> zaplatí provedení jedné instrukce, která změní hodnotu bitu (přepnutí 0→1).',
        coinStep3: '<strong>1 mince</strong> z dotace aktuální operace se odloží k nově nastavenému bitu jako rezerva na jeho budoucí přepnutí 1→0 přenosem.',
        coinStep4: 'Každé přepnutí přenosem (1→0) je zaplaceno <strong>1 uloženou mincí</strong> přiřazenou k danému bitu — žádný další poplatek není potřeba.',
        accountingMath:  'Každý bit 1 nese přesně 1 uloženou minci jako rezervu. Když přenos přepne bit na 0, tato mince za přepnutí zaplatí. Nikdy nedojde k deficitu.',
        accountingConclusion: 'Protože každé INCREMENT platí nejvýše 2 mince a žádná operace si nepůjčuje od budoucích, amortizovaná cena je <strong>O(1) na INCREMENT</strong>.',

        potentialTitle: 'Potenciálová metoda',
        potentialP1:    'Definujeme potenciál Φ jako počet bitů nastavených na 1 v čítači:',
        potentialMath:  'Φ = počet bitů 1 v čítači  (vždy ≥ 0)',
        potentialP2:    'Nechť t je počet po sobě jdoucích bitů 1 od nejméně významného bitu před operací INCREMENT (to jsou bity přepnuté 1→0). Skutečná cena je t + 1 (přepiš t jedniček na nulu, pak jednu nulu na jedničku). ΔΦ je 1 − t (jeden nový bit 1, t bitů 1 odstraněno). Amortizovaná cena:',
        potentialMath2: 'â = (t + 1) + (1 − t) = 2',
        potentialConclusion: 'V každém případě â = 2 = <strong>O(1)</strong>. Potenciálová metoda potvrzuje, že amortizovaná cena je konstantní bez ohledu na délku přenosu.',

        // Tabulka
        tableP1: 'Níže je tabulka, která ukazuje, jak často se každá bitová pozice přepíná při N inkrementacích:',
        thBit:     'Bitová pozice',
        thWeight:  'Váha',
        thFreq:    'Přepnutí za N inkrementací',
        thContrib: 'Celkem přepnutí',
        tdFreq0:    'N',
        tdContrib0: 'N',
        tdFreq1:    '⌊N/2⌋',
        tdContrib1: '≤ N/2',
        tdFreq2:    '⌊N/4⌋',
        tdContrib2: '≤ N/4',
        tdBitK:     'bit i',
        tdWeightK:  '2^i',
        tdFreqK:    '⌊N/2^i⌋',
        tdContribK: '≤ N/2^i',
        tableP2: 'Součet geometrické řady: N + N/2 + N/4 + … < 2N. Z toho plyne, že průměrná cena jedné inkrementace je <strong>< 2, a tedy O(1)</strong>.',

        // Přehled složitostí (sjednoceno: nejlepší / amortizovaně / nejhorší 1×)
        opIncrement:      'INCREMENT (amortizovaně)',
        opIncrementBest:  'INCREMENT (nejlepší)',
        opIncrementWorst: 'INCREMENT (nejhorší 1×)',
        noteIncrement:      'Amortizovaně přes N operací',
        noteIncrementBest:  'LSB je 0 → 1 přepnutí',
        noteIncrementWorst: 'Když je všech k bitů 1 pro zvolenou délku — extrémně vzácné',
        legendAmortized: '* Amortizované O(1) — průměrná cena INCREMENT přes libovolných N operací je O(1), i když jednotlivá volání mohou stát O(k). V simulaci lze měnit k; výchozí k=8 je kvůli přehlednosti.',

        // CTA
        ctaText:   'Chcete vidět šíření přenosu a účetní metodu v akci? Otevřete interaktivní simulaci.',
        ctaButton: '⚙️ Otevřít simulaci',
    }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function reloadWithTransition(beforeReload) {
    const ov = document.getElementById('pageTransitionOverlay');
    ov.classList.add('visible');
    setTimeout(function() {
        if (beforeReload) beforeReload();
        window.location.reload();
    }, 350);
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    reloadWithTransition(function() {
        if (isDark) {
            localStorage.setItem('theme', 'light');
        } else {
            localStorage.setItem('theme', 'dark');
        }
    });
}

function applyTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    if (saved === 'dark') document.body.classList.add('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    document.getElementById('themeOptLight').classList.toggle('active', !isDark);
    document.getElementById('themeOptDark').classList.toggle('active', isDark);
}

function toggleLanguage() {
    const next = currentLang === 'cz' ? 'en' : 'cz';
    reloadWithTransition(function() {
        localStorage.setItem('lang', next);
    });
}

function updateLangToggleUI() {
    document.getElementById('langOptCZ').classList.toggle('active', currentLang === 'cz');
    document.getElementById('langOptEN').classList.toggle('active', currentLang === 'en');
}

function navigateTo(event, url) {
    event.preventDefault();
    const ov = document.getElementById('pageTransitionOverlay');
    ov.classList.add('visible');
    setTimeout(function() { window.location.href = url; }, 350);
}

function showMethod(id) {
    var methodContents = document.querySelectorAll('.method-content');
    for (var i = 0; i < methodContents.length; i++) {
        methodContents[i].classList.remove('active');
    }
    var methodTabs = document.querySelectorAll('.method-tab');
    for (var i = 0; i < methodTabs.length; i++) {
        methodTabs[i].classList.remove('active');
    }
    document.getElementById('method-' + id).classList.add('active');
    event.currentTarget.classList.add('active');
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function setHtml(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}

// ─── Apply language ────────────────────────────────────────────────────────────
function applyLanguage() {
    const d = theoryDict[currentLang];

    document.title = d.pageTitle;
    setHtml('theoryMainTitle', d.mainTitle);
    setText('footerText', d.footer);
    setText('navHomeLabel', d.navHome);
    setText('navSimLabel', d.navSimulation);
    setText('navTheoryLabel', d.navTheory);

    // Section titles
    setText('titleIntro', d.titleIntro);
    setText('titleIncrement', d.titleIncrement);
    setText('titleNaive', d.titleNaive);
    setText('titleAmortized', d.titleAmortized);
    setText('titleTable', d.titleTable);
    setText('titleSummary', d.titleSummary);

    // Intro
    setHtml('introP1', d.introP1);
    setHtml('introP2', d.introP2);
    setHtml('introBox', d.introBox);

    // INCREMENT
    setHtml('incrementP1', d.incrementP1);
    setText('cardBestTitle', d.cardBestTitle);
    setText('cardBestDesc', d.cardBestDesc);
    setText('cardWorstTitle', d.cardWorstTitle);
    setText('cardWorstDesc', d.cardWorstDesc);

    // Naive
    setHtml('naiveP1', d.naiveP1);
    setHtml('naiveP2', d.naiveP2);

    // Amortized
    setText('amortizedP1', d.amortizedP1);
    setText('tabAggregate', d.tabAggregate);
    setText('tabAccounting', d.tabAccounting);
    setText('tabPotential', d.tabPotential);

    // Aggregate
    setText('aggregateTitle', d.aggregateTitle);
    setText('aggregateP1', d.aggregateP1);
    setText('aggregateMath', d.aggregateMath);
    setText('aggregateP2', d.aggregateP2);
    setText('aggregateMath2', d.aggregateMath2);
    setHtml('aggregateConclusion', d.aggregateConclusion);

    // Accounting
    setText('accountingTitle', d.accountingTitle);
    setHtml('accountingP1', d.accountingP1);
    setHtml('coinStep1', d.coinStep1);
    setHtml('coinStep2', d.coinStep2);
    setHtml('coinStep3', d.coinStep3);
    setHtml('coinStep4', d.coinStep4);
    setText('accountingMath', d.accountingMath);
    setHtml('accountingConclusion', d.accountingConclusion);

    // Potential
    setText('potentialTitle', d.potentialTitle);
    setHtml('potentialP1', d.potentialP1);
    setText('potentialMath', d.potentialMath);
    setHtml('potentialP2', d.potentialP2);
    setText('potentialMath2', d.potentialMath2);
    setHtml('potentialConclusion', d.potentialConclusion);

    // Table
    setHtml('tableP1', d.tableP1);
    setText('thBit', d.thBit);
    setText('thWeight', d.thWeight);
    setText('thFreq', d.thFreq);
    setText('thContrib', d.thContrib);
    setText('tdFreq0', d.tdFreq0);
    setText('tdContrib0', d.tdContrib0);
    setText('tdFreq1', d.tdFreq1);
    setText('tdContrib1', d.tdContrib1);
    setText('tdFreq2', d.tdFreq2);
    setText('tdContrib2', d.tdContrib2);
    setText('tdBitK', d.tdBitK);
    setText('tdWeightK', d.tdWeightK);
    setText('tdFreqK', d.tdFreqK);
    setText('tdContribK', d.tdContribK);
    setHtml('tableP2', d.tableP2);

    // Summary
    setText('opIncrement', d.opIncrement);
    setText('opIncrementBest', d.opIncrementBest);
    setText('opIncrementWorst', d.opIncrementWorst);
    setText('noteIncrement', d.noteIncrement);
    setText('noteIncrementBest', d.noteIncrementBest);
    setText('noteIncrementWorst', d.noteIncrementWorst);
    setHtml('legendAmortized', d.legendAmortized);

    // CTA
    setText('ctaText', d.ctaText);
    setText('ctaButton', d.ctaButton);

    updateLangToggleUI();
}

// ─── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    applyTheme();
    applyLanguage();
});

window.addEventListener('load', function() {
    document.body.classList.add('page-loaded');
});

