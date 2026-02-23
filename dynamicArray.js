let array = [];                     // Vložená čísla
let capacity = 1;               // Aktuální kapacita pole
let creditsPerSlot = [];        // Mince nad každým políčkem
let steps = 0;

function updateCredits()
{
    const totalCredits = creditsPerSlot.reduce((sum, credits) => sum + credits, 0);
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
    document.getElementById("stepCounter").textContent = `${d.steps}: 0`;
    document.getElementById("arrayVisualization").innerHTML = "";
    document.getElementById("infoPanel").textContent = d.steps + " " + d.willAppear;
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

        // Kontejner mincí
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

    document.getElementById("stepCounter").innerHTML = `Steps: ${steps}`;
}

async function animateCoinUpdate(frameIndex, coinsNeeded)
{
    const frame = document.querySelector(`.frame:nth-child(${frameIndex + 1}) .coins`);
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
            coin.classList.add("removing");
            await new Promise(resolve => setTimeout(resolve, 300));
            coin.remove();
        }
    }
}

async function resizeArray()
{
    let oldCapacity = capacity;
    capacity *= 2;

    updateInfoPanelWithDetails(
        `Increasing capacity from ${oldCapacity} to ${capacity}.`,
        `Copied ${oldCapacity} elements. Each copy operation spent 1 coin.`
    );

    // Nové sloty dostanou 2 mince
    for (let i = oldCapacity; i < capacity; i++)
    {
        creditsPerSlot[i] = 2;
    }
    updateCredits();
    visualizeArray();
    await new Promise(resolve => setTimeout(resolve, 500));
    for (let i = oldCapacity; i < capacity; i++)
    {
        await animateCoinUpdate(i, 2);
    }

    // Kopírování – každý prvek utratí 1 minci
    for (let i = 0; i < oldCapacity; i++)
    {
        if (creditsPerSlot[i] > 0)
        {
            creditsPerSlot[i]--;
            updateCredits();
            console.log(`Resizing: Spent 1 coin for copying value from slot ${i}.`);
            await animateCoinUpdate(i, creditsPerSlot[i]);
        }
        else
        {
            let borrowed = false;

            // Zkus si půjčit od pozdějšího starého slotu
            for (let j = i + 1; j < oldCapacity; j++)
            {
                if (creditsPerSlot[j] > 0)
                {
                    creditsPerSlot[j]--;
                    updateCredits();
                    console.log(`Resizing: Borrowed 1 coin from slot ${j} to copy value from slot ${i}.`);
                    updateInfoPanel(`Field ${i} had no coins. Borrowed 1 coin from field ${j}.`);
                    await animateCoinUpdate(j, creditsPerSlot[j]);
                    borrowed = true;
                    break;
                }
            }

            // Zkus si půjčit od nových slotů
            if (!borrowed)
            {
                for (let j = oldCapacity; j < capacity; j++)
                {
                    if (creditsPerSlot[j] > 0)
                    {
                        creditsPerSlot[j]--;
                        updateCredits();
                        console.log(`Resizing: Borrowed 1 coin from new slot ${j} to copy value from slot ${i}.`);
                        updateInfoPanel(`Field ${i} had no coins. Borrowed 1 coin from new field ${j}.`);
                        await animateCoinUpdate(j, creditsPerSlot[j]);
                        borrowed = true;
                        break;
                    }
                }
            }

            if (!borrowed)
            {
                updateInfoPanel(`Field ${i} and subsequent fields had no coins left during resizing. ERROR`);
                console.log(`ERROR when attempting to copy field ${i}.`);
            }
        }
    }

    visualizeArray();
}

async function addElement()
{
    const input = document.getElementById("manualInput");
    const value = parseInt(input.value);

    if (isNaN(value))
    {
        updateInfoPanel(dict[currentLang].pleaseEnterValidNumber);
        return;
    }

    steps++;

    if (array.length === capacity)
    {
        updateInfoPanel(dict[currentLang].arrayFull);
        await resizeArray();
    }

    // První prvek
    if (array.length === 0)
    {
        capacity = 1;
        creditsPerSlot.push(0);
        visualizeArray();
        await new Promise(resolve => setTimeout(resolve, 500));

        creditsPerSlot[0] = 2;
        updateCredits();
        await animateCoinUpdate(0, 2);
    }

    array.push(value);
    visualizeArray();
    await new Promise(resolve => setTimeout(resolve, 500));

    if (array.length - 1 < creditsPerSlot.length && creditsPerSlot[array.length - 1] > 0)
    {
        creditsPerSlot[array.length - 1]--;
        updateCredits();
        console.log(`Insertion: Spent 1 coin for inserting value ${value} into slot ${array.length - 1}.`);
        await animateCoinUpdate(array.length - 1, creditsPerSlot[array.length - 1]);
    }
    else
    {
        updateInfoPanel(`${dict[currentLang].noCoinsLeft} ${array.length - 1}.`);
    }

    const remainingInNewSlot = (array.length - 1 < creditsPerSlot.length) ? creditsPerSlot[array.length - 1] : 0;
    const d = dict[currentLang];
    updateInfoPanel(`${d.addedValue} ${value}. ${d.newSlotHas} ${remainingInNewSlot} ${d.coins.toLowerCase()}. ${d.spentInsertion}`);
    input.value = "";
}

function getRandomNumber(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateRandomArray()
{
    const count = parseInt(document.getElementById("randomCount").value);
    const min   = parseInt(document.getElementById("randomMin").value);
    const max   = parseInt(document.getElementById("randomMax").value);

    if (isNaN(count) || isNaN(min) || isNaN(max) || count <= 0 || min > max)
    {
        updateInfoPanel(dict[currentLang].invalidInput);
        return;
    }

    updateInfoPanel(`Generating ${count} random numbers between ${min} and ${max}.`);

    for (let i = 0; i < count; i++)
    {
        document.getElementById("manualInput").value = getRandomNumber(min, max);
        await addElement();
    }

    updateInfoPanel(`Completed generating ${count} random numbers.`);
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

