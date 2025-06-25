// Content script for YouTube Content to GPT extension
// This file provides content extraction functionality for the popup

// This script runs on YouTube pages to support the popup extension
// No UI elements are added to the page - everything works through the popup

console.log('YouTube Content to GPT extension loaded');

// Listen for messages from popup (if needed for future features)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'ping') {
        sendResponse({ status: 'content script ready' });
    }
    return true;
});

// Note: Content extraction is handled directly in popup.js via executeScript
// This keeps the extension lightweight and non-intrusive