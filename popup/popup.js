// ******************** Declare Variables ********************
// UI element that holds key value pairs
const TABLE_CONTENTS = document.getElementById("table_contents");

// ************************ JS Starts ************************
// Handle first time things
handleFirstTime();

// Add click listener to add_new button to allow users to add new macros
document.getElementById("add_new").addEventListener("click", () => {
    addPairToUI();
});

// Refresh pairs (macros) on the extension popup
refreshPairsOnUI();

// ******************** Declare Functions ********************
function addPairToUI(key, value) {
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
    inputKey.addEventListener("input", handleTableElements);

    const inputValue = document.createElement("input");
    inputValue.className = "input";
    inputValue.type = "text";
    inputValue.name = "value";
    inputValue.placeholder = "value here";
    if (value) inputValue.value = value;
    inputValue.autocomplete = "off";
    inputValue.spellcheck = "false";
    inputValue.addEventListener("input", handleTableElements);

    const imgDelete = document.createElement("img");
    imgDelete.className = "icon delete";
    imgDelete.src = "res/trash.svg";
    imgDelete.alt = "";
    imgDelete.addEventListener("click", () => {
        deletePairFromStorage(inputKey.value);
        sendMessageToContentScript("macros", getAllPairsFromStorage());
        refreshPairsOnUI();
    });

    // Append the elements to the div
    div.appendChild(inputKey);
    div.appendChild(inputValue);
    div.appendChild(imgDelete);

    // Add the new pair to local storage
    addPairToStorage(key, value);

    // Append the div to the table_contents div
    TABLE_CONTENTS.appendChild(div);
}

function addPairToStorage(key, value) {
    if (key === "" || key == null || key == undefined || value === "" || value == null || value == undefined) return;
    const storedPairs = JSON.parse(localStorage.getItem("pairs")) || {};
    storedPairs[key] = value;
    localStorage.setItem("pairs", JSON.stringify(storedPairs));
}

function deletePairFromStorage(key) {
    const storedPairs = JSON.parse(localStorage.getItem("pairs")) || {};
    delete storedPairs[key];
    localStorage.setItem("pairs", JSON.stringify(storedPairs));
}

function getAllPairsFromStorage() {
    return JSON.parse(localStorage.getItem("pairs")) || {};
}

function deleteAllPairsFromStorage() {
    localStorage.setItem("pairs", JSON.stringify({}));
}

function handleFirstTime() {
    if (!localStorage.getItem("first_time")) {
        // that's the first time the extension runs
        localStorage.setItem("first_time", false);
        addPairToStorage("sout", "System.out.println();");
    }
}

}

function refreshPairsOnUI() {
    TABLE_CONTENTS.innerHTML = "";
    const pairs = getAllPairsFromStorage();

    for (const key in pairs) {
        addPairToUI(key, pairs[key]);
    }
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function handleTableElements() {
    // Get the table_contents element
    const tableContents = TABLE_CONTENTS;

    // Delete all pairs from local storage to add updated ones
    deleteAllPairsFromStorage();

    // Iterate over each pair div inside table_contents
    const pairDivs = tableContents.querySelectorAll(".pair");
    pairDivs.forEach((pairDiv) => {
        // Get the key and value inputs inside the current pair div
        const keyInput = pairDiv.querySelector("input[name='key']");
        const valueInput = pairDiv.querySelector("input[name='value']");

        // Get the values of key and value inputs and add them to the pairs array
        const key = keyInput.value;
        const value = valueInput.value;

        // Add the key value pairs to local storage
        addPairToStorage(key, value);
    });

    // Get all pairs from local storage
    const allPairs = getAllPairsFromStorage();

}
