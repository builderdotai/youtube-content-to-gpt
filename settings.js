// Settings Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const aiProviderSelect = document.getElementById('aiProvider');
    const customUrlGroup = document.getElementById('customUrlGroup');
    const customUrlInput = document.getElementById('customUrl');
    const customPromptTextarea = document.getElementById('customPrompt');
    const templateButtons = document.querySelectorAll('[data-template]');
    const saveButton = document.getElementById('saveSettings');
    const resetButton = document.getElementById('resetSettings');
    const exportButton = document.getElementById('exportSettings');
    const importButton = document.getElementById('importSettings');
    const importFile = document.getElementById('importFile');
    const statusDiv = document.getElementById('status');
    
    // Checkboxes
    const extractTranscript = document.getElementById('extractTranscript');
    const extractDescription = document.getElementById('extractDescription');
    const extractComments = document.getElementById('extractComments');
    const autoOpen = document.getElementById('autoOpen');
    const closePopup = document.getElementById('closePopup');

    // AI Providers Configuration
    const AI_PROVIDERS = {
        chatgpt: {
            name: 'ChatGPT',
            url: 'https://chat.openai.com/?q={content}',
            description: 'OpenAI ChatGPT'
        },
        claude: {
            name: 'Claude',
            url: 'https://claude.ai/chat?q={content}',
            description: 'Anthropic Claude'
        },
        gemini: {
            name: 'Gemini',
            url: 'https://gemini.google.com/app?q={content}',
            description: 'Google Gemini'
        },
        custom: {
            name: 'Custom',
            url: '',
            description: 'Custom AI Provider'
        }
    };

    // Prompt Templates
    const PROMPT_TEMPLATES = {
        default: `Please summarize the following YouTube video content:

**Video Details:**
- Title: {title}
- Channel: {channel}
- URL: {url}
{views ? \`- Views: \${views}\` : ''}
{published ? \`- Published: \${published}\` : ''}

**Content:**
{content}

**Instructions:**
Please provide a comprehensive summary including:
1. Main topic and key points
2. Important insights or takeaways
3. Any actionable advice or conclusions
4. Target audience or use cases (if apparent)

Format your response in a clear, structured manner with bullet points or sections as appropriate.`,

        academic: `Analyze the following YouTube video content from an academic perspective:

**Video Information:**
- Title: {title}
- Channel: {channel}
- Source: {url}

**Content for Analysis:**
{content}

**Academic Analysis Required:**
1. **Main Thesis/Argument**: What is the central claim or thesis?
2. **Evidence & Support**: What evidence or examples are provided?
3. **Methodology**: What approach or methods are discussed?
4. **Credibility Assessment**: Evaluate the reliability of sources and claims
5. **Academic Context**: How does this relate to existing research or theory?
6. **Critical Evaluation**: Strengths and weaknesses of the arguments
7. **Further Research**: Questions or areas that need more investigation

Please provide a scholarly analysis with proper academic rigor.`,

        business: `Provide a business-focused analysis of this YouTube video content:

**Business Context:**
- Video: {title}
- Creator: {channel}
- Link: {url}

**Content to Analyze:**
{content}

**Business Analysis Framework:**
1. **Key Business Insights**: What are the main business takeaways?
2. **Market Implications**: How does this affect markets or industries?
3. **Strategic Opportunities**: What opportunities does this present?
4. **Risk Assessment**: What risks or challenges are highlighted?
5. **Competitive Analysis**: Any insights about competitors or market positioning?
6. **Action Items**: Specific, actionable business recommendations
7. **ROI Considerations**: Potential return on investment for suggested actions
8. **Implementation Strategy**: How to apply these insights practically

Focus on practical business applications and strategic thinking.`,

        simple: `Please give me a simple summary of this YouTube video:

**Video:** {title}
**Channel:** {channel}

**Content:**
{content}

**Please summarize in simple terms:**
- What is this video about?
- What are the main points?
- Why is it important or interesting?
- What should I remember from this?

Keep it short and easy to understand.`
    };

    // Default Settings
    const DEFAULT_SETTINGS = {
        aiProvider: 'chatgpt',
        customUrl: '',
        customPrompt: PROMPT_TEMPLATES.default,
        extractTranscript: true,
        extractDescription: true,
        extractComments: true,
        autoOpen: true,
        closePopup: true
    };

    // Load Settings on Page Load
    loadSettings();

    // Event Listeners
    aiProviderSelect.addEventListener('change', handleProviderChange);
    templateButtons.forEach(button => {
        button.addEventListener('click', handleTemplateSelect);
    });
    saveButton.addEventListener('click', saveSettings);
    resetButton.addEventListener('click', resetSettings);
    exportButton.addEventListener('click', exportSettings);
    importButton.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', importSettings);

    // Functions
    function handleProviderChange() {
        const isCustom = aiProviderSelect.value === 'custom';
        customUrlGroup.style.display = isCustom ? 'block' : 'none';
        
        if (!isCustom) {
            customUrlInput.value = AI_PROVIDERS[aiProviderSelect.value].url;
        }
    }

    function handleTemplateSelect(event) {
        const template = event.target.dataset.template;
        if (PROMPT_TEMPLATES[template]) {
            customPromptTextarea.value = PROMPT_TEMPLATES[template];
            showStatus('Template applied successfully!', 'success');
        }
    }

    async function loadSettings() {
        try {
            const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
            
            // Apply settings to UI
            aiProviderSelect.value = result.aiProvider;
            customUrlInput.value = result.customUrl;
            customPromptTextarea.value = result.customPrompt;
            extractTranscript.checked = result.extractTranscript;
            extractDescription.checked = result.extractDescription;
            extractComments.checked = result.extractComments;
            autoOpen.checked = result.autoOpen;
            closePopup.checked = result.closePopup;
            
            // Trigger provider change to show/hide custom URL
            handleProviderChange();
            
        } catch (error) {
            console.error('Error loading settings:', error);
            showStatus('Error loading settings. Using defaults.', 'error');
        }
    }

    async function saveSettings() {
        try {
            const settings = {
                aiProvider: aiProviderSelect.value,
                customUrl: customUrlInput.value,
                customPrompt: customPromptTextarea.value,
                extractTranscript: extractTranscript.checked,
                extractDescription: extractDescription.checked,
                extractComments: extractComments.checked,
                autoOpen: autoOpen.checked,
                closePopup: closePopup.checked
            };

            await chrome.storage.sync.set(settings);
            showStatus('Settings saved successfully!', 'success');
            
        } catch (error) {
            console.error('Error saving settings:', error);
            showStatus('Error saving settings. Please try again.', 'error');
        }
    }

    async function resetSettings() {
        if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            return;
        }

        try {
            await chrome.storage.sync.clear();
            await loadSettings();
            showStatus('Settings reset to defaults successfully!', 'success');
            
        } catch (error) {
            console.error('Error resetting settings:', error);
            showStatus('Error resetting settings. Please try again.', 'error');
        }
    }

    async function exportSettings() {
        try {
            const settings = await chrome.storage.sync.get();
            const dataStr = JSON.stringify(settings, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'youtube-to-gpt-settings.json';
            link.click();
            
            URL.revokeObjectURL(url);
            showStatus('Settings exported successfully!', 'success');
            
        } catch (error) {
            console.error('Error exporting settings:', error);
            showStatus('Error exporting settings. Please try again.', 'error');
        }
    }

    function importSettings() {
        const file = importFile.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const settings = JSON.parse(e.target.result);
                
                // Validate settings structure
                if (typeof settings !== 'object' || settings === null) {
                    throw new Error('Invalid settings file format');
                }

                await chrome.storage.sync.set(settings);
                await loadSettings();
                showStatus('Settings imported successfully!', 'success');
                
            } catch (error) {
                console.error('Error importing settings:', error);
                showStatus('Error importing settings. Please check the file format.', 'error');
            }
        };
        
        reader.readAsText(file);
        importFile.value = ''; // Reset file input
    }

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status show ${type}`;
        
        setTimeout(() => {
            statusDiv.classList.remove('show');
        }, 3000);
    }

    // Expose functions for testing (optional)
    if (typeof window !== 'undefined') {
        window.settingsAPI = {
            loadSettings,
            saveSettings,
            resetSettings,
            AI_PROVIDERS,
            PROMPT_TEMPLATES
        };
    }
});