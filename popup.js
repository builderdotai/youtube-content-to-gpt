document.addEventListener('DOMContentLoaded', function() {
    const extractBtn = document.getElementById('extractBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const status = document.getElementById('status');
    
    // Load user settings
    let userSettings = null;
    loadUserSettings();
    
    // Settings button click handler
    settingsBtn.addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });
    
    extractBtn.addEventListener('click', function() {
        showStatus('Extracting content...', 'loading');
        extractBtn.disabled = true;
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            
            // Check if we're on YouTube
            if (!currentTab.url.includes('youtube.com/watch')) {
                showError('Please navigate to a YouTube video page first.');
                return;
            }
            
            chrome.scripting.executeScript({
                target: {tabId: currentTab.id},
                function: extractYouTubeContent
            }, (result) => {
                extractBtn.disabled = false;
                
                if (chrome.runtime.lastError) {
                    showError('Failed to access page content: ' + chrome.runtime.lastError.message);
                    return;
                }
                
                if (result && result[0] && result[0].result) {
                    const content = result[0].result;
                    if (content.error) {
                        showError(content.error);
                    } else {
                        showStatus('Opening ChatGPT...', 'success');
                        openChatGPTWithContent(content);
                        setTimeout(() => window.close(), 1000);
                    }
                } else {
                    showError('Failed to extract content from the page.');
                }
            });
        });
    });
    
    function showStatus(message, type) {
        status.textContent = message;
        status.className = `status ${type}`;
        status.classList.remove('hidden');
    }
    
    function showError(message) {
        showStatus(message, 'error');
    }
    
    async function loadUserSettings() {
        try {
            const defaultSettings = window.ExtensionConfig.DEFAULT_SETTINGS;
            const result = await chrome.storage.sync.get(defaultSettings);
            userSettings = result;
        } catch (error) {
            console.error('Error loading settings:', error);
            // Use defaults if storage fails
            userSettings = window.ExtensionConfig.DEFAULT_SETTINGS;
        }
    }
});

function extractYouTubeContent() {
    try {
        // Get selectors from shared configuration
        const selectors = window.ExtensionConfig.YOUTUBE_SELECTORS;
        const titleSelectors = selectors.title;
        
        let videoTitle = 'Unknown Title';
        for (const selector of titleSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                videoTitle = element.textContent.trim();
                break;
            }
        }
        
        // Multiple methods to extract transcript/content
        let transcript = '';
        let contentSource = '';
        
        // Method 1: Look for visible transcript/captions
        const transcriptSelectors = selectors.transcript;
        
        for (const selector of transcriptSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                transcript = Array.from(elements)
                    .map(el => el.textContent.trim())
                    .filter(text => text.length > 0)
                    .join(' ');
                contentSource = 'transcript';
                break;
            }
        }
        
        // Method 2: Try to get video description
        if (!transcript) {
            const descriptionSelectors = selectors.description;
            
            for (const selector of descriptionSelectors) {
                const element = document.querySelector(selector);
                if (element && element.textContent.trim()) {
                    transcript = element.textContent.trim();
                    contentSource = 'description';
                    break;
                }
            }
        }
        
        // Method 3: Extract comments as fallback
        if (!transcript) {
            const commentElements = document.querySelectorAll(selectors.comments[0]);
            if (commentElements.length > 0) {
                const comments = Array.from(commentElements)
                    .slice(0, 5) // First 5 comments
                    .map(el => el.textContent.trim())
                    .filter(text => text.length > 10)
                    .join('\n\n');
                
                if (comments) {
                    transcript = `Top comments:\n${comments}`;
                    contentSource = 'comments';
                }
            }
        }
        
        if (!transcript) {
            // Debug: Try to find any text content on the page
            const allText = document.body.innerText || document.body.textContent || '';
            const videoInfo = allText.substring(0, 500); // First 500 chars as fallback
            
            if (videoInfo.trim().length > 50) {
                transcript = `Page content preview: ${videoInfo.trim()}`;
                contentSource = 'page-content';
            } else {
                return {
                    error: 'No content found. Please make sure the video has captions, description, or comments available. Try refreshing the page and waiting for it to fully load.'
                };
            }
        }
        
        // Get video metadata using shared selectors
        let channelName = 'Unknown Channel';
        for (const selector of selectors.channel) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                channelName = element.textContent.trim();
                break;
            }
        }
        
        const viewCount = document.querySelector(selectors.viewCount.join(', '))?.textContent?.trim() || '';
        const publishDate = document.querySelector(selectors.publishDate.join(', '))?.textContent?.trim() || '';
        
        return {
            title: videoTitle,
            channel: channelName,
            url: window.location.href,
            transcript: transcript,
            contentSource: contentSource,
            metadata: {
                views: viewCount,
                published: publishDate
            }
        };
    } catch (error) {
        return {
            error: `Failed to extract content: ${error.message}`
        };
    }
}

function openChatGPTWithContent(content) {
    // Use userSettings if available, fallback to defaults
    const settings = userSettings || {
        aiProvider: 'chatgpt',
        customUrl: '',
        customPrompt: 'Please summarize this YouTube video: {title}\n\nContent: {content}',
        autoOpen: true
    };
    
    // Create prompt using template with variable substitution
    let prompt = settings.customPrompt;
    
    // Replace template variables
    const variables = {
        title: content.title || 'Unknown Title',
        channel: content.channel || 'Unknown Channel',
        url: content.url || '',
        content: content.transcript || '',
        views: content.metadata?.views || '',
        published: content.metadata?.published || '',
        contentSource: content.contentSource || 'unknown'
    };
    
    // Replace all variables in the prompt
    Object.keys(variables).forEach(key => {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        prompt = prompt.replace(regex, variables[key]);
    });
    
    // Handle conditional variables using helper function
    prompt = replaceConditionalVariables(prompt, variables);
    
    // Get AI providers from shared configuration
    const AI_PROVIDERS = window.ExtensionConfig.AI_PROVIDERS;
    
    let targetUrl;
    if (settings.aiProvider === 'custom' && settings.customUrl) {
        targetUrl = settings.customUrl;
    } else {
        const provider = AI_PROVIDERS[settings.aiProvider] || AI_PROVIDERS.chatgpt;
        targetUrl = provider.url;
    }
    
    // Replace {content} placeholder in URL with encoded prompt
    const encodedPrompt = encodeURIComponent(prompt);
    targetUrl = targetUrl.replace('{content}', encodedPrompt);
    
    // Open the AI provider
    if (settings.autoOpen !== false) {
        chrome.tabs.create({ url: targetUrl });
    }
}