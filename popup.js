document.addEventListener('DOMContentLoaded', function() {
    const extractBtn = document.getElementById('extractBtn');
    const status = document.getElementById('status');
    
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
});

function extractYouTubeContent() {
    try {
        // Multiple selectors for video title (YouTube changes these frequently)
        const titleSelectors = [
            'h1.ytd-watch-metadata yt-formatted-string',
            'h1.ytd-video-primary-info-renderer yt-formatted-string', 
            'h1.style-scope.ytd-watch-metadata',
            'h1.style-scope.ytd-video-primary-info-renderer',
            'h1[class*="title"]',
            '.title.style-scope.ytd-video-primary-info-renderer',
            'yt-formatted-string.style-scope.ytd-watch-metadata'
        ];
        
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
        const transcriptSelectors = [
            '[data-start-time]',
            '.ytd-transcript-segment-renderer',
            '.cue-group-start-offset'
        ];
        
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
            const descriptionSelectors = [
                '#description-text',
                '.ytd-watch-metadata #description-text',
                '.ytd-watch-metadata .content',
                '#description .content',
                '.content.style-scope.ytd-video-secondary-info-renderer',  
                'ytd-expandable-video-description-body-renderer #description-text',
                'ytd-video-description-content-renderer .content'
            ];
            
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
            const commentElements = document.querySelectorAll('#content-text');
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
        
        // Get video metadata
        const channelSelectors = [
            '.ytd-watch-metadata #channel-name a',
            '#channel-name a', 
            '.ytd-channel-name a',
            'ytd-video-owner-renderer a#text',
            '.owner-text a'
        ];
        
        let channelName = 'Unknown Channel';
        for (const selector of channelSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                channelName = element.textContent.trim();
                break;
            }
        }
        
        const viewCount = document.querySelector('#info .view-count, .view-count, .ytd-watch-metadata .view-count')?.textContent?.trim() || '';
        const publishDate = document.querySelector('#info-strings yt-formatted-string, .date, .ytd-watch-metadata .date')?.textContent?.trim() || '';
        
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
    const prompt = `Please summarize the following YouTube video content:

**Video Details:**
- Title: ${content.title}
- Channel: ${content.channel}
- URL: ${content.url}
${content.metadata.views ? `- Views: ${content.metadata.views}` : ''}
${content.metadata.published ? `- Published: ${content.metadata.published}` : ''}

**Content Source:** ${content.contentSource}

**Content:**
${content.transcript}

**Instructions:**
Please provide a comprehensive summary including:
1. Main topic and key points
2. Important insights or takeaways
3. Any actionable advice or conclusions
4. Target audience or use cases (if apparent)

Format your response in a clear, structured manner with bullet points or sections as appropriate.`;
    
    const encodedPrompt = encodeURIComponent(prompt);
    const chatGPTUrl = `https://chat.openai.com/?q=${encodedPrompt}`;
    
    chrome.tabs.create({ url: chatGPTUrl });
}