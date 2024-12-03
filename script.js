let array = [];
let capacity = 1; // Initial array size
let creditsPerSlot = []; // Number of coins above each slot
let steps = 0;

function visualizeArray() {
    const arrayContainer = document.getElementById("arrayVisualization");
    arrayContainer.innerHTML = ''; // Clear old content

    for (let i = 0; i < capacity; i++) {
        const frame = document.createElement("div");
        frame.classList.add("frame");

        // Display value if the slot contains an element
        if (i < array.length) {
            frame.innerText = array[i];
        } else {
            frame.innerText = ""; // Empty slot
        }

        // Display coins based on credits
        const coinsContainer = document.createElement("div");
        coinsContainer.classList.add("coins");

        const coinsNeeded = i < creditsPerSlot.length ? creditsPerSlot[i] : 0;
        for (let j = 0; j < coinsNeeded; j++) {
            const coin = document.createElement("div");
            coin.classList.add("coin");
            coinsContainer.appendChild(coin);
        }

        frame.appendChild(coinsContainer);
        arrayContainer.appendChild(frame);
    }

    document.getElementById("stepCounter").innerHTML = `Počet kroků: ${steps}`;
}

async function animateCoinUpdate(frameIndex, coinsNeeded) {
    const frame = document.querySelector(`.frame:nth-child(${frameIndex + 1}) .coins`);
    const currentCoins = frame.childElementCount;

    if (coinsNeeded > currentCoins) {
        // Gradually add coins
        for (let i = currentCoins; i < coinsNeeded; i++) {
            const coin = document.createElement("div");
            coin.classList.add("coin", "adding");
            frame.appendChild(coin);

            // Wait for the animation to complete
            await new Promise(resolve => setTimeout(resolve, 300));
            coin.classList.remove("adding");
        }
    } else if (coinsNeeded < currentCoins) {
        // Gradually remove coins
        for (let i = currentCoins; i > coinsNeeded; i--) {
            const coin = frame.lastChild;
            coin.classList.add("removing");
            await new Promise(resolve => setTimeout(resolve, 300)); // Wait for the animation
            coin.remove();
        }
    }
}

async function resizeArray() {
    let oldCapacity = capacity;
    capacity *= 2;
    updateInfoPanel(`Increasing capacity from ${oldCapacity} to ${capacity}.`);

    // Deduct coins for copying elements
    for (let i = 0; i < oldCapacity; i++) {
        if (creditsPerSlot[i] > 0) {
            creditsPerSlot[i]--; // Deduct 1 coin for the copy
            await animateCoinUpdate(i, creditsPerSlot[i]); // Gradual removal
        } else {
            updateInfoPanel(`Field ${i} had no credits left during resizing.`);
        }
    }

    // Add new empty slots with initial credits
    for (let i = oldCapacity; i < capacity; i++) {
        creditsPerSlot[i] = 3; // Each new slot starts with 3 coins
    }

    visualizeArray(); // Redraw array
}

async function addElement() {
    const input = document.getElementById("manualInput");
    const value = parseInt(input.value);

    if (isNaN(value)) {
        updateInfoPanel("Please enter a valid number.");
        return;
    }

    steps++;

    if (array.length === capacity) {
        updateInfoPanel(`Array full. Resizing needed.`);
        await resizeArray();
    }

    // Check if this is the first element
    if (array.length === 0) {
        // Initialize the first slot with 3 coins
        creditsPerSlot.push(3);
    }

    // Add the new element
    array.push(value);

    // Assign 3 credits to the new slot if capacity allows
    if (creditsPerSlot.length < capacity) {
        creditsPerSlot.push(3);
    }

    // Update the DOM first to ensure elements exist
    visualizeArray();

    // Spend 1 coin for the insertion
    if (array.length - 1 < creditsPerSlot.length && creditsPerSlot[array.length - 1] > 0) {
        creditsPerSlot[array.length - 1]--; // Deduct 1 coin for the insertion
        console.log(`Insertion: Spent 1 coin for inserting value ${value} into slot ${array.length - 1}.`);
        await animateCoinUpdate(array.length - 1, creditsPerSlot[array.length - 1]); // Animate coin removal
    } else {
        updateInfoPanel(`No coins left for insertion in slot ${array.length - 1}.`);
    }

    updateInfoPanel(`Added value ${value}. Spent 1 coin for insertion. New slot has 3 coins.`);
    input.value = ""; // Clear the input
}

function updateInfoPanel(message) {
    const infoPanel = document.getElementById("infoPanel");
    const logEntry = document.createElement("div");
    logEntry.textContent = message;
    logEntry.style.marginBottom = "5px";
    logEntry.style.fontSize = "14px";

    infoPanel.prepend(logEntry); // Add new message to the top
}

async function addElementManually(value) {
    const input = document.getElementById("manualInput");
    input.value = value;
    await addElement();
}


function runBestCase() {
    array = [];
    capacity = 1; // Reset
    creditsPerSlot = [];
    steps = 0;

    updateInfoPanel("Simulating best case where each insertion fits without resizing.");
    for (let i = 0; i < 10; i++) {
        addElementManually(i);
    }
}


function runWorstCase() {
    array = [];
    capacity = 2; // Set initial capacity
    creditsPerSlot = [];
    steps = 0;
    updateInfoPanel("Simulating worst case where resizing happens almost every insertion.");

    for (let i = 0; i < 16; i++) { // Simulate a longer series
        document.getElementById("manualInput").value = i;
        addElement();
    }
}
