let array = [];                 // Added numbers
let capacity = 1;             // Initial array size
let creditsPerSlot = [];        // Coins above each slot
let steps = 0;

function toggleTheme()
{
    const body = document.body;
    const button = document.getElementById("themeToggle");

    // Toggle dark mode
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode"))
    {
        button.textContent = "Switch to Light Mode";
    }
    else
    {
        button.textContent = "Switch to Dark Mode";
    }
}


function updateCredits()
{
    const totalCredits = creditsPerSlot.reduce((sum, credits) => sum + credits, 0);
    document.getElementById("creditCounter").textContent = `Coins: ${totalCredits}`;
}


function resetValues()
{
    array = [];
    creditsPerSlot = [];
    capacity = 1;
    steps = 0;
    updateCredits();

    // Reset trackers
    document.getElementById("creditCounter").textContent = "Coins: 0";
    document.getElementById("stepCounter").textContent = "Steps: 0";

    // Clear array visualization
    document.getElementById("arrayVisualization").innerHTML = "";

    // Clear log
    document.getElementById("infoPanel").textContent = "Steps will appear here.";
}

function setMode(mode)
{
    resetValues();

    document.querySelectorAll('nav button').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.mode').forEach(section => section.classList.remove('active'));

    document.getElementById(`${mode}Tab`).classList.add('active');
    document.getElementById(`${mode}Mode`).classList.add('active');
}

function visualizeArray()
{
    const arrayContainer = document.getElementById("arrayVisualization");
    arrayContainer.innerHTML = '';      // Clear old content

    for (let i = 0; i < capacity; i++)
    {
        const frame = document.createElement("div");
        frame.classList.add("frame");

        if (i < array.length)
        {
            frame.innerText = array[i];
        }
        else
        {
            frame.innerText = "";       // Empty slot
        }

        // Coins container
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

        // Gradually add coins
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
        // Gradually remove coins
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

    // Copying
    for (let i = 0; i < oldCapacity; i++)
    {
        if (creditsPerSlot[i] > 0)
        {
            creditsPerSlot[i]--; // Deduct 1 coin
            updateCredits();
            console.log(`Resizing: Spent 1 coin for copying value from slot ${i}.`);
            await animateCoinUpdate(i, creditsPerSlot[i]);
        }
        else
        {
            // Borrow coin
            let borrowed = false;
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

            if (!borrowed)
            {
                updateInfoPanel(`Field ${i} and subsequent fields had no coins left during resizing. ERROR`);
                console.log(`ERROR when attempting to copy field ${i}.`);
            }
        }
    }

    // Add empty slots
    for (let i = oldCapacity; i < capacity; i++)
    {
        creditsPerSlot[i] = 0;
        visualizeArray();
        await new Promise(resolve => setTimeout(resolve, 500));

        creditsPerSlot[i] = 3; // Initialize with 3 coins
        updateCredits();
        await animateCoinUpdate(i, 3);
    }

    visualizeArray();
}

async function addElement()
{
    const input = document.getElementById("manualInput");
    const value = parseInt(input.value);

    if (isNaN(value))
    {
        updateInfoPanel("Please enter a valid number.");
        return;
    }

    steps++;

    if (array.length === capacity)
    {
        updateInfoPanel(`Array full. Resizing needed.`);
        await resizeArray();
    }

    // First element
    if (array.length === 0)
    {
        // Step 1: Create the empty field
        capacity = 1;
        creditsPerSlot.push(0);
        visualizeArray();
        await new Promise(resolve => setTimeout(resolve, 500));

        // Step 2: Add 3 coins above the empty field
        creditsPerSlot[0] = 3;
        updateCredits();
        await animateCoinUpdate(0, 3);
    }

    // Step 3: Add the value into the field
    array.push(value);
    visualizeArray();
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 4: Deduct 1 coin for the insertion
    if (array.length - 1 < creditsPerSlot.length && creditsPerSlot[array.length - 1] > 0)
    {
        creditsPerSlot[array.length - 1]--;
        updateCredits();
        console.log(`Insertion: Spent 1 coin for inserting value ${value} into slot ${array.length - 1}.`);
        await animateCoinUpdate(array.length - 1, creditsPerSlot[array.length - 1]);
    }
    else
    {
        updateInfoPanel(`No coins left for insertion in slot ${array.length - 1}.`);
    }

    updateInfoPanel(`Added value ${value}. New slot has 3 coins. Spent 1 coin for insertion. `);
    input.value = "";
}


function updateInfoPanel(message)
{
    const infoPanel = document.getElementById("infoPanel");

    // Create new log entry
    const logEntry = document.createElement("div");
    logEntry.innerHTML = `<strong>Step ${steps}:</strong> ${message}`;
    logEntry.style.margin = "10px 0";
    logEntry.style.fontSize = "14px";
    logEntry.style.padding = "10px";
    logEntry.style.borderBottom = "1px solid #ddd";

    if (document.body.classList.contains("dark-mode"))
    {
        logEntry.style.background = "#333";
        logEntry.style.color = "#ccc";
        logEntry.style.borderBottom = "1px solid #444";
    }
    else
    {
        logEntry.style.background = "#f9f9f9";
        logEntry.style.color = "#666";
    }

    infoPanel.appendChild(logEntry);
}


function updateInfoPanelWithDetails(mainMessage, details)
{
    const infoPanel = document.getElementById("infoPanel");

    // Main message
    const logEntry = document.createElement("div");
    logEntry.style.margin = "10px 0";
    logEntry.style.fontSize = "14px";
    logEntry.style.padding = "10px";
    logEntry.style.borderBottom = "1px solid #ddd";
    logEntry.style.background = "#f9f9f9";

    logEntry.innerHTML = `
        <strong>Step ${steps}:</strong> ${mainMessage}
        <button onclick="toggleDetails(this)" style="margin-left: 10px; font-size: 12px; padding: 2px 6px; border: none; background: #eee; cursor: pointer;">Details</button>
        <div class="details" style="display: none; margin-top: 10px; font-size: 12px; color: #666;">
            ${details}
        </div>
    `;

    infoPanel.appendChild(logEntry);
}

function toggleDetails(button)
{
    const details = button.nextElementSibling;
    details.style.display = details.style.display === "none" ? "block" : "none";
}

function getRandomNumber(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateRandomArray()
{
    // Get inputs
    const count = parseInt(document.getElementById("randomCount").value);
    const min = parseInt(document.getElementById("randomMin").value);
    const max = parseInt(document.getElementById("randomMax").value);

    // Validate
    if (isNaN(count) || isNaN(min) || isNaN(max) || count <= 0 || min > max)
    {
        updateInfoPanel("Invalid input. Please check the values and try again.");
        return;
    }

    updateInfoPanel(`Generating ${count} random numbers between ${min} and ${max}.`);

    // Generate and insert numbers
    for (let i = 0; i < count; i++)
    {
        document.getElementById("manualInput").value = getRandomNumber(min, max);
        await addElement();
    }

    updateInfoPanel(`Completed generating ${count} random numbers.`);
}



function runBestCase()
{
    array = [];
    capacity = 1;
    creditsPerSlot = [];
    steps = 0;
}


function runWorstCase()
{
    array = [];
    capacity = 1;
    creditsPerSlot = [];
    steps = 0;
}
