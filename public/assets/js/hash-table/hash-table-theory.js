/* hash-table-theory.js – i18n & logic for hash-table-theory.html */

let currentLang = localStorage.getItem('lang') || 'cz';

const theoryDict = {
    en: {
        pageTitle:     'Amortized Complexity — Hash Table',
        footer:        '2026 by Jakub Cernik. Developed for educational purposes as a Bachelor Thesis.',
        navHome:       'Home',
        navSimulation: 'Simulation',
        navTheory:     'Theory',

        mainTitle:      'Amortized Complexity — Hash Table',

        titleIntro:     '1. What is a Hash Table?',
        titleInsert:    '2. INSERT with Open Addressing',
        titleResize:    '3. Resizing and Rehashing',
        titleAmortized: '4. Amortized Analysis',
        titleSummary:   '5. Complexity Summary',

        introP1: 'A <strong>hash table</strong> stores pairs <code>(key → value)</code> and supports fast insertion and lookup. Internally it uses an array of <em>slots</em> and a hash function <code>h(key)</code> that maps keys to indices.',
        introP2: 'In an implementation with <strong>open addressing</strong>, every element is stored directly inside the array. If the target slot is already taken, the table probes other slots (for example <em>linear probing</em>): check the next slot, then the next… until an empty slot is found.',
        introBox: '💡 Important parameter: the <em>load factor</em> α = size / capacity. To keep operations fast, the table is resized (capacity doubled) once α exceeds a chosen threshold (e.g. 0.75).',

        insertP1: 'The operation <code>INSERT(key, value)</code> computes an index and may need probing due to collisions. In this thesis, the <strong>single-operation worst case</strong> is defined as the moment when insert triggers <strong>resize + rehash</strong>, because many stored elements must be moved.',
        insertP2: 'If probing finds an existing key, the table performs <strong>UPDATE</strong>: it replaces only the value and does <strong>not</strong> increase <code>size</code>. The write itself is O(1); extra cost can come from probing before the key is found.',
        cardBestTitle:  'Best Case — O(1)',
        cardBestDesc:   'The hashed slot is empty. We write the pair into the slot and finish immediately.',
        cardWorstTitle: 'Worst Case — O(n)',
        cardWorstDesc:  'Primary single-operation worst case: insert triggers resize, so we must rehash and move Θ(n) stored elements.',

        resizeP1: 'When the table becomes too full (α > threshold), we allocate a new array of double capacity and re-insert all existing elements into the new table. This is called <strong>rehashing</strong>.',
        resizeP2: 'In open addressing, rehashing is not a simple “copy the array”. The target index is computed as <code>h(key) mod capacity</code>. When the capacity changes, the modulo changes — so many keys get a different start slot. Therefore, we must take each stored element and <strong>INSERT it again</strong> into the new array (including probing on collisions).',
        resizeBox: 'Why is rehash Θ(n)? We must scan the old table and move each of the n stored elements at least once. With a constant load-factor threshold (e.g. 0.75), the expected number of probes per moved element stays small, so the total rehash work grows proportionally to n.',

        hashFuncTitle: 'Hash function used in this simulation',
        hashFuncP1: 'To keep the simulation easy to follow, keys are integers and the hash is intentionally simple: <code>hashKey(k) = (k >>> 0)</code> (conversion to an unsigned 32-bit integer).',
        hashFuncP2: 'The start slot is then computed as <code>startIndex = hashKey(k) mod capacity</code>. If the start slot is occupied by a different key, we use <strong>linear probing</strong>: check the next slot, then the next, wrapping around.',
        hashFuncBox: 'Note: real hash tables use much stronger hashing (bit mixing) especially for non-integer keys (strings, objects). Here the goal is to clearly show the role of <code>mod capacity</code>, collisions and probing, and why a resize requires a rehash.',

        amortizedP1: 'All three classical amortized-analysis methods show that repeated INSERT with occasional resize runs in amortized O(1).',
        amortizedP2: 'In the simulation, we separate <strong>operations</strong> (one user INSERT/UPDATE request) from <strong>instructions</strong> (atomic internal work: probe check, write/update, move during rehash). Think about INSERT in two layers: (1) rare expensive spikes from <strong>resize/rehash</strong> (paid by amortization), and (2) probing length during normal inserts (explained by expected average-case behavior with good hashing and bounded load factor).',

        tabAggregate:  'Aggregate Method',
        tabAccounting: 'Accounting Method',
        tabPotential:  'Potential Method',

        aggregateTitle: 'Aggregate Method',
        aggregateP1:    'Assume capacities double: 8, 16, 32, … A resize at capacity m moves Θ(m) elements. Over N inserts, total moved elements form a geometric series.',
        aggregateMath:  'Total rehash work ≤ 8 + 16 + 32 + … + N < 2N',
        aggregateP2:    'Plus each insert writes its own element once.',
        aggregateMath2:  'Total work ≤ (rehash moves) + (N writes) < 2N + N = 3N',
        aggregateConclusion: 'Total cost is O(N), so amortized cost per INSERT is O(1).',

        accountingTitle: 'Accounting Method',
        accountingP1:    'Charge each INSERT a fixed fee of 2 coins. Spend and save coins so that future rehashes are always paid without going into debt:',
        coinStep1: '<strong>2 coins</strong> are received at the start of every INSERT (fixed amortized charge).',
        coinStep2: '<strong>1 coin</strong> pays for placing the new element into the table (the write).',
        coinStep3: '<strong>1 coin</strong> is saved <em>on that element</em> to pay for moving it during a future rehash.',
        coinStep4: 'Important: coins here pay mainly for <strong>future rehash moves</strong>. They do not claim that every possible probing sequence is cheap. Probing is analyzed separately in expectation: with good hashing and bounded load, most inserts need only a few probes.',
        accountingMath: 'When resize happens, each of the n stored elements spends its saved coin to pay for exactly one move into the new table. Therefore the rehash cost is fully paid by saved coins.',
        accountingConclusion: 'Since each INSERT is charged a constant number of coins and we never borrow from the future, INSERT runs in amortized O(1). A single INSERT can still cost O(n) when it triggers resize + rehash.',

        potentialTitle: 'Potential Method',
        potentialP1:    'Define a potential Φ that depends on both the number of elements and capacity (not only on size). A convenient linear choice is:',
        potentialMath:  'Φ = 3 · size − capacity   (optionally shifted/clipped to keep Φ ≥ 0)',
        potentialP2:    'As the table approaches the resize threshold, Φ grows. When resize doubles capacity, Φ drops by Θ(n), and this drop pays for the Θ(n) rehash work. Therefore amortized INSERT remains O(1).',
        potentialMath2:  'â = actual + ΔΦ = O(1)',
        potentialConclusion: 'Potential method confirms the same result: even with occasional expensive resize, amortized cost per INSERT is constant.',

        // Complexity summary (unified: best / amortized / single worst)
        opInsert: 'INSERT (amortized)',
        opInsertBest: 'INSERT (best)',
        opInsertWorst: 'INSERT (single worst)',

        noteInsert: 'Across any sequence of inserts (doubling strategy, constant load threshold): amortization explains why rare resize/rehash spikes average out. Probing uses a different idea - expected average-case under good hashing.',
        noteInsertBest: 'Hashed slot is empty.',
        noteInsertWorst: 'Rare: insert crosses the load threshold and triggers resize + rehash (single operation O(n)).',

        legendAmortized: '* Amortized O(1) means: if we do many INSERTs, the occasional expensive resize/rehash gets spread over many cheap inserts, so the average stays constant. One INSERT can still be Θ(n). Probing is discussed separately as an expected average-case property (good hashing + bounded load).',

        ctaText: 'Ready to see probing, resizing, and coin accounting in action? Open the interactive simulation.',
        ctaButton: '⚙️ Open Simulation',
    },

    cz: {
        pageTitle:     'Amortizovaná složitost — Hash tabulka',
        footer:        '2026 by Jakub Cernik. Vyvinuto pro vzdělávací účely jako bakalářská práce.',
        navHome:       'Domů',
        navSimulation: 'Simulace',
        navTheory:     'Teorie',

        mainTitle:      'Amortizovaná složitost — Hash tabulka',

        titleIntro:     '1. Co je hash tabulka?',
        titleInsert:    '2. INSERT s otevřeným adresováním',
        titleResize:    '3. Resize a rehash',
        titleAmortized: '4. Amortizovaná analýza',
        titleSummary:   '5. Přehled složitostí',

        introP1: 'Hash tabulka ukládá dvojice <code>(klíč → hodnota)</code> a typicky umožňuje rychlé vkládání i vyhledávání. Uvnitř používá pole <em>slotů</em> a hashovací funkci <code>h(klíč)</code>, která mapuje klíče na indexy.',
        introP2: 'V implementaci s <strong>otevřeným adresováním</strong> se každý prvek ukládá přímo do pole. Pokud je cílový slot obsazený, tabulka zkouší další sloty (např. <em>lineární prohledávání</em>): další, další… dokud nenajde prázdný.',
        introBox: '💡 Důležitý parametr: <em>load factor</em> α = velikost / kapacita. Aby operace zůstaly rychlé, tabulka se zvětší (kapacita se zdvojnásobí), když α překročí zvolený limit (např. 0.75).',

        insertP1: 'Operace <code>INSERT(klíč, hodnota)</code> spočítá index a při kolizích může provádět probing. V této práci je <strong>nejhorší případ jedné operace</strong> postaven na situaci, kdy vložení vyvolá <strong>resize + rehash</strong>, protože je nutné přesunout mnoho uložených prvků.',
        insertP2: 'Pokud probing narazí na už existující klíč, provede se <strong>UPDATE</strong>: přepíše se pouze hodnota a <code>size</code> se <strong>nezvětší</strong>. Samotný přepis je O(1); dodatečná cena může vzniknout probingem, než se klíč najde.',
        cardBestTitle:  'Nejlepší případ — O(1)',
        cardBestDesc:   'Slot určený hashem je prázdný. Zapíšeme dvojici do slotu a končíme.',
        cardWorstTitle: 'Nejhorší případ — O(n)',
        cardWorstDesc:  'Hlavní nejhorší případ jedné operace: vložení vyvolá resize, takže je potřeba přehashovat a přesunout Θ(n) uložených prvků.',

        resizeP1: 'Když je tabulka příliš plná (α > limit), alokujeme nové pole s dvojnásobnou kapacitou a znovu vložíme všechny existující prvky do nové tabulky. Tomu se říká <strong>rehash</strong>.',
        resizeP2: 'U otevřeného adresování není rehash jen „zkopírování pole“. Index se počítá jako <code>h(klíč) mod kapacita</code>. Když se kapacita změní, změní se i modulo — a mnoho klíčů tak dostane jiný startovní slot. Proto se musí každý uložený prvek <strong>znovu vložit</strong> do nové tabulky (včetně probingu při kolizích).',
        resizeBox: 'Proč je rehash Θ(n)? Musíme projít starou tabulku a každý z n uložených prvků minimálně jednou přesunout. Při konstantním limitu zaplnění (např. 0.75) je očekávaný počet probe kroků na jeden přesun malý, takže celková práce rehashe roste úměrně k n.',

        hashFuncTitle: 'Hashovací funkce použitá v této simulaci',
        hashFuncP1: 'Aby byla simulace dobře „počitatelná v hlavě“, klíče jsou celočíselné a hash je záměrně jednoduchý: <code>hashKey(k) = (k >>> 0)</code> (převod na nezáporné 32bit číslo).',
        hashFuncP2: 'Startovní index se počítá jako <code>startIndex = hashKey(k) mod kapacita</code>. Pokud je startovní slot obsazen jiným klíčem, používá se <strong>lineární probing</strong>: kontrolujeme další slot, pak další, dokola.',
        hashFuncBox: 'Poznámka: reálné hash tabulky používají pro „zamíchání“ bitů výrazně silnější hash (zejména pro stringy/objekty). Zde je cílem jasně ukázat roli <code>mod kapacita</code>, kolize a probing, a proč resize nutně znamená rehash.',

        amortizedP1: 'Všechny tři klasické metody amortizované analýzy ukazují, že opakované INSERT s občasným resize běží v amortizovaném O(1).',
        amortizedP2: 'V simulaci rozlišujeme <strong>operace</strong> (jeden uživatelský požadavek INSERT/UPDATE) a <strong>instrukce</strong> (atomická interní práce: kontrola slotu při probingu, zápis/UPDATE, přesun prvku při rehashi). INSERT je užitečné chápat ve dvou vrstvách: (1) vzácné drahé skoky kvůli <strong>resize/rehashi</strong> (to řeší amortizace) a (2) délka probingu u běžných vložení (to vysvětluje očekávaný průměrný případ při dobrém hashování a omezeném zaplnění).',

        tabAggregate:  'Agregační metoda',
        tabAccounting: 'Účetní metoda',
        tabPotential:  'Potenciálová metoda',

        aggregateTitle: 'Agregační metoda',
        aggregateP1:    'Předpokládejme zdvojnásobování kapacity: 8, 16, 32, … Resize při kapacitě m přesune Θ(m) prvků. Pro N vložení vznikne geometrická řada.',
        aggregateMath:  'Celková práce rehash ≤ 8 + 16 + 32 + … + N < 2N',
        aggregateP2:    'Navíc každé vložení zapíše svůj prvek jednou.',
        aggregateMath2:  'Celková práce ≤ (rehash přesuny) + (N zápisů) < 2N + N = 3N',
        aggregateConclusion: 'Celková cena je O(N), takže amortizovaně vychází INSERT jako O(1).',

        accountingTitle: 'Účetní metoda',
        accountingP1:    'Každému INSERT naúčtujeme pevný poplatek 2 mince. Mince utratíme a uložíme tak, aby byly budoucí rehashe vždy zaplacené bez dluhu:',
        coinStep1: '<strong>2 mince</strong> se přidělí na začátku každého INSERT (pevný amortizovaný poplatek).',
        coinStep2: '<strong>1 mince</strong> zaplatí uložení nového prvku do tabulky (zápis).',
        coinStep3: '<strong>1 mince</strong> se uloží <em>na tento prvek</em> a později zaplatí jeho přesun při rehashi.',
        coinStep4: 'Důležité: mince zde platí hlavně <strong>budoucí přesuny při rehashi</strong>. Netvrdíme tím, že každá možná sekvence probingu je levná. Probing se hodnotí zvlášť v očekávaném průměrném případě: při dobrém hashování a omezeném zaplnění má většina vložení jen pár probe kroků.',
        accountingMath: 'Když nastane resize, každý z n uložených prvků utratí svou ušetřenou minci a zaplatí přesně jeden přesun do nové tabulky. Rehash je tedy plně zaplacen ušetřenými mincemi.',
        accountingConclusion: 'Protože každý INSERT účtuje konstantní počet mincí a nikdy si nepůjčujeme z budoucnosti, INSERT běží v amortizovaném O(1). Jednotlivý INSERT ale může stát O(n), když zrovna vyvolá resize + rehash.',

        potentialTitle: 'Potenciálová metoda',
        potentialP1:    'Zaveďme potenciál Φ, který závisí na počtu prvků i kapacitě (ne jen na velikosti). Praktická lineární volba je:',
        potentialMath:  'Φ = 3 · velikost − kapacita   (případně posunutá/oříznutá tak, aby Φ ≥ 0)',
        potentialP2:    'Jak se tabulka blíží limitu zaplnění, Φ roste. Při resize (zdvojnásobení kapacity) Φ skokově klesne o Θ(n) a tento pokles zaplatí Θ(n) práci rehashe. Proto amortizovaný INSERT zůstává O(1).',
        potentialMath2:  'â = skutečná cena + ΔΦ = O(1)',
        potentialConclusion: 'Potenciálová metoda potvrzuje stejný výsledek: i přes občasný drahý resize je amortizovaná cena INSERT konstantní.',

        // Přehled složitostí (sjednoceno: nejlepší / amortizovaně / nejhorší 1×)
        opInsert: 'INSERT (amortizovaně)',
        opInsertBest: 'INSERT (nejlepší)',
        opInsertWorst: 'INSERT (nejhorší 1×)',

        noteInsert: 'Pro libovolnou sekvenci vložení (zdvojnásobování kapacity, konstantní limit zaplnění): amortizace vysvětluje, proč se vzácné drahé resize/rehash kroky rozloží do průměru. Probing stojí na jiné myšlence - očekávaném průměrném případě při dobrém hashování.',
        noteInsertBest: 'Slot určený hashem je prázdný.',
        noteInsertWorst: 'Vzácně: vložení překročí limit zaplnění a vyvolá resize + rehash (jedna operace O(n)).',

        legendAmortized: '* Amortizované O(1) znamená: při dlouhé sérii INSERT se občasný drahý resize/rehash rozpočítá mezi mnoho levných vložení, takže průměrná cena zůstane konstantní. Jednotlivý INSERT ale může stát Θ(n). Probing řešíme samostatně jako očekávaný průměrný případ (dobré hashování + omezené zaplnění).',

        ctaText: 'Chcete vidět probing, resize a mincovou účetní metodu v akci? Otevřete interaktivní simulaci.',
        ctaButton: '⚙️ Otevřít simulaci',
    }
};

function reloadWithTransition(beforeReload) {
    const ov = document.getElementById('pageTransitionOverlay');
    ov.classList.add('visible');
    setTimeout(() => { if (beforeReload) beforeReload(); window.location.reload(); }, 350);
}

function navigateToPage(event, url) {
    event.preventDefault();
    const ov = document.getElementById('pageTransitionOverlay');
    ov.classList.add('visible');
    setTimeout(() => { window.location.href = url; }, 350);
}

// Keep naming consistent with other theory pages
function navigateTo(event, url) {
    navigateToPage(event, url);
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    reloadWithTransition(() => localStorage.setItem('theme', isDark ? 'light' : 'dark'));
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
    reloadWithTransition(() => localStorage.setItem('lang', next));
}

function updateLangToggleUI() {
    document.getElementById('langOptCZ').classList.toggle('active', currentLang === 'cz');
    document.getElementById('langOptEN').classList.toggle('active', currentLang === 'en');
}

function showMethod(method) {
    document.querySelectorAll('.method-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.method-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`tab${method.charAt(0).toUpperCase() + method.slice(1)}`).classList.add('active');
    const id = `method-${method}`;
    const el = document.getElementById(id) || document.getElementById(method);
    if (el) el.classList.add('active');
}

function applyLanguage() {
    const d = theoryDict[currentLang];

    document.title = d.pageTitle;
    document.getElementById('theoryMainTitle').textContent = d.mainTitle;
    document.getElementById('navHomeLabel').textContent = d.navHome;
    document.getElementById('navSimLabel').textContent = d.navSimulation;
    document.getElementById('navTheoryLabel').textContent = d.navTheory;
    document.getElementById('footerText').textContent = d.footer;


    document.getElementById('titleIntro').textContent = d.titleIntro;
    document.getElementById('titleInsert').textContent = d.titleInsert;
    document.getElementById('titleResize').textContent = d.titleResize;
    document.getElementById('titleAmortized').textContent = d.titleAmortized;
    document.getElementById('titleSummary').textContent = d.titleSummary;

    document.getElementById('introP1').innerHTML = d.introP1;
    document.getElementById('introP2').innerHTML = d.introP2;
    document.getElementById('introBox').innerHTML = d.introBox;

    document.getElementById('insertP1').innerHTML = d.insertP1;
    document.getElementById('insertP2').innerHTML = d.insertP2;
    document.getElementById('cardBestTitle').textContent = d.cardBestTitle;
    document.getElementById('cardBestDesc').innerHTML = d.cardBestDesc;
    document.getElementById('cardWorstTitle').textContent = d.cardWorstTitle;
    document.getElementById('cardWorstDesc').innerHTML = d.cardWorstDesc;

    document.getElementById('resizeP1').innerHTML = d.resizeP1;
    document.getElementById('resizeP2').innerHTML = d.resizeP2;
    document.getElementById('resizeBox').innerHTML = d.resizeBox;

    // Hash function subsection (part of the resize/rehash section)
    const hTitle = document.getElementById('hashFuncTitle');
    if (hTitle) hTitle.textContent = d.hashFuncTitle;
    const hP1 = document.getElementById('hashFuncP1');
    if (hP1) hP1.innerHTML = d.hashFuncP1;
    const hP2 = document.getElementById('hashFuncP2');
    if (hP2) hP2.innerHTML = d.hashFuncP2;
    const hBox = document.getElementById('hashFuncBox');
    if (hBox) hBox.innerHTML = d.hashFuncBox;

    document.getElementById('amortizedP1').innerHTML = d.amortizedP1;
    const amortizedP2 = document.getElementById('amortizedP2');
    if (amortizedP2) amortizedP2.innerHTML = d.amortizedP2;

    document.getElementById('tabAggregate').textContent = d.tabAggregate;
    document.getElementById('tabAccounting').textContent = d.tabAccounting;
    document.getElementById('tabPotential').textContent = d.tabPotential;

    document.getElementById('aggregateTitle').textContent = d.aggregateTitle;
    document.getElementById('aggregateP1').innerHTML = d.aggregateP1;
    document.getElementById('aggregateMath').textContent = d.aggregateMath;
    document.getElementById('aggregateP2').innerHTML = d.aggregateP2;
    document.getElementById('aggregateMath2').textContent = d.aggregateMath2;
    document.getElementById('aggregateConclusion').innerHTML = d.aggregateConclusion;

    document.getElementById('accountingTitle').textContent = d.accountingTitle;
    document.getElementById('accountingP1').innerHTML = d.accountingP1;
    document.getElementById('coinStep1').innerHTML = d.coinStep1;
    document.getElementById('coinStep2').innerHTML = d.coinStep2;
    document.getElementById('coinStep3').innerHTML = d.coinStep3;
    document.getElementById('coinStep4').innerHTML = d.coinStep4;
    document.getElementById('accountingMath').innerHTML = d.accountingMath;
    document.getElementById('accountingConclusion').innerHTML = d.accountingConclusion;

    document.getElementById('potentialTitle').textContent = d.potentialTitle;
    document.getElementById('potentialP1').innerHTML = d.potentialP1;
    document.getElementById('potentialMath').textContent = d.potentialMath;
    document.getElementById('potentialP2').innerHTML = d.potentialP2;
    document.getElementById('potentialMath2').textContent = d.potentialMath2;
    document.getElementById('potentialConclusion').innerHTML = d.potentialConclusion;


    document.getElementById('opInsert').textContent      = d.opInsert;
    document.getElementById('opInsertBest').textContent  = d.opInsertBest;
    document.getElementById('opInsertWorst').textContent = d.opInsertWorst;

    document.getElementById('noteInsert').textContent     = d.noteInsert;
    document.getElementById('noteInsertBest').textContent = d.noteInsertBest;
    document.getElementById('noteInsertWorst').textContent = d.noteInsertWorst;

    document.getElementById('legendAmortized').textContent = d.legendAmortized;

    document.getElementById('ctaText').textContent = d.ctaText;
    document.getElementById('ctaButton').textContent = d.ctaButton;

    updateLangToggleUI();
    applyTheme();
}

window.addEventListener('load', () => {
    document.body.classList.add('page-loaded');
    applyLanguage();
});

