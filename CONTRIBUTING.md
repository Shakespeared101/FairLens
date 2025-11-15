# Contributing to WatchDogs

Thank you for your interest in contributing to WatchDogs! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Prioritize user privacy and security

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. Include detailed steps to reproduce
3. Provide browser version and OS information
4. Include screenshots if applicable
5. Describe expected vs actual behavior

### Suggesting Features

1. Check existing feature requests
2. Clearly describe the feature and its benefits
3. Explain use cases
4. Consider privacy implications

### Code Contributions

#### Setting Up Development Environment

```bash
# Clone the repository
git clone https://github.com/yourusername/watchdogs.git
cd watchdogs

# Create icons (choose one method)
cd assets/icons
python3 create_icons.py  # If you have Pillow
# OR open generate-icons.html in browser

# Load extension in browser
# Chrome: chrome://extensions/ -> Load unpacked
# Firefox: about:debugging -> Load Temporary Add-on
```

#### Code Style Guidelines

**JavaScript:**
- Use ES6+ features
- Use meaningful variable names
- Add comments for complex logic
- Follow existing code structure
- Use async/await for asynchronous operations

**CSS:**
- Use CSS custom properties for theming
- Follow BEM naming convention for classes
- Ensure responsive design
- Test across different browsers

**General:**
- Keep functions small and focused
- Avoid deeply nested code
- Handle errors gracefully
- Add JSDoc comments for functions

#### Pull Request Process

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Write clean, documented code
   - Follow existing patterns
   - Test thoroughly

4. **Commit your changes**
   ```bash
   git commit -m "Add: Brief description of changes"
   ```

   Commit message prefixes:
   - `Add:` New feature
   - `Fix:` Bug fix
   - `Update:` Improvement to existing feature
   - `Refactor:` Code restructuring
   - `Docs:` Documentation changes
   - `Style:` Formatting changes

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Provide clear description
   - Reference related issues
   - Include screenshots for UI changes
   - List testing performed

### Adding New Dark Patterns

To add a new dark pattern detection rule:

1. Open `src/utils/darkPatterns.js`
2. Add category to `DARK_PATTERN_CATEGORIES`
3. Create detection function following existing pattern
4. Add to `getDetectionFunctions()`
5. Update `analyzeElement()` to use new detection
6. Add tests and examples
7. Update documentation

Example:
```javascript
// In DARK_PATTERN_CATEGORIES
DECEPTIVE_COUNTDOWN: {
    name: 'Deceptive Countdown',
    severity: 'high',
    description: 'Shows fake countdown timers'
}

// Detection function
function detectDeceptiveCountdown(text) {
    const patterns = [
        /offer expires in \d+:\d+/i,
        /⏰.*\d+:\d+/i
    ];
    return patterns.some(pattern => pattern.test(text));
}
```

### Adding New Regulations

To add support for a new regulation:

1. Create JSON file in `backend/static/policies/`
2. Follow existing structure (see `gdpr.json`)
3. Include:
   - Name and jurisdiction
   - Requirements array
   - Key phrases
   - Mandatory elements
4. Add to dropdown in `popup.html`
5. Update `README.md` documentation

### Adding Alternative LLM Support

To add support for other LLM providers:

1. Create new file in `src/utils/` (e.g., `openai.js`)
2. Implement consistent interface:
   ```javascript
   async function callAPI(apiKey, text) {
       // Implementation
   }

   async function testAPIKey(apiKey) {
       // Implementation
   }
   ```
3. Update `content.js` to support selection
4. Add UI for API selection
5. Document setup process

## Testing

### Manual Testing Checklist

**Dark Pattern Detection:**
- [ ] Test on e-commerce sites
- [ ] Test on news sites with subscriptions
- [ ] Verify highlighting works correctly
- [ ] Check tooltip displays properly
- [ ] Test on mobile viewport

**Policy Compliance:**
- [ ] Test with different regulations
- [ ] Test on actual privacy policy pages
- [ ] Verify score calculation
- [ ] Check findings accuracy
- [ ] Test on pages without policies

**Policy Summarizer:**
- [ ] Test with valid API key
- [ ] Test with invalid API key
- [ ] Test on various policy lengths
- [ ] Verify summary quality
- [ ] Check error handling

**Cross-browser Testing:**
- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Brave
- [ ] Opera

## Security Guidelines

- **Never commit API keys or secrets**
- **Validate all user inputs**
- **Use HTTPS for all external requests**
- **Minimize permissions in manifest**
- **Sanitize data before display**
- **Follow principle of least privilege**

## Documentation

When adding features, update:
- `README.md` - User-facing documentation
- Code comments - Implementation details
- `CONTRIBUTING.md` - Developer guidelines (this file)
- Inline JSDoc - Function documentation

## Questions?

- Open an issue for questions
- Check existing documentation
- Review closed issues for solutions

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to WatchDogs! 🐕
