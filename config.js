// Shared Configuration for YouTube Content to GPT Extension

// AI Providers Configuration
const AI_PROVIDERS = {
    chatgpt: {
        name: 'ChatGPT',
        url: 'https://chat.openai.com/?q={content}',
        description: 'OpenAI ChatGPT',
        icon: '🤖'
    },
    claude: {
        name: 'Claude',
        url: 'https://claude.ai/chat?q={content}',
        description: 'Anthropic Claude',
        icon: '🧠'
    },
    gemini: {
        name: 'Gemini',
        url: 'https://gemini.google.com/app?q={content}',
        description: 'Google Gemini',
        icon: '💎'
    },
    custom: {
        name: 'Custom',
        url: '',
        description: 'Custom AI Provider',
        icon: '⚙️'
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

// Content Extraction Selectors (YouTube frequently changes these)
const YOUTUBE_SELECTORS = {
    title: [
        'h1.ytd-watch-metadata yt-formatted-string',
        'h1.ytd-video-primary-info-renderer yt-formatted-string',
        'h1.style-scope.ytd-watch-metadata',
        'h1.style-scope.ytd-video-primary-info-renderer',
        'h1[class*="title"]',
        '.title.style-scope.ytd-video-primary-info-renderer',
        'yt-formatted-string.style-scope.ytd-watch-metadata'
    ],
    transcript: [
        '[data-start-time]',
        '.ytd-transcript-segment-renderer',
        '.cue-group-start-offset'
    ],
    description: [
        '#description-text',
        '.ytd-watch-metadata #description-text',
        '.ytd-watch-metadata .content',
        '#description .content',
        '.content.style-scope.ytd-video-secondary-info-renderer',
        'ytd-expandable-video-description-body-renderer #description-text',
        'ytd-video-description-content-renderer .content'
    ],
    channel: [
        '.ytd-watch-metadata #channel-name a',
        '#channel-name a',
        '.ytd-channel-name a',
        'ytd-video-owner-renderer a#text',
        '.owner-text a'
    ],
    comments: ['#content-text'],
    viewCount: ['#info .view-count', '.view-count', '.ytd-watch-metadata .view-count'],
    publishDate: ['#info-strings yt-formatted-string', '.date', '.ytd-watch-metadata .date']
};

// Utility Functions
const ConfigUtils = {
    /**
     * Get AI provider configuration by key
     * @param {string} providerKey - The provider key (chatgpt, claude, etc.)
     * @returns {Object|null} Provider configuration or null if not found
     */
    getProvider(providerKey) {
        return AI_PROVIDERS[providerKey] || null;
    },

    /**
     * Get all available AI providers
     * @returns {Object} All AI providers
     */
    getAllProviders() {
        return { ...AI_PROVIDERS };
    },

    /**
     * Get prompt template by key
     * @param {string} templateKey - The template key
     * @returns {string|null} Template string or null if not found
     */
    getTemplate(templateKey) {
        return PROMPT_TEMPLATES[templateKey] || null;
    },

    /**
     * Get all available prompt templates
     * @returns {Object} All prompt templates
     */
    getAllTemplates() {
        return { ...PROMPT_TEMPLATES };
    },

    /**
     * Get default settings
     * @returns {Object} Default settings object
     */
    getDefaultSettings() {
        return { ...DEFAULT_SETTINGS };
    },

    /**
     * Get YouTube selectors for content extraction
     * @returns {Object} YouTube selectors object
     */
    getSelectors() {
        return { ...YOUTUBE_SELECTORS };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        AI_PROVIDERS,
        PROMPT_TEMPLATES,
        DEFAULT_SETTINGS,
        YOUTUBE_SELECTORS,
        ConfigUtils
    };
} else {
    // Browser environment (extension)
    window.ExtensionConfig = {
        AI_PROVIDERS,
        PROMPT_TEMPLATES,
        DEFAULT_SETTINGS,
        YOUTUBE_SELECTORS,
        ConfigUtils
    };
}