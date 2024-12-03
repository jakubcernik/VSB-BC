let array = [];
let capacity = 1; // Initial array size
let creditsPerSlot = []; // Number of coins above each slot
let steps = 0;

function resetSimulation() {
    // Reset core data structures
    array = [];
    creditsPerSlot = [];
    capacity = 1;
    steps = 0;

    // Reset trackers
    document.getElementById("creditCounter").textContent = "Credits: 0";
    document.getElementById("stepCounter").textContent = "Steps: 0";

    // Clear visualization
    document.getElementById("arrayVisualization").innerHTML = "";

    // Clear info panel
    document.getElementById("infoPanel").textContent = "Steps will appear here.";
}

function setMode(mode) {
    // Reset the simulation
    resetSimulation();

    // Remove 'active' class from all tabs and sections
    document.querySelectorAll('nav button').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.mode').forEach(section => section.classList.remove('active'));

    // Add 'active' class to the selected tab and section
    document.getElementById(`${mode}Tab`).classList.add('active');
    document.getElementById(`${mode}Mode`).classList.add('active');
}



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

    document.getElementById("stepCounter").innerHTML = `Steps: ${steps}`;
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

    // Main message
    updateInfoPanelWithDetails(
        `Increasing capacity from ${oldCapacity} to ${capacity}.`,
        `Copied ${oldCapacity} elements. Each copy operation spent 1 coin.`
    );

    // Deduct coins for copying elements
    for (let i = 0; i < oldCapacity; i++) {
        if (creditsPerSlot[i] > 0) {
            creditsPerSlot[i]--; // Deduct 1 coin for the copy
            console.log(`Resizing: Spent 1 coin for copying value from slot ${i}.`);
            await animateCoinUpdate(i, creditsPerSlot[i]); // Gradual removal
        } else {
            updateInfoPanel(`Field ${i} had no credits left during resizing.`);
        }
    }

    // Add new empty slots with animations
    for (let i = oldCapacity; i < capacity; i++) {
        creditsPerSlot[i] = 0; // Temporarily set to 0 coins
        visualizeArray();
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for empty field animation

        creditsPerSlot[i] = 3; // Initialize with 3 coins
        await animateCoinUpdate(i, 3); // Animate adding coins
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
        // Step 1: Create the empty field
        capacity = 1; // Initialize capacity
        creditsPerSlot.push(0); // Temporarily set to 0 coins
        visualizeArray();
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for field animation

        // Step 2: Add 3 coins above the empty field
        creditsPerSlot[0] = 3;
        await animateCoinUpdate(0, 3); // Animate adding coins
    }

    // Step 3: Add the value into the field
    array.push(value);
    visualizeArray(); // Update visualization with the value
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for value animation

    // Step 4: Deduct 1 coin for the insertion
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

    // Ensure chronological order by appending at the bottom
    const logEntry = document.createElement("div");
    logEntry.innerHTML = `<strong>Step ${steps}:</strong> ${message}`;
    logEntry.style.margin = "10px 0";
    logEntry.style.fontSize = "14px";
    logEntry.style.padding = "10px";
    logEntry.style.borderBottom = "1px solid #ddd";
    logEntry.style.background = "#f9f9f9";

    // Append the new log entry at the bottom
    infoPanel.appendChild(logEntry);
}

function updateInfoPanelWithDetails(mainMessage, details) {
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

function toggleDetails(button) {
    const details = button.nextElementSibling;
    details.style.display = details.style.display === "none" ? "block" : "none";
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
