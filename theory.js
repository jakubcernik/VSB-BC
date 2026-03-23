let currentLang = localStorage.getItem('lang') || 'cz';

// ─── Dictionary ────────────────────────────────────────────────────────────────

const theoryDict = {
    en: {
        pageTitle:      'Amortized Complexity — Dynamic Array',
        footer:         '2026 by Jakub Cernik. Developed for educational purposes as a Bachelor Thesis.',
        navHome:        'Home',
        navSimulation:  'Simulation',
        navTheory:      'Theory',

        mainTitle: 'Amortized Complexity — Dynamic Array (vector<>)',

        // --- Section titles ---
        titleIntro:      '1. What is a Dynamic Array?',
        titlePushback:   '2. The push_back Operation',
        titleNaive:      '3. Why Naive Analysis Gives a Wrong Picture',
        titleAmortized:  '4. Amortized Analysis',
        titleGrowth:     '5. Growth Factor',
        titleSummary:    '6. Complexity Summary',

        // --- Intro ---
        introP1: 'A <strong>dynamic array</strong> (known in C++ as <code>std::vector&lt;&gt;</code>) is a contiguous block of memory whose capacity grows automatically as elements are added. Unlike a static array, you never need to know the final size in advance.',
        introP2: 'Internally, a dynamic array tracks three values: a pointer to the allocated memory, the current <em>size</em> (number of stored elements) and the current <em>capacity</em> (total allocated slots). When size reaches capacity, the array must be <strong>resized</strong>.',
        introBox: '💡 Rule of thumb: when capacity is exhausted, allocate a new block of <strong>α × capacity</strong> slots, copy all elements, then release the old block. Most implementations use α = 2 (doubling).',

        // --- push_back ---
        pushbackP1: 'The <code>push_back</code> operation appends a value to the end of the array. Its cost depends entirely on whether there is free capacity:',
        cardBestTitle:  'Best Case — O(1)',
        cardBestDesc:   'Free slot available. The new element is written directly into array[size] and size is incremented. No allocation or copying occurs.',
        cardWorstTitle: 'Worst Case — O(N)',
        cardWorstDesc:  'Array is full. A new larger block is allocated, all N existing elements are copied and finally the new element is inserted.',

        // --- Naive ---
        naiveP1: 'A naive approach would look at a single <code>push_back</code> call and note that it can cost O(N) due to copying. Multiplying by N insertions gives a bound of <strong>O(N²)</strong> for N operations — but this is a massive overestimate.',
        naiveP2: 'The key insight is that <strong>expensive resizes are rare</strong>. After doubling from capacity C to 2C, the next resize cannot happen for another C insertions. Amortized analysis captures this by spreading the cost of a resize over the operations that preceded it.',

        // --- Amortized ---
        amortizedP1: 'Amortized analysis gives a guaranteed average cost per operation over a sequence of operations, even if individual operations occasionally spike. Three classical methods are used:',

        tabAggregate:  'Aggregate Method',
        tabAccounting: 'Accounting Method',
        tabPotential:  'Potential Method',

        aggregateTitle: 'Aggregate Method',
        aggregateP1:    'We count the <em>total</em> work done by N push_back calls and divide by N.',
        aggregateMath:  'Resizes happen at sizes 1, 2, 4, 8, … and copy 1, 2, 4, 8, … elements respectively.',
        aggregateP2:    'Total copy work for N insertions:',
        aggregateMath2: 'Σ 2^k  (for 2^k ≤ N)  =  1 + 2 + 4 + … + N  <  2N',
        aggregateConclusion: 'Total cost = N (insertions) + 2N (copies) = 3N = <strong>O(N)</strong>. Dividing by N gives an amortized cost of <strong>O(1) per operation</strong>.',

        accountingTitle: 'Accounting Method',
        accountingP1:    'We charge each <code>push_back</code> a fixed amortized fee of <strong>3 coins</strong>. This is easiest to understand using a central <em>bank</em> (a reserve):',
        coinStep1: '<strong>3 coins</strong> are allocated at the start of every <code>push_back</code>.',
        coinStep2: '<strong>1 coin</strong> pays for the insertion itself (writing the new element).',
        coinStep3: '<strong>2 coins</strong> are deposited into the <strong>bank</strong> (saved for future resizes).',
        accountingMath: 'When a resize happens (capacity doubles from C to 2C), we must copy C elements. Each copy costs 1 coin and is paid from the bank. Between two resizes there are at least C successful push_back operations, so at least 2C coins are deposited — more than enough to pay the C copies.',
        accountingConclusion: 'Because every operation is charged a constant number of coins (3) and the bank never goes negative, <code>push_back</code> runs in amortized <strong>O(1)</strong>.',

        potentialTitle: 'Potential Method',
        potentialP1:    'Define a potential function Φ over the state of the data structure. Let <em>size</em> = number of elements, <em>capacity</em> = allocated slots:',
        potentialMath:  'Φ = 2 · size − capacity',
        potentialP2:    'The amortized cost â of an operation = actual cost c + ΔΦ.',
        potentialMath2: 'Normal push_back: â = 1 + (2·(s+1) − cap) − (2·s − cap) = 1 + 2 = 3 (upper bound)\nResize push_back (doubling): actual cost = N+1 (copy N + insert 1), ΔΦ = 2·(N+1) − 2N − (2N − N) = 2 − N\nâ = (N+1) + (2 − N) = 3',
        potentialConclusion: 'With this standard potential choice, â is bounded by a constant (here ≤ 3), so amortized <code>push_back</code> is <strong>O(1)</strong>. This matches the 3-coin accounting/bank story used in the simulation.',

        // --- Growth factor ---
        growthP1: 'The growth factor α determines how aggressively memory is pre-allocated. All factors α > 1 yield O(1) amortized push_back, but they differ in the trade-off between time and memory:',
        thFactor:   'Growth factor α',
        thAmortized:'Amortized cost',
        thMemory:   'Memory overhead',
        thExample:  'Used in',
        tdLow:      'Low (~33 %)',
        tdMedium:   'Medium (~100 %)',
        tdHigh:     'High (~200 %)',
        growthP2: 'This simulation uses <strong>α = 2</strong> (doubling) for clarity. In the Accounting Method shown above, we charge <strong>3 coins</strong> per insertion and store savings in a bank to pay for future copies during resizes.',

        // --- Complexity summary ---
        opPushback:       'push_back (amortized)',
        opPushbackBest:   'push_back (best)',
        opPushbackWorst:  'push_back (single worst)',
        notePushback:     'Amortized over N operations',
        notePushbackBest: 'Free capacity available',
        notePushbackWorst:'Resize: copy all N elements',
        legendAmortized: '* Amortized O(1) — the average cost per operation over any sequence of N push_back calls is O(1), even though individual calls can cost O(N).',

        // --- CTA ---
        ctaText:   'Ready to see the theory in action? Switch to the interactive simulation and watch coins being allocated and spent in real time.',
        ctaButton: '⚙️ Open Simulation',
    },

    cz: {
        pageTitle:      'Amortizovaná složitost — Dynamické pole',
        footer:         '2026 by Jakub Cernik. Vyvinuto pro vzdělávací účely jako bakalářská práce.',
        navHome:        'Domů',
        navSimulation:  'Simulace',
        navTheory:      'Teorie',

        mainTitle: 'Amortizovaná složitost — Dynamické pole (vector<>)',

        // --- Nadpisy sekcí ---
        titleIntro:      '1. Co je dynamické pole?',
        titlePushback:   '2. Operace push_back',
        titleNaive:      '3. Proč naivní analýza dává zkreslený výsledek',
        titleAmortized:  '4. Amortizovaná analýza',
        titleGrowth:     '5. Faktor růstu',
        titleSummary:    '6. Přehled složitostí',

        // --- Úvod ---
        introP1: '<strong>Dynamické pole</strong> (v C++ <code>std::vector&lt;&gt;</code>) je souvislý blok paměti, jehož kapacita se automaticky zvětšuje při přidávání prvků. Na rozdíl od statického pole nemusíte dopředu znát finální počet prvků.',
        introP2: 'Interně dynamické pole udržuje tři hodnoty: ukazatel na alokovanou paměť, aktuální <em>velikost</em> (počet uložených prvků) a aktuální <em>kapacitu</em> (celkový počet alokovaných míst). Jakmile velikost dosáhne kapacity, musí dojít ke <strong>zvětšení (resize)</strong>.',
        introBox: '💡 Základní pravidlo: při vyčerpání kapacity se alokuje nový blok o velikosti <strong>α × kapacita</strong>, všechny prvky se zkopírují a starý blok se uvolní. Většina implementací používá α = 2 (zdvojení).',

        // --- push_back ---
        pushbackP1: 'Operace <code>push_back</code> přidá hodnotu na konec pole. Její cena závisí výhradně na tom, zda je dostupná volná kapacita:',
        cardBestTitle:  'Nejlepší případ — O(1)',
        cardBestDesc:   'Je volné místo. Nový prvek se zapíše přímo na pozici array[size]. Žádná alokace ani kopírování neproběhne.',
        cardWorstTitle: 'Nejhorší případ — O(N)',
        cardWorstDesc:  'Pole je plné. Alokuje se nový větší blok, všech N stávajících prvků se zkopíruje a teprve poté se vloží nový prvek.',

        // --- Naivní ---
        naiveP1: 'Naivní přístup by se podíval na jedno volání <code>push_back</code> a zaznamenal, že může stát O(N) kvůli kopírování. Vynásobením N vloženími by vznikl odhad <strong>O(N²)</strong> pro N operací — to je ale obrovský nadodhad.',
        naiveP2: 'Klíčové pozorování je, že <strong>nákladné resize operace jsou vzácné</strong>. Po zdvojení kapacity z C na 2C nemůže dojít k dalšímu resize dříve než po C dalších vloženích. Amortizovaná analýza toto zachycuje rozložením ceny resize na operace, které mu předcházely.',

        // --- Amortizovaná ---
        amortizedP1: 'Amortizovaná analýza zaručuje průměrnou cenu operace v posloupnosti operací, i když jednotlivé operace občas skokově zdraží. Používají se tři klasické metody:',

        tabAggregate:  'Agregační metoda',
        tabAccounting: 'Účetní metoda',
        tabPotential:  'Potenciálová metoda',

        aggregateTitle: 'Agregační metoda',
        aggregateP1:    'Spočítáme <em>celkovou</em> práci N volání push_back a vydělíme N.',
        aggregateMath:  'Resize nastává při velikostech 1, 2, 4, 8, … a kopíruje 1, 2, 4, 8, … prvků.',
        aggregateP2:    'Celková práce kopírování pro N vložení:',
        aggregateMath2: 'Σ 2^k  (pro 2^k ≤ N)  =  1 + 2 + 4 + … + N  <  2N',
        aggregateConclusion: 'Celková cena = N (vložení) + 2N (kopírování) = 3N = <strong>O(N)</strong>. Dělením N dostaneme amortizovanou cenu <strong>O(1) na operaci</strong>.',

        accountingTitle: 'Účetní metoda',
        accountingP1:    'Každé <code>push_back</code> účtujeme pevným amortizovaným poplatkem <strong>3 mincí</strong>. Nejjednodušší je představit si centrální <em>banku</em> (rezervu):',
        coinStep1: '<strong>3 mince</strong> jsou přiděleny na začátku každého <code>push_back</code>.',
        coinStep2: '<strong>1 mince</strong> zaplatí samotné vložení (zápis nového prvku).',
        coinStep3: '<strong>2 mince</strong> se uloží do <strong>banky</strong> jako rezerva na budoucí resize.',
        accountingMath: 'Když nastane resize (kapacita se zdvojnásobí z C na 2C), musíme zkopírovat C prvků. Každá kopie stojí 1 minci a platí se z banky. Mezi dvěma resize proběhne alespoň C úspěšných vložení, takže se do banky uloží alespoň 2C mincí — to bohatě stačí na zaplacení C kopií.',
        accountingConclusion: 'Protože každá operace účtuje konstantní počet mincí (3) a banka nikdy nejde do minusu, amortizovaná cena je <strong>O(1) na push_back</strong>.',

        potentialTitle: 'Potenciálová metoda',
        potentialP1:    'Definujeme potenciálovou funkci Φ nad stavem datové struktury. Nechť <em>size</em> = počet prvků, <em>capacity</em> = alokovaná místa:',
        potentialMath:  'Φ = 2 · size − capacity',
        potentialP2:    'Amortizovaná cena â operace = skutečná cena c + ΔΦ.',
        potentialMath2: 'Normální push_back: â = 1 + (2·(s+1) − cap) − (2·s − cap) = 1 + 2 = 3 (horní odhad)\nResize push_back (zdvojení): skutečná cena = N+1 (kopie N + vložení 1), ΔΦ = 2·(N+1) − 2N − (2N − N) = 2 − N\nâ = (N+1) + (2 − N) = 3',
        potentialConclusion: 'S touto standardní volbou potenciálu je â omezeno konstantou (zde ≤ 3), takže amortizovaně vychází <code>push_back</code> jako <strong>O(1)</strong>. To odpovídá i 3-mincovému „bankovnímu“ příběhu použitému v simulaci.',

        // --- Faktor růstu ---
        growthP1: 'Faktor růstu α určuje, jak agresivně se předalokuje paměť. Všechny faktory α > 1 zajišťují O(1) amortizovaný push_back, ale liší se kompromisem mezi časem a pamětí:',
        thFactor:   'Faktor růstu α',
        thAmortized:'Amortizovaná cena',
        thMemory:   'Plýtvání pamětí',
        thExample:  'Použití',
        tdLow:      'Nízké (~33 %)',
        tdMedium:   'Střední (~100 %)',
        tdHigh:     'Vysoké (~200 %)',
        growthP2: 'Tato simulace používá <strong>α = 2</strong> (zdvojení) pro přehlednost. V účetní metodě výše účtujeme <strong>3 mince</strong> na vložení a ukládáme úspory do banky, která pak platí kopírování při resize.',

        // --- Přehled složitostí ---
        opPushback:       'push_back (amortizovaně)',
        opPushbackBest:   'push_back (nejlepší)',
        opPushbackWorst:  'push_back (nejhorší 1×)',
        notePushback:     'Amortizovaně přes N operací',
        notePushbackBest: 'Je volná kapacita',
        notePushbackWorst:'Resize: zkopírování všech N prvků',
        legendAmortized: '* Amortizované O(1) — průměrná cena operace přes libovolnou posloupnost N volání push_back je O(1), i když jednotlivá volání mohou stát O(N).',

        // --- CTA ---
        ctaText:   'Chcete vidět teorii v praxi? Přepněte se na interaktivní simulaci a sledujte přidělování a utrácení mincí v reálném čase.',
        ctaButton: '⚙️ Otevřít simulaci',
    }
};

// ─── Theme & Language helpers (mirrors ui.js) ─────────────────────────────────

function reloadWithTransition(beforeReload) {
    const overlay = document.getElementById('pageTransitionOverlay');
    overlay.classList.add('visible');
    setTimeout(() => {
        if (beforeReload) beforeReload();
        window.location.reload();
    }, 350);
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    reloadWithTransition(() => {
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
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
    reloadWithTransition(() => {
        localStorage.setItem('lang', next);
    });
}

function updateLangToggleUI() {
    document.getElementById('langOptCZ').classList.toggle('active', currentLang === 'cz');
    document.getElementById('langOptEN').classList.toggle('active', currentLang === 'en');
}

// ─── Navigation with transition ───────────────────────────────────────────────

function navigateTo(event, url) {
    event.preventDefault();
    const overlay = document.getElementById('pageTransitionOverlay');
    overlay.classList.add('visible');
    setTimeout(() => { window.location.href = url; }, 350);
}

// ─── Method tabs ──────────────────────────────────────────────────────────────

function showMethod(id) {
    document.querySelectorAll('.method-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.method-tab').forEach(el => el.classList.remove('active'));
    document.getElementById('method-' + id).classList.add('active');
    event.currentTarget.classList.add('active');
}

// ─── Apply language ───────────────────────────────────────────────────────────

function applyLanguage() {
    const d = theoryDict[currentLang];

    document.title                                        = d.pageTitle;
    document.getElementById('theoryMainTitle').innerHTML  = d.mainTitle;
    document.getElementById('footerText').textContent     = d.footer;
    document.getElementById('navHomeLabel').textContent   = d.navHome;
    document.getElementById('navSimLabel').textContent    = d.navSimulation;
    document.getElementById('navTheoryLabel').textContent = d.navTheory;

    // Section titles
    document.getElementById('titleIntro').textContent     = d.titleIntro;
    document.getElementById('titlePushback').textContent  = d.titlePushback;
    document.getElementById('titleNaive').textContent     = d.titleNaive;
    document.getElementById('titleAmortized').textContent = d.titleAmortized;
    document.getElementById('titleGrowth').textContent    = d.titleGrowth;
    document.getElementById('titleSummary').textContent   = d.titleSummary;

    // Intro
    document.getElementById('introP1').innerHTML = d.introP1;
    document.getElementById('introP2').innerHTML = d.introP2;
    document.getElementById('introBox').innerHTML = d.introBox;

    // push_back
    document.getElementById('pushbackP1').innerHTML     = d.pushbackP1;
    document.getElementById('cardBestTitle').textContent  = d.cardBestTitle;
    document.getElementById('cardBestDesc').textContent   = d.cardBestDesc;
    document.getElementById('cardWorstTitle').textContent = d.cardWorstTitle;
    document.getElementById('cardWorstDesc').textContent  = d.cardWorstDesc;

    // Naive
    document.getElementById('naiveP1').innerHTML = d.naiveP1;
    document.getElementById('naiveP2').innerHTML = d.naiveP2;

    // Amortized general
    document.getElementById('amortizedP1').textContent = d.amortizedP1;
    document.getElementById('tabAggregate').textContent  = d.tabAggregate;
    document.getElementById('tabAccounting').textContent = d.tabAccounting;
    document.getElementById('tabPotential').textContent  = d.tabPotential;

    // Aggregate
    document.getElementById('aggregateTitle').textContent      = d.aggregateTitle;
    document.getElementById('aggregateP1').textContent         = d.aggregateP1;
    document.getElementById('aggregateMath').textContent       = d.aggregateMath;
    document.getElementById('aggregateP2').textContent         = d.aggregateP2;
    document.getElementById('aggregateMath2').textContent      = d.aggregateMath2;
    document.getElementById('aggregateConclusion').innerHTML   = d.aggregateConclusion;

    // Accounting
    document.getElementById('accountingTitle').textContent     = d.accountingTitle;
    document.getElementById('accountingP1').innerHTML          = d.accountingP1;
    document.getElementById('coinStep1').innerHTML             = d.coinStep1;
    document.getElementById('coinStep2').innerHTML             = d.coinStep2;
    document.getElementById('coinStep3').innerHTML             = d.coinStep3;
    document.getElementById('accountingMath').textContent      = d.accountingMath;
    document.getElementById('accountingConclusion').innerHTML  = d.accountingConclusion;

    // Potential
    document.getElementById('potentialTitle').textContent      = d.potentialTitle;
    document.getElementById('potentialP1').innerHTML           = d.potentialP1;
    document.getElementById('potentialMath').textContent       = d.potentialMath;
    document.getElementById('potentialP2').textContent         = d.potentialP2;
    document.getElementById('potentialMath2').textContent      = d.potentialMath2;
    document.getElementById('potentialConclusion').innerHTML   = d.potentialConclusion;

    // Growth table
    document.getElementById('growthP1').innerHTML  = d.growthP1;
    document.getElementById('thFactor').textContent   = d.thFactor;
    document.getElementById('thAmortized').textContent = d.thAmortized;
    document.getElementById('thMemory').textContent    = d.thMemory;
    document.getElementById('thExample').textContent   = d.thExample;
    document.getElementById('tdLow').textContent    = d.tdLow;
    document.getElementById('tdMedium').textContent  = d.tdMedium;
    document.getElementById('tdHigh').textContent   = d.tdHigh;
    document.getElementById('growthP2').innerHTML   = d.growthP2;

    // Complexity grid (unified across algorithms: best / amortized / single worst)
    document.getElementById('opPushback').textContent        = d.opPushback;
    document.getElementById('opPushbackBest').textContent    = d.opPushbackBest;
    document.getElementById('opPushbackWorst').textContent   = d.opPushbackWorst;
    document.getElementById('notePushback').textContent      = d.notePushback;
    document.getElementById('notePushbackBest').textContent  = d.notePushbackBest;
    document.getElementById('notePushbackWorst').textContent = d.notePushbackWorst;
    document.getElementById('legendAmortized').innerHTML     = d.legendAmortized;

    // CTA
    document.getElementById('ctaText').textContent    = d.ctaText;
    document.getElementById('ctaButton').textContent  = d.ctaButton;

    updateLangToggleUI();
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    applyLanguage();
});

window.addEventListener('load', () => {
    document.body.classList.add('page-loaded');
});

