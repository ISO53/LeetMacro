// ******************** Declare Variables ********************
// Declare the macros
const MACROS = {};

// Stack's max size should be this
const MAX_KEY_SIZE = Object.keys(MACROS).reduce((max, key) => Math.max(max, key.length), 0);

// Stack to store pressed keys
let keyStack = [];

// UI element that holds key value pairs
const TABLE_CONTENTS = document.getElementById("table_contents");
console.log(TABLE_CONTENTS);

// ************************ JS Starts ************************
// Wait for the dom content to load
console.log("dom content loaded");

// Handle first time things
handleFirstTime();

// Add key press listener
document.addEventListener("keypress", handleKeyPress);

// Add click listener to add_new button to allow users to add new macros
document.getElementById("add_new").addEventListener("click", () => {
    addPairToUI();
});

// Add event listener to table that contains macros tu update macros every time user changes it
TABLE_CONTENTS.addEventListener("keypress", handleTableElements);

// Refresh pairs (macros) on the extension popup
refreshPairsOnUI();

// ******************** Declare Functions ********************
function handleKeyPress(event) {
    // Push the pressed key onto the key stack
    keyStack.push(event.key);
    console.log(keyStack);

    // Force the max stack size, RAM friendly.
    if (keyStack.length > MAX_KEY_SIZE) keyStack.shift();

    // Check if the stacked keys match any macro key
    const stackedKeys = keyStack.join("");
    const macro = Object.keys(MACROS).find((key) => key.endsWith(stackedKeys));

    if (macro) {
        // Clear the key stack if a macro is found
        keyStack = [];

        // Get the caret position based on viewport
        const pos = getCursorXY(event.target);

        // If there is previously created macro div, remove it
        const prevDiv = document.getElementById("leet_macro_value_div");
        if (prevDiv !== null) prevDiv.remove();

        // Create a div shows macro value
        const macroDiv = createMacroDiv(MACROS[macro], pos);

        // Place the div on that position
        document.body.appendChild(macroDiv);
    }
}

function getCursorXY(input) {
    // I don't know what the fuck is going on here but it works
    const {left: inputX, top: inputY} = input.getBoundingClientRect();
    const div = document.createElement("div");
    const copyStyle = getComputedStyle(input);
    for (const prop of copyStyle) div.style[prop] = copyStyle[prop];
    const swap = ".";
    const inputValue = input.tagName === "INPUT" ? input.value.replace(/ /g, swap) : input.value;
    const textContent = inputValue.substr(0, 1);
    div.textContent = textContent;
    if (input.tagName === "TEXTAREA") div.style.height = "auto";
    if (input.tagName === "INPUT") div.style.width = "auto";
    const span = document.createElement("span");
    span.textContent = inputValue.substr(1) || ".";
    div.appendChild(span);
    document.body.appendChild(div);
    const {left: spanX, top: spanY} = span.getBoundingClientRect();
    document.body.removeChild(div);
    return {x: inputX, y: inputY};
}

function createMacroDiv(macro, pos) {
    const div = document.createElement("div");
    div.id = "leet_macro_value_div";
    div.style.top = pos.y - 6 + "px";
    div.style.left = pos.x + 10 + "px";
    div.style.position = "absolute";
    div.style.backgroundColor = "#262626";
    div.style.color = "#f5f5f5";
    div.style.fontFamily = "Consolas, 'Courier New', monospace";
    div.style.fontSize = "13px";
    div.style.padding = "5px";
    div.style.minWidth = "10px";
    div.style.maxWidth = "250px";
    div.style.height = "auto";
    div.style.textWrap = "nowrap";
    div.style.textOverflow = "ellipsis";
    div.style.overflow = "hidden";
    div.style.border = "1px solid rgba(255, 255, 255, 0.2)";
    div.style.borderRadius = "5px";
    div.style.userSelect = "none";
    div.innerHTML = macro;

    // Add event listener for accepting or rejecting macro value
    document.addEventListener("keydown", macroDivListener);

    function macroDivListener(event) {
        const prevDiv = document.getElementById("leet_macro_value_div");
        if (prevDiv !== null) prevDiv.remove();
        document.removeEventListener("keydown", macroDivListener);

        switch (event.key) {
            case "Enter":
                event.preventDefault();
                insertTextAtCaret(macro);
                break;
            case "Escape":
                event.preventDefault();
                break;
            default:
                break;
        }
    }

    return div;
}

function insertTextAtCaret(text) {
    const element = findCaretElement();

    if (element) {
        const caretStart = element.selectionStart;
        const caretEnd = element.selectionEnd;

        const currentText = element.value;
        const textBeforeCaret = currentText.substring(0, caretStart);
        const textAfterCaret = currentText.substring(caretEnd);

        // Determine the macro key present at the caret position
        const macroKey = Object.keys(MACROS).find((key) => textBeforeCaret.endsWith(key));

        if (macroKey) {
            // Determine the length of the macro key
            const macroKeyLength = macroKey.length;

            // Remove the macro key from the text before caret
            const textBeforeMacroKey = textBeforeCaret.substring(0, caretStart - macroKeyLength);

            const newText = textBeforeMacroKey + text + textAfterCaret;
            element.value = newText;

            const newCaretPos = textBeforeMacroKey.length + text.length;
            element.setSelectionRange(newCaretPos, newCaretPos);

            element.dispatchEvent(new Event("input"));
        }
    }

    function findCaretElement() {
        const focusedElement = document.activeElement;
        if (
            focusedElement.tagName === "TEXTAREA" ||
            (focusedElement.tagName === "INPUT" && focusedElement.type !== "submit" && focusedElement.type !== "button")
        ) {
            return focusedElement;
        }

        let currentElement = focusedElement.parentElement;
        while (currentElement) {
            if (
                currentElement.tagName === "TEXTAREA" ||
                (currentElement.tagName === "INPUT" && currentElement.type !== "submit" && currentElement.type !== "button")
            ) {
                return currentElement;
            }
            currentElement = currentElement.parentElement;
        }

        return null;
    }
}

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
    imgDelete.addEventListener("click", () => {
        console.log("asdad");
        deletePair(inputKey.value);
        refreshPairsOnUI();
    });

    // Append the elements to the div
    div.appendChild(inputKey);
    div.appendChild(inputValue);
    div.appendChild(imgDelete);

    // Add the new pair to local storage
    addPair(key, value);

    // Append the div to the table_contents div
    TABLE_CONTENTS.appendChild(div);
}

function addPair(key, value) {
    if (key === "" || key == null || key == undefined || value === "" || value == null || value == undefined) return;
    const storedPairs = JSON.parse(localStorage.getItem("pairs")) || {};
    storedPairs[key] = value;
    localStorage.setItem("pairs", JSON.stringify(storedPairs));
}

function deletePair(key) {
    const storedPairs = JSON.parse(localStorage.getItem("pairs")) || {};
    delete storedPairs[key];
    localStorage.setItem("pairs", JSON.stringify(storedPairs));
}

function getAllPairs() {
    return JSON.parse(localStorage.getItem("pairs")) || {};
}

function deleteAllPairs() {
    localStorage.setItem("pairs", JSON.stringify({}));
}

function refreshPairsOnUI() {
    TABLE_CONTENTS.innerHTML = "";
    const pairs = getAllPairs();

    for (const key in pairs) {
        addPairToUI(key, pairs[key]);
    }
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleTableElements() {
    // Add small delay to capture user's last key press (bug fix)
    await delay(50);

    // Get the table_contents element
    const tableContents = TABLE_CONTENTS;

    // Delete all pairs from local storage to add updated ones
    deleteAllPairs();

    // Iterate over each pair div inside table_contents
    const pairDivs = tableContents.querySelectorAll(".pair");
    pairDivs.forEach((pairDiv) => {
        // Get the key and value inputs inside the current pair div
        const keyInput = pairDiv.querySelector("input[name='key']");
        const valueInput = pairDiv.querySelector("input[name='value']");

        // Get the values of key and value inputs and add them to the keyValuePairs array
        const key = keyInput.value;
        const value = valueInput.value;

        // Add the key value pairs to local storage
        addPair(key, value);
    });

    // Clear the MACROS object
    Object.keys(MACROS).forEach((key) => delete MACROS[key]);

    // Get all pairs from local storage
    const allPairs = getAllPairs();

    // Add each pair to the MACROS object
    Object.keys(allPairs).forEach((key) => {
        MACROS[key] = allPairs[key];
    });

    console.log(MACROS);
}

function handleFirstTime() {
    if (!localStorage.getItem("first_time")) {
        // that's the first time the extension runs
        localStorage.setItem("first_time", false);
        addPair("sout", "System.out.println();");
    }
}
