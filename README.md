# YouTube Content to GPT Chrome Extension

A Chrome extension that extracts YouTube video content and generates AI-powered summaries using ChatGPT.

## Features

- 🎥 **Smart Content Extraction**: Automatically extracts video transcripts, captions, descriptions, and comments
- 🤖 **AI-Powered Summaries**: Pre-formats content for ChatGPT with intelligent prompts
- ⚡ **One-Click Operation**: Simple interface with real-time feedback
- 🔒 **Privacy-First**: No external data storage, processes content locally
- 🛡️ **Error Handling**: Robust fallback methods and user feedback

## Installation

### For Development
1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory

### From Chrome Web Store
*Coming soon - extension under review*

## Usage

1. Navigate to any YouTube video
2. Click the extension icon in your browser toolbar
3. Click "Extract Content"
4. ChatGPT opens with your video content formatted for summarization

## Technical Details

### Content Extraction Methods
The extension uses multiple fallback methods to ensure content extraction:

1. **Primary**: Video transcript/captions (`[data-start-time]` elements)
2. **Secondary**: Video description (`#description-text`)
3. **Fallback**: Top 5 comments (`#content-text`)

### Files Structure
```
chrome_tube/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup interface
├── popup.js              # Main popup logic
├── content.js            # Content script for YouTube
├── background.js         # Service worker
├── styles.css            # Popup styling
├── icon16.png           # 16x16 icon
├── icon48.png           # 48x48 icon
└── icon128.png          # 128x128 icon
```

### Permissions Explained
- `activeTab`: Access current YouTube tab when extension is clicked
- `scripting`: Inject content extraction scripts into YouTube pages
- `storage`: Store user preferences (future feature)

## Development

### Testing
1. Load extension in developer mode
2. Navigate to various YouTube videos
3. Test content extraction with different video types:
   - Videos with captions
   - Videos without captions (description only)
   - Videos with limited content (comments fallback)

### Building for Production
1. Update version in `manifest.json`
2. Test thoroughly across different YouTube video types
3. Zip all files for Chrome Web Store submission

## Troubleshooting

### Common Issues
- **"Please navigate to a YouTube video page first"**: Ensure you're on a YouTube video page (not homepage or search results)
- **"No content found"**: Video may not have captions, description, or comments available
- **"Failed to access page content"**: Try refreshing the YouTube page and clicking the extension again

### Browser Compatibility
- Chrome 88+ (Manifest V3 support required)
- Chromium-based browsers (Edge, Brave, etc.)

## Privacy Policy

This extension:
- Does not collect or store personal data
- Only accesses YouTube pages when explicitly activated
- Transfers extracted content directly to ChatGPT when requested
- No external servers or data storage involved

## Contributing

We welcome contributions! Here's how to get started:

### Development Setup
1. Fork this repository
2. Clone your fork: `git clone https://github.com/yourusername/youtube-content-to-gpt.git`
3. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the project directory

### Making Changes
1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test the extension thoroughly on different YouTube videos
4. Commit your changes: `git commit -m "Add your feature"`
5. Push to your fork: `git push origin feature/your-feature-name`
6. Submit a pull request

### Code Style
- Follow existing JavaScript patterns
- Use meaningful variable names
- Add comments for complex logic
- Test on multiple YouTube video types

### Issues & Feature Requests
- Check existing issues before creating new ones
- Use clear, descriptive titles
- Include steps to reproduce for bugs
- Provide YouTube video URLs that demonstrate issues

## License

MIT License

Copyright (c) 2024 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Changelog

### Version 1.0.0
- Initial release
- Multi-method content extraction
- ChatGPT integration
- Error handling and user feedback
- Security optimizations

## Support

- GitHub Issues: Create an issue for bug reports or feature requests
- Email: [Your support email]

---

**Made with ❤️ for productivity and learning**