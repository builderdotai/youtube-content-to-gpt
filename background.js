// Background service worker for YouTube Lyrics to GPT extension

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("YouTube Lyrics to GPT extension installed");

    // Set default settings
    chrome.storage.sync.set({
      enabled: true,
      autoOpenGPT: true,
      promptTemplate: "Please summarize the following lyrics:\n\n{lyrics}",
    });
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSettings") {
    chrome.storage.sync.get(
      ["enabled", "autoOpenGPT", "promptTemplate"],
      (result) => {
        sendResponse(result);
      }
    );
    return true; // Keep the message channel open for async response
  }

  if (request.action === "saveSettings") {
    chrome.storage.sync.set(request.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === "openGPT") {
    const gptUrl = `https://chat.openai.com/?prompt=${encodeURIComponent(
      request.prompt
    )}`;
    chrome.tabs.create({ url: gptUrl });
    sendResponse({ success: true });
  }
});

// Handle tab updates to inject content script when needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.includes("youtube.com/watch")
  ) {
    // Inject content script if not already injected
    chrome.scripting
      .executeScript({
        target: { tabId: tabId },
        files: ["content.js"],
      })
      .catch(() => {
        // Script might already be injected, ignore error
      });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    // Send message to content script to extract lyrics
    chrome.tabs.sendMessage(tab.id, { action: "extractLyrics" }, (response) => {
      if (response && response.lyrics) {
        // Get settings for prompt template
        chrome.storage.sync.get(["promptTemplate"], (result) => {
          const promptTemplate =
            result.promptTemplate ||
            "Please summarize the following lyrics:\n\n{lyrics}";
          const prompt = promptTemplate.replace("{lyrics}", response.lyrics);

          // Open GPT with the prompt
          const gptUrl = `https://chat.openai.com/?prompt=${encodeURIComponent(
            prompt
          )}`;
          chrome.tabs.create({ url: gptUrl });
        });
      } else {
        // Show popup if no lyrics found
        chrome.action.setPopup({ tabId: tab.id, popup: "popup.html" });
      }
    });
  } else {
    // Show popup for non-YouTube pages
    chrome.action.setPopup({ tabId: tab.id, popup: "popup.html" });
  }
});
