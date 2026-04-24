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
        accountingP1:    'Charge each INSERT a fixed fee of 3 coins. The 3 coins are distributed so that every future rehash is always paid — including elements that were already rehashed once:',
        coinStep1: '<strong>3 coins</strong> are received at the start of every INSERT (fixed amortized charge).',
        coinStep2: '<strong>1 coin</strong> pays for placing the new element into the table (the write).',
        coinStep3: '<strong>1 coin</strong> is saved <em>on that element\'s slot</em> to pay for its own move during the <em>first</em> rehash it ever faces.',
        coinStep4: '<strong>1 coin</strong> goes into a central <strong>bank</strong>. When an element is rehashed a <em>second</em> (or later) time it no longer has a slot coin, so the bank covers its move.',
        coinStep5: 'Important: the coins here pay for <strong>resize/rehash moves</strong> only. Probing is analyzed separately as an expected average-case property: with good hashing and bounded load factor, most inserts need only a few probes.',
        accountingMath: 'On the first rehash every element (slot coin = 1) pays its own move; bank is untouched. On the second rehash those elements have slot coin = 0 and are paid from the bank. Each INSERT deposited 1 coin into the bank, so the bank always has enough to cover them.',
        accountingConclusion: 'Since each INSERT is charged a constant number of coins (3) and we never borrow from the future, INSERT runs in amortized O(1). A single INSERT can still cost O(n) when it triggers resize + rehash.',

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
        accountingP1:    'Každému INSERT naúčtujeme pevný poplatek 3 mince. Mince se rozdělí tak, aby byly vždy pokryty i budoucí rehashe — včetně prvků, které byly přehashované už jednou:',
        coinStep1: '<strong>3 mince</strong> se přidělí na začátku každého INSERT (pevný amortizovaný poplatek).',
        coinStep2: '<strong>1 mince</strong> zaplatí uložení nového prvku do tabulky (zápis).',
        coinStep3: '<strong>1 mince</strong> se uloží <em>na slot tohoto prvku</em> a zaplatí jeho přesun při <em>prvním</em> rehashi, se kterým se setká.',
        coinStep4: '<strong>1 mince</strong> jde do centrální <strong>banky</strong>. Prvek, který je rehashovaný <em>podruhé</em> (nebo vícekrát), už nemá minci na slotu — jeho přesun zaplatí banka.',
        coinStep5: 'Důležité: mince zde platí výhradně <strong>přesuny při resize/rehashi</strong>. Probing se hodnotí zvlášť jako očekávaný průměrný případ: při dobrém hashování a omezeném zaplnění má většina vložení jen pár probe kroků.',
        accountingMath: 'Při prvním rehashi má každý prvek minci na slotu (= 1) a zaplatí přesun sám; banka zůstává nedotčena. Při druhém rehashi mají tyto prvky minci na slotu = 0 a jsou placeny z banky. Každý INSERT do banky přidal 1 minci, takže banka vždy pokryje jejich přesuny.',
        accountingConclusion: 'Protože každý INSERT účtuje konstantní počet mincí (3) a nikdy si nepůjčujeme z budoucnosti, INSERT běží v amortizovaném O(1). Jednotlivý INSERT ale může stát O(n), když zrovna vyvolá resize + rehash.',

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
    setTimeout(function() {
        if (beforeReload) beforeReload();
        window.location.reload();
    }, 350);
}

function navigateToPage(event, url) {
    event.preventDefault();
    const ov = document.getElementById('pageTransitionOverlay');
    ov.classList.add('visible');
    setTimeout(function() { window.location.href = url; }, 350);
}

// Keep naming consistent with other theory pages
function navigateTo(event, url) {
    navigateToPage(event, url);
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

function showMethod(method) {
    var methodTabs = document.querySelectorAll('.method-tab');
    for (var i = 0; i < methodTabs.length; i++) {
        methodTabs[i].classList.remove('active');
    }
    var methodContents = document.querySelectorAll('.method-content');
    for (var i = 0; i < methodContents.length; i++) {
        methodContents[i].classList.remove('active');
    }
    var tabId;
    if (method === 'aggregate') tabId = 'tabAggregate';
    else if (method === 'accounting') tabId = 'tabAccounting';
    else if (method === 'potential') tabId = 'tabPotential';
    else tabId = 'tab' + method;
    document.getElementById(tabId).classList.add('active');
    const id = 'method-' + method;
    const el = document.getElementById(id) || document.getElementById(method);
    if (el) el.classList.add('active');
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function setHtml(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}

function applyLanguage() {
    const d = theoryDict[currentLang];

    document.title = d.pageTitle;
    setText('theoryMainTitle', d.mainTitle);
    setText('navHomeLabel', d.navHome);
    setText('navSimLabel', d.navSimulation);
    setText('navTheoryLabel', d.navTheory);
    setText('footerText', d.footer);


    setText('titleIntro', d.titleIntro);
    setText('titleInsert', d.titleInsert);
    setText('titleResize', d.titleResize);
    setText('titleAmortized', d.titleAmortized);
    setText('titleSummary', d.titleSummary);

    setHtml('introP1', d.introP1);
    setHtml('introP2', d.introP2);
    setHtml('introBox', d.introBox);

    setHtml('insertP1', d.insertP1);
    setHtml('insertP2', d.insertP2);
    setText('cardBestTitle', d.cardBestTitle);
    setHtml('cardBestDesc', d.cardBestDesc);
    setText('cardWorstTitle', d.cardWorstTitle);
    setHtml('cardWorstDesc', d.cardWorstDesc);

    setHtml('resizeP1', d.resizeP1);
    setHtml('resizeP2', d.resizeP2);
    setHtml('resizeBox', d.resizeBox);

    // Hash function subsection (part of the resize/rehash section)
    setText('hashFuncTitle', d.hashFuncTitle);
    setHtml('hashFuncP1', d.hashFuncP1);
    setHtml('hashFuncP2', d.hashFuncP2);
    setHtml('hashFuncBox', d.hashFuncBox);

    setHtml('amortizedP1', d.amortizedP1);
    setHtml('amortizedP2', d.amortizedP2);

    setText('tabAggregate', d.tabAggregate);
    setText('tabAccounting', d.tabAccounting);
    setText('tabPotential', d.tabPotential);

    setText('aggregateTitle', d.aggregateTitle);
    setHtml('aggregateP1', d.aggregateP1);
    setText('aggregateMath', d.aggregateMath);
    setHtml('aggregateP2', d.aggregateP2);
    setText('aggregateMath2', d.aggregateMath2);
    setHtml('aggregateConclusion', d.aggregateConclusion);

    setText('accountingTitle', d.accountingTitle);
    setHtml('accountingP1', d.accountingP1);
    setHtml('coinStep1', d.coinStep1);
    setHtml('coinStep2', d.coinStep2);
    setHtml('coinStep3', d.coinStep3);
    setHtml('coinStep4', d.coinStep4);
    setHtml('coinStep5', d.coinStep5);
    setHtml('accountingMath', d.accountingMath);
    setHtml('accountingConclusion', d.accountingConclusion);

    setText('potentialTitle', d.potentialTitle);
    setHtml('potentialP1', d.potentialP1);
    setText('potentialMath', d.potentialMath);
    setHtml('potentialP2', d.potentialP2);
    setText('potentialMath2', d.potentialMath2);
    setHtml('potentialConclusion', d.potentialConclusion);


    setText('opInsert', d.opInsert);
    setText('opInsertBest', d.opInsertBest);
    setText('opInsertWorst', d.opInsertWorst);

    setText('noteInsert', d.noteInsert);
    setText('noteInsertBest', d.noteInsertBest);
    setText('noteInsertWorst', d.noteInsertWorst);

    setText('legendAmortized', d.legendAmortized);

    setText('ctaText', d.ctaText);
    setText('ctaButton', d.ctaButton);

    updateLangToggleUI();
    applyTheme();
}

window.addEventListener('load', function() {
    document.body.classList.add('page-loaded');
    applyLanguage();
});

