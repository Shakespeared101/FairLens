# WatchDogs Setup Guide

This guide will help you set up and test the WatchDogs browser extension.

## Prerequisites

- A Chromium-based browser (Chrome, Edge, Brave) or Firefox
- A free Groq API account (for policy summarization feature)
- Basic command line knowledge (optional, for icon generation)

## Step-by-Step Setup

### 1. Prepare the Extension Files

First, ensure all files are in place. The project structure should look like this:

```
WatchDogs/
├── manifest.json
├── package.json
├── src/
├── backend/
├── assets/
└── config/
```

### 2. Generate Extension Icons

The extension requires three icon sizes. Choose one method:

#### Method A: Using the HTML Generator (Easiest)

1. Open `assets/icons/generate-icons.html` in your web browser
2. The icons will be generated automatically
3. Download each icon:
   - Right-click on the 16x16 canvas → Save Image As → `icon16.png`
   - Right-click on the 48x48 canvas → Save Image As → `icon48.png`
   - Right-click on the 128x128 canvas → Save Image As → `icon128.png`
4. Save all files in the `assets/icons/` folder

#### Method B: Using Python (if Pillow is installed)

```bash
cd assets/icons
pip install Pillow
python3 create_icons.py
```

#### Method C: Use Your Own Icons

Create or use your own PNG icons with these dimensions:
- 16x16 pixels (toolbar icon)
- 48x48 pixels (extension management)
- 128x128 pixels (Chrome Web Store)

### 3. Load Extension in Browser

#### For Chrome/Edge/Brave:

1. Open your browser
2. Navigate to the extensions page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked"
5. Select the `WatchDogs` folder (the one containing `manifest.json`)
6. The extension should now appear in your extensions list

#### For Firefox:

1. Open Firefox
2. Navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..."
4. Navigate to the WatchDogs folder and select `manifest.json`
5. The extension will be loaded (note: it's temporary and will be removed when Firefox closes)

**For permanent Firefox installation:**
1. Package the extension as XPI
2. Or submit to Firefox Add-ons for signing

### 4. Set Up Groq API (For Policy Summarization)

The policy summarizer requires a free Groq API key:

1. **Get API Key:**
   - Visit [https://console.groq.com](https://console.groq.com)
   - Sign up for a free account
   - Navigate to "API Keys" in the dashboard
   - Click "Create API Key"
   - Copy the generated key (it starts with `gsk_`)

2. **Add to Extension:**
   - Click the WatchDogs extension icon in your browser
   - Scroll to the "API Settings" section
   - Paste your API key in the input field
   - Click "Save API Key"
   - You should see a success message

**Note:** Your API key is stored locally in your browser and never transmitted anywhere except to Groq's API.

### 5. Verify Installation

1. Click the WatchDogs extension icon
2. You should see the popup with four feature cards
3. All features should be clickable

## Testing the Features

### Test 1: Dark Pattern Detection

1. Navigate to any e-commerce website (e.g., Amazon, eBay)
2. Click the WatchDogs icon
3. Click "Activate" under "Highlight Dark Patterns"
4. Look for red-highlighted elements on the page
5. Hover over highlighted elements to see tooltip explanations

**Good test sites:**
- E-commerce sites (urgency, scarcity patterns)
- Newsletter signup forms (confirmshaming)
- Subscription services (forced continuity)

### Test 2: Policy Compliance Checker

1. Navigate to a privacy policy page, for example:
   - `https://www.google.com/policies/privacy/`
   - `https://www.facebook.com/privacy/policy/`
   - `https://www.amazon.com/gp/help/customer/display.html?nodeId=468496`
2. Click the WatchDogs icon
3. Select a regulation from the dropdown (try GDPR first)
4. Click "Check Compliance"
5. View the results showing:
   - Compliance score
   - Missing elements
   - Recommendations

### Test 3: Policy Summarizer

1. Make sure you've set up your Groq API key (see Step 4)
2. Navigate to a privacy policy page
3. Click the WatchDogs icon
4. Click "Summarize Policy"
5. Wait a few seconds for the AI to process
6. View the summary with key points

**Note:** This feature requires an internet connection and consumes API credits.

## Troubleshooting

### Icons Not Loading

**Problem:** Extension shows placeholder/broken icon images

**Solution:**
- Verify icon files exist in `assets/icons/`
- Check file names are exactly: `icon16.png`, `icon48.png`, `icon128.png`
- Reload the extension after adding icons

### Dark Patterns Not Highlighting

**Problem:** No elements are highlighted when clicking "Activate"

**Solutions:**
- Check browser console for errors (F12 → Console)
- Verify the page has loaded completely
- Try refreshing the page and activating again
- Some sites may block content scripts - this is normal

### Policy Not Detected

**Problem:** "Could not find privacy policy" message

**Solutions:**
- Make sure you're on an actual privacy policy page
- The URL should contain words like "privacy", "policy", "terms"
- Try looking for a privacy policy section manually on the page
- Some policies may not be detectable if they use unusual formats

### API Key Not Working

**Problem:** "Error calling Groq API" or similar message

**Solutions:**
- Verify you copied the entire API key
- Check you have API credits remaining at [Groq Console](https://console.groq.com)
- Ensure you have an internet connection
- Try saving the key again
- Generate a new API key if needed

### Extension Not Loading

**Problem:** Extension fails to load or shows errors

**Solutions:**
- Check that all required files are present
- Verify `manifest.json` is valid JSON
- Look for error messages in the extensions page
- Check browser console for detailed errors
- Ensure you're using a recent browser version

### Content Script Errors

**Problem:** Features not working on certain websites

**Solutions:**
- Some sites block extension content scripts for security
- Try on different websites to verify functionality
- Check browser console for CSP (Content Security Policy) errors
- This is expected behavior on some secure sites (banks, etc.)

## Performance Tips

1. **Dark Pattern Detection:**
   - May be slow on very large pages
   - Disable when not needed
   - Results are more accurate on simpler pages

2. **Policy Summarizer:**
   - First request may be slower (API cold start)
   - Longer policies take more time to process
   - Check Groq API rate limits if making many requests

3. **Memory Usage:**
   - Clear extension data periodically
   - Analysis history is capped at 50 entries
   - Reload extension if experiencing issues

## Browser-Specific Notes

### Chrome/Edge/Brave
- Best compatibility
- Full Manifest V3 support
- All features work as expected

### Firefox
- Temporary add-on requires reload each session
- Some Manifest V3 features may need adaptation
- Background scripts work as service workers

## Next Steps

1. **Customize Settings:**
   - Edit `config/settings.json` for advanced options
   - Modify detection rules in `src/utils/darkPatterns.js`
   - Add more regulations in `backend/static/policies/`

2. **Contribute:**
   - See `CONTRIBUTING.md` for guidelines
   - Report bugs or suggest features
   - Improve detection rules

3. **Share:**
   - Help others stay safe from dark patterns
   - Spread privacy awareness
   - Contribute to the open-source community

## Additional Resources

- **Groq Documentation:** [https://console.groq.com/docs](https://console.groq.com/docs)
- **Dark Patterns:** [https://www.deceptive.design/](https://www.deceptive.design/)
- **GDPR Info:** [https://gdpr.eu/](https://gdpr.eu/)
- **Chrome Extension Docs:** [https://developer.chrome.com/docs/extensions/](https://developer.chrome.com/docs/extensions/)

## Support

If you encounter issues not covered here:
1. Check the main `README.md`
2. Search existing issues
3. Open a new issue with details
4. Include browser version, OS, and error messages

---

**Happy browsing with WatchDogs! 🐕**
