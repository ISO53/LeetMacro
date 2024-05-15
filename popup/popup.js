// ******************** Declare Variables ********************
// UI element that holds key value pairs
const TABLE_CONTENTS = document.getElementById("table_contents");

// ************************ JS Starts ************************
// Handle first time things
handleFirstTime();

// Add click listener to add_new button to allow users to add new macros
document.getElementById("add_new").addEventListener("click", async () => {
    await addPairToUI();
});

document.getElementById("reset_button").addEventListener("click", async () => {
    await deleteAllPairsFromStorage();
    await setPairsInStorage({sout: "System.out.println();"});
    await refreshPairsOnUI();
});

document.getElementById("save_changes_button").addEventListener("click", async () => {
    await handleTableElements();
    await refreshPairsOnUI();
});

// Refresh pairs (macros) on the extension popup
refreshPairsOnUI();

// ******************** Declare Functions ********************
async function addPairToUI(key, value) {
    // Create the elements
    const div = document.createElement("div");
    div.className = "pair flat";

    const inputKey = document.createElement("input");
    inputKey.className = "input";
    inputKey.type = "text";
    inputKey.name = "key";
    inputKey.placeholder = "key here";
    if (key) inputKey.value = key;
    inputKey.autocomplete = "off";
    inputKey.spellcheck = "false";

    const inputValue = document.createElement("input");
    inputValue.className = "input";
    inputValue.type = "text";
    inputValue.name = "value";
    inputValue.placeholder = "value here";
    if (value) inputValue.value = value;
    inputValue.autocomplete = "off";
    inputValue.spellcheck = "false";

    const imgDelete = document.createElement("img");
    imgDelete.className = "icon delete";
    imgDelete.src = "res/trash.svg";
    imgDelete.alt = "";
    imgDelete.addEventListener("click", async ()=>{
        await deletePairFromStorage(key);
        await refreshPairsOnUI();
    });

    // Append the elements to the div
    div.appendChild(inputKey);
    div.appendChild(inputValue);
    div.appendChild(imgDelete);

    // Append the div to the table_contents div
    TABLE_CONTENTS.appendChild(div);
}

async function setPairsInStorage(pairs) {
    await chrome.storage.local.set({pairs: pairs});
}

async function deletePairFromStorage(key) {
    const storedPairs = (await chrome.storage.local.get("pairs"))?.pairs || {};
    delete storedPairs[key];
    await chrome.storage.local.set({pairs: storedPairs});
}

async function getAllPairsFromStorage() {
    const data = await chrome.storage.local.get("pairs");
    return data.pairs || {};
}

async function deleteAllPairsFromStorage() {
    await chrome.storage.local.set({pairs: {}});
}

function handleFirstTime() {
    chrome.storage.local.get("first_time", (data) => {
        if (!data.first_time) {
            // that's the first time the extension runs
            chrome.storage.local.set({first_time: false}, () => {
                setPairsInStorage({sout: "System.out.println();"});
            });
        }
    });
}

async function refreshPairsOnUI() {
    TABLE_CONTENTS.innerHTML = "";
    const pairs = await getAllPairsFromStorage();

    for (const key in pairs) {
        await addPairToUI(key, pairs[key]);
    }
}

async function handleTableElements() {
    // Delete all pairs from local storage to add updated ones
    await deleteAllPairsFromStorage();

    // Iterate over each pair div inside table_contents
    const pairDivs = TABLE_CONTENTS.querySelectorAll(".pair");
    const pairs = {};

    pairDivs.forEach(async (pairDiv) => {
        // Get the key and value inputs inside the current pair div
        const keyInput = pairDiv.querySelector("input[name='key']");
        const valueInput = pairDiv.querySelector("input[name='value']");

        // Get the values of key and value inputs and add them to the pairs array
        const key = keyInput.value;
        const value = valueInput.value;

        // Add the key value to pairs array
        pairs[key] = value;
    });

    // Update the storage with new macros
    await setPairsInStorage(pairs);
}
