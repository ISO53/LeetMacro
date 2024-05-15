// Listen for messages from both the popup script and content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // If the sender is from a content script
    if (sender.tab) {
        // Forward the message to the popup script
        chrome.runtime.sendMessage(request);
    } else {
        // Forward the message to the content script
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0] === undefined) return;
            chrome.tabs.sendMessage(tabs[0].id, request);
        });
    }
});
