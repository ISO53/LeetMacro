// ******************** Declare Variables ********************
// Declare the macros
const MACROS = {};

// Stack's max size should be this
var MAX_KEY_SIZE = 0;

// Stack to store pressed keys
var keyStack = [];

// App started or not
var appStarted = false;

// ************************ JS Starts ************************
document.addEventListener("DOMContentLoaded", startApp);

// Fallback for immediate execution if the document is already loaded
if (!appStarted && (document.readyState === "complete" || document.readyState === "interactive")) {
    startApp();
}


        // Re-calculate the max key size
        MAX_KEY_SIZE = Object.keys(MACROS).reduce((max, key) => Math.max(max, key.length), 0);
    }
});

// ******************** Declare Functions ********************
function startApp() {
    appStarted = true;

    // Add key press listener
    document.addEventListener("keypress", handleKeyPress);
}

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

    });
}
