// ******************** Declare Variables ********************
// Declare the macros
const MACROS = {
    sout: "System.out.println()",
    psvm: "public static void main(String ...args) {\n}",
};

// Stack's max size should be this
const MAX_KEY_SIZE = maxKeySize(MACROS);

// Stack to store pressed keys
let keyStack = [];

// ************************ JS Starts ************************
document.addEventListener("keypress", handleKeyPress);

// ******************** Declare Functions ********************
function handleKeyPress(event) {
    // Push the pressed key onto the key stack
    keyStack.push(event.key);

    // Force the max stack size
    if (keyStack.length > MAX_KEY_SIZE) keyStack.shift();

    console.log(keyStack);

    // Check if the stacked keys match any macro key
    const stackedKeys = keyStack.join("");
    const macro = Object.keys(MACROS).find((key) => key.endsWith(stackedKeys));

    if (macro) {
        console.log("Macro:", macro);
        // Clear the key stack if a macro is found
        keyStack = [];
    }
}

function maxKeySize(macros) {
    let maxKeySize = 0;
    for (const key in macros) {
        if (key.length > maxKeySize) {
            maxKeySize = key.length;
        }
    }
    return maxKeySize;
}
