// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Forward the message to the content script
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0] === undefined) return;
        chrome.tabs.sendMessage(tabs[0].id, request);
    });
});
