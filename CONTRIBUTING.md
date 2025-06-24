# Contributing to YouTube Content to GPT

Thank you for your interest in contributing! This document provides guidelines for contributing to this Chrome extension.

## Getting Started

### Prerequisites
- Chrome browser (latest version)
- Basic knowledge of JavaScript and Chrome extension development
- Git for version control

### Development Setup
1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/yourusername/youtube-content-to-gpt.git
   cd youtube-content-to-gpt
   ```
3. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the project directory

## Making Changes

### Branch Naming
- Feature: `feature/add-new-selector`
- Bug fix: `fix/transcript-extraction-error`
- Documentation: `docs/update-readme`

### Development Workflow
1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Test thoroughly (see Testing section)
4. Commit with descriptive messages:
   ```bash
   git commit -m "Add support for YouTube Shorts transcript extraction"
   ```
5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Create a Pull Request

## Testing

### Manual Testing Checklist
Test your changes on these YouTube video types:
- [ ] Regular videos with auto-generated captions
- [ ] Videos with manual captions/subtitles
- [ ] Videos without captions (description only)
- [ ] YouTube Shorts
- [ ] Live streams
- [ ] Videos with minimal content
- [ ] Videos from different channels

### Testing Scenarios
- [ ] Extension popup opens correctly
- [ ] Content extraction works on target videos
- [ ] Error messages display appropriately
- [ ] ChatGPT opens with properly formatted content
- [ ] Extension works after page refresh
- [ ] No console errors in browser dev tools

## Code Guidelines

### JavaScript Style
- Use modern ES6+ syntax
- Prefer `const` and `let` over `var`
- Use descriptive variable names
- Add JSDoc comments for functions
- Handle errors gracefully

### Example Code Style
```javascript
/**
 * Extracts video title from YouTube page
 * @returns {string} Video title or 'Unknown Title'
 */
function extractVideoTitle() {
    const titleSelectors = [
        'h1.ytd-watch-metadata yt-formatted-string',
        'h1.ytd-video-primary-info-renderer yt-formatted-string'
    ];
    
    for (const selector of titleSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
            return element.textContent.trim();
        }
    }
    
    return 'Unknown Title';
}
```

### File Structure
```
chrome_tube/
├── manifest.json          # Extension configuration
├── popup.html/js          # Extension popup
├── content.js             # YouTube page content script
├── background.js          # Service worker
├── styles.css             # Popup styling
├── icon*.png              # Extension icons
└── docs/                  # Documentation
```

## Common Issues

### YouTube DOM Changes
YouTube frequently updates their HTML structure. If selectors break:
1. Inspect the YouTube page to find new selectors
2. Add new selectors to the fallback arrays
3. Test on multiple video types
4. Keep existing selectors for backward compatibility

### Content Extraction Fails
If content extraction stops working:
1. Check browser console for errors
2. Verify YouTube page has loaded completely
3. Test different content extraction methods
4. Add debug logging to identify the issue

## Pull Request Process

### Before Submitting
- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] No console errors
- [ ] README updated if needed
- [ ] Commit messages are descriptive

### PR Template
When creating a pull request, include:
- **Description**: What does this PR do?
- **Testing**: How was this tested?
- **YouTube URLs**: Provide test video URLs
- **Screenshots**: If UI changes, include before/after

### Review Process
1. Maintainers will review within 48 hours
2. Address any feedback or requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited in releases

## Reporting Issues

### Bug Reports
Include:
- Chrome version
- Extension version
- YouTube video URL where issue occurs
- Steps to reproduce
- Expected vs actual behavior
- Console error messages (if any)

### Feature Requests
Include:
- Clear description of the feature
- Use case/problem it solves
- Suggested implementation approach
- Any related examples

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers get started
- Keep discussions relevant to the project

## Questions?

- Open an issue for general questions
- Tag @maintainer for urgent matters
- Check existing issues before asking

Thank you for contributing! 🚀