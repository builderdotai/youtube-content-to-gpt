// Content script for YouTube Content to GPT extension

let summaryButton = null;
let isButtonAdded = false;

// SVG icon for the button (AI/Chat bubble)
const aiIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" rx="10" fill="#764ba2"/><path d="M6.5 8.5C6.5 7.11929 7.61929 6 9 6H11C12.3807 6 13.5 7.11929 13.5 8.5V11.5C13.5 12.8807 12.3807 14 11 14H9C7.61929 14 6.5 12.8807 6.5 11.5V8.5Z" fill="white"/><circle cx="8.5" cy="10" r="0.75" fill="#764ba2"/><circle cx="10" cy="10" r="0.75" fill="#764ba2"/><circle cx="11.5" cy="10" r="0.75" fill="#764ba2"/></svg>`;

function createSummaryButton() {
  if (summaryButton) return summaryButton;
  const button = document.createElement("button");
  button.id = "yt-ai-summary-btn";
  button.innerHTML = `${aiIcon}<span style="margin-left:8px; font-weight:500;">AI Transcript & Summary</span>`;
  button.title = "Extract transcript or description and summarize in ChatGPT";
  button.className = "yt-ai-summary-button";
  button.addEventListener("click", handleSummaryButtonClick);
  summaryButton = button;
  return button;
}

async function handleSummaryButtonClick() {
  try {
    const button = document.getElementById("yt-ai-summary-btn");
    const originalText = button.innerHTML;
    button.innerHTML = "⏳ Extracting...";
    button.disabled = true;
    // Try to extract transcript
    let transcript = await extractTranscript();
    if (!transcript) {
      // Fallback to description
      transcript = extractDescription();
    }
    if (!transcript) {
      alert("No transcript or description found.");
      button.innerHTML = originalText;
      button.disabled = false;
      return;
    }
    await navigator.clipboard.writeText(transcript);
    const prompt = `Summarize the following YouTube video transcript/content:\n\n${transcript}`;
    const gptUrl = `https://chat.openai.com/?prompt=${encodeURIComponent(
      prompt
    )}`;
    window.open(gptUrl, "_blank");
    button.innerHTML = "✅ Copied!";
    setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
    }, 2000);
  } catch (error) {
    alert("Error extracting transcript.");
    const button = document.getElementById("yt-ai-summary-btn");
    button.innerHTML = "AI Transcript & Summary";
    button.disabled = false;
  }
}

// Try to extract transcript from YouTube's transcript panel
async function extractTranscript() {
  // Try to find transcript panel (if open)
  const transcriptPanel = document.querySelector(
    "ytd-transcript-segment-list-renderer"
  );
  if (transcriptPanel) {
    const segments = transcriptPanel.querySelectorAll("yt-formatted-string");
    let transcript = "";
    segments.forEach((seg) => {
      transcript += seg.textContent + "\n";
    });
    if (transcript.length > 30) return transcript.trim();
  }
  // Try to open transcript panel programmatically (if possible)
  // Not all videos have transcripts, and YouTube may restrict this
  // Optionally, could try to click the "Show transcript" button if present
  return null;
}

function extractDescription() {
  const desc = document.querySelector(
    "#description #description-text, #description yt-formatted-string"
  );
  if (desc) {
    return desc.textContent.trim();
  }
  return null;
}

function addButtonToYouTube() {
  if (isButtonAdded) return;
  // Place below video title or near action buttons
  const titleContainer =
    document.querySelector("#title.ytd-video-primary-info-renderer") ||
    document.querySelector("h1.title");
  if (titleContainer) {
    const button = createSummaryButton();
    // Insert after the title
    titleContainer.parentNode.insertBefore(button, titleContainer.nextSibling);
    isButtonAdded = true;
    return;
  }
  // Fallback: try to add to action buttons
  const actionContainer = document.querySelector(
    "#top-level-buttons-computed, #actions-inner, #menu-container"
  );
  if (actionContainer) {
    const button = createSummaryButton();
    actionContainer.appendChild(button);
    isButtonAdded = true;
  }
}

function removeButton() {
  const button = document.getElementById("yt-ai-summary-btn");
  if (button) {
    button.remove();
    isButtonAdded = false;
  }
}

const observer = new MutationObserver(() => {
  const isVideoPage = window.location.pathname === "/watch";
  if (isVideoPage) {
    addButtonToYouTube();
  } else {
    removeButton();
  }
});

function initializeExtension() {
  const isVideoPage = window.location.pathname === "/watch";
  if (isVideoPage) {
    addButtonToYouTube();
  }
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeExtension);
} else {
  initializeExtension();
}

window.addEventListener("yt-navigate-finish", () => {
  setTimeout(() => {
    const isVideoPage = window.location.pathname === "/watch";
    if (isVideoPage) {
      addButtonToYouTube();
    } else {
      removeButton();
    }
  }, 1000);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractTranscript") {
    extractTranscript().then((transcript) => {
      sendResponse({ transcript: transcript });
    });
    return true;
  }
});
