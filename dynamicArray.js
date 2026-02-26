let array = [];             // Vložená čísla
let capacity = 1;           // Aktuální kapacita pole
let creditsPerSlot = [];    // Mince nad každým políčkem
let steps = 0;

// ── Pomocné funkce ────────────────────────────────────────────

function updateCredits()
{
    const totalCredits = creditsPerSlot.reduce((sum, c) => sum + c, 0);
    const d = dict[currentLang];
    document.getElementById("creditCounter").textContent = `${d.coins}: ${totalCredits}`;
}

function resetValues()
{
    array = [];
    creditsPerSlot = [];
    capacity = 1;
    steps = 0;

    const d = dict[currentLang];
    document.getElementById("creditCounter").textContent = `${d.coins}: 0`;
    document.getElementById("stepCounter").textContent   = `${d.steps}: 0`;
    document.getElementById("arrayVisualization").innerHTML = "";

    // Clear log panel and show initial message
    const infoPanel = document.getElementById("infoPanel");
    infoPanel.innerHTML = "";
    const initialEntry = document.createElement("div");
    initialEntry.classList.add('log-entry', 'info');
    initialEntry.innerHTML = `
        <div class="log-header">
            <span class="log-icon">👋</span>
            <span>${d.steps} ${d.willAppear}</span>
        </div>
    `;
    infoPanel.appendChild(initialEntry);
}

function visualizeArray()
{
    const arrayContainer = document.getElementById("arrayVisualization");
    arrayContainer.innerHTML = '';

    for (let i = 0; i < capacity; i++)
    {
        const frame = document.createElement("div");
        frame.classList.add("frame");
        frame.innerText = i < array.length ? array[i] : "";

        const coinsContainer = document.createElement("div");
        coinsContainer.classList.add("coins");

        const coinsNeeded = i < creditsPerSlot.length ? creditsPerSlot[i] : 0;
        for (let j = 0; j < coinsNeeded; j++)
        {
            const coin = document.createElement("div");
            coin.classList.add("coin");
            coinsContainer.appendChild(coin);
        }

        frame.appendChild(coinsContainer);
        arrayContainer.appendChild(frame);
    }

    const d = dict[currentLang];
    document.getElementById("stepCounter").textContent = `${d.steps}: ${steps}`;
}

async function animateCoinUpdate(frameIndex, coinsNeeded)
{
    const frame = document.querySelector(`.frame:nth-child(${frameIndex + 1}) .coins`);
    if (!frame) return;
    const currentCoins = frame.childElementCount;

    if (coinsNeeded > currentCoins)
    {
        for (let i = currentCoins; i < coinsNeeded; i++)
        {
            const coin = document.createElement("div");
            coin.classList.add("coin", "adding");
            frame.appendChild(coin);
            await new Promise(resolve => setTimeout(resolve, 300));
            coin.classList.remove("adding");
        }
    }
    else if (coinsNeeded < currentCoins)
    {
        for (let i = currentCoins; i > coinsNeeded; i--)
        {
            const coin = frame.lastChild;
            if (!coin) break;
            coin.classList.add("removing");
            await new Promise(resolve => setTimeout(resolve, 300));
            coin.remove();
        }
    }
}

async function resizeArray()
{
    const d = dict[currentLang];
    const oldCapacity = capacity;
    capacity *= 2;

    for (let i = oldCapacity; i < capacity; i++)
    {
        creditsPerSlot[i] = 2;
    }

    updateInfoPanelWithDetails(
        d.resizeTitle(oldCapacity, capacity),
        d.resizeWhy()
    );

    visualizeArray();
    await new Promise(resolve => setTimeout(resolve, 400));

    updateInfoPanel(d.resizeNewSlots(oldCapacity, capacity));

    for (let i = 0; i < oldCapacity; i++)
    {
        if (creditsPerSlot[i] > 0)
        {
            creditsPerSlot[i]--;
            updateCredits();
            await animateCoinUpdate(i, creditsPerSlot[i]);
            updateInfoPanel(d.resizeCopySlot(i));
        }
        else
        {
            let lenderIndex = -1;
            for (let j = oldCapacity; j < capacity; j++)
            {
                if (creditsPerSlot[j] > 0)
                {
                    lenderIndex = j;
                    break;
                }
            }

            if (lenderIndex !== -1)
            {
                updateInfoPanel(
                    `Pozice <span class="log-badge slot">[${i}]</span> má <span class="log-badge coin">0 mincí</span> — půjčujeme z <span class="log-badge slot">[${lenderIndex}]</span>`
                );
                creditsPerSlot[lenderIndex]--;
                updateCredits();
                await animateCoinUpdate(lenderIndex, creditsPerSlot[lenderIndex]);
                await new Promise(resolve => setTimeout(resolve, 400));
            }
            else
            {
                updateInfoPanel(`⚠️ Pozice <span class="log-badge slot">[${i}]</span> — invariant porušen, žádné mince!`);
            }
        }
    }

    updateInfoPanel(d.resizeDoneSlots(oldCapacity));
    visualizeArray();
}

async function addElement()
{
    const input = document.getElementById("manualInput");
    const value = parseInt(input.value);
    const d = dict[currentLang];

    if (isNaN(value))
    {
        updateInfoPanel(d.pleaseEnterValidNumber);
        return;
    }

    steps++;
    const slotIndex = array.length;

    if (array.length === capacity)
    {
        updateInfoPanel(d.arrayFull);
        await resizeArray();
    }
    else
    {
        creditsPerSlot[slotIndex] = 2;
        updateCredits();
    }

    visualizeArray();
    await animateCoinUpdate(slotIndex, 2);

    updateInfoPanelWithDetails(
        d.insertTitle(value, slotIndex),
        [
            d.insertAllocCoins(2),
            d.insertPaySelf(),
            d.insertPayCopy(),
        ].join('<br>')
    );

    array.push(value);
    visualizeArray();
    await new Promise(resolve => setTimeout(resolve, 400));

    creditsPerSlot[slotIndex]--;
    updateCredits();
    await animateCoinUpdate(slotIndex, creditsPerSlot[slotIndex]);

    const remaining = creditsPerSlot[slotIndex];
    updateInfoPanel(d.insertRemaining(remaining));

    input.value = "";
}

function getRandomNumber(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateRandomArray()
{
    const d = dict[currentLang];
    const count = parseInt(document.getElementById("randomCount").value);
    const min   = parseInt(document.getElementById("randomMin").value);
    const max   = parseInt(document.getElementById("randomMax").value);

    if (isNaN(count) || isNaN(min) || isNaN(max) || count <= 0 || min > max)
    {
        updateInfoPanel(d.invalidInput);
        return;
    }

    updateInfoPanel(d.randomGenerating(count, min, max));

    for (let i = 0; i < count; i++)
    {
        document.getElementById("manualInput").value = getRandomNumber(min, max);
        await addElement();
    }

    updateInfoPanel(d.randomDone(count));
}

function runBestCase()
{
    resetValues();
    // TODO: implementace nejlepšího případu
}

function runWorstCase()
{
    resetValues();
    // TODO: implementace nejhoršího případu
}
