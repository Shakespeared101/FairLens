# WatchDogs - Privacy Guardian Browser Extension

![WatchDogs Logo](assets/icons/icon128.png)

**WatchDogs** is a cross-browser extension designed to protect users from dark patterns and help them understand privacy policies. It provides three powerful features to enhance your online privacy and awareness.

## Features

### 1. 🔍 Dark Pattern Detection
Automatically scans web pages to identify and highlight deceptive UI elements and textual dark patterns, including:
- False urgency and scarcity tactics
- Confirmshaming (guilt-tripping users)
- Hidden costs and fees
- Misleading social proof
- Trick questions and confusing language
- Pre-checked consent boxes
- Forced continuity patterns

### 2. ✅ Policy Compliance Checker
Analyzes privacy policies against major data protection regulations:
- **GDPR** (European Union)
- **CCPA** (California, USA)
- **PIPEDA** (Canada)
- **LGPD** (Brazil)

Provides a compliance score and identifies missing or unclear elements.

### 3. 📄 Policy Summarizer
Uses AI (Groq API) to summarize privacy policies into digestible key points:
- Highlights what data is collected
- Explains how data is used
- Clarifies user rights
- Identifies important consent requirements

## Installation

### Chrome/Edge/Brave (Chromium-based browsers)

1. Clone or download this repository
2. Create the icon files (see [assets/icons/README.md](assets/icons/README.md))
3. Open your browser and navigate to:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
4. Enable "Developer mode" (toggle in top-right)
5. Click "Load unpacked"
6. Select the WatchDogs folder

### Firefox

1. Clone or download this repository
2. Create the icon files (see [assets/icons/README.md](assets/icons/README.md))
3. Navigate to `about:debugging#/runtime/this-firefox`
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file

## Setup

### Getting Your Groq API Key

The Policy Summarizer feature requires a free Groq API key:

1. Visit [Groq Console](https://console.groq.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and paste it in the extension's API Settings

**Note:** Groq offers a generous free tier suitable for personal use.

## Usage

### Detecting Dark Patterns

1. Click the WatchDogs extension icon
2. Click "Activate" under "Highlight Dark Patterns"
3. Dark patterns on the page will be highlighted in red
4. Hover over highlighted elements to see the pattern type and description

### Checking Policy Compliance

1. Navigate to a website's privacy policy page
2. Click the WatchDogs extension icon
3. Select a regulation from the dropdown (GDPR, CCPA, PIPEDA, or LGPD)
4. Click "Check Compliance"
5. View the compliance score and detailed findings

### Summarizing a Privacy Policy

1. Navigate to a website's privacy policy page
2. Click the WatchDogs extension icon
3. Ensure you have set your Groq API key in settings
4. Click "Summarize Policy"
5. Read the AI-generated summary of key points

## Technology Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **APIs:** Groq API (Mixtral-8x7b-32768 model)
- **Browser APIs:** Chrome Extension APIs (Manifest V3)
- **Regulations Database:** JSON-based policy templates

## Project Structure

```
WatchDogs/
├── manifest.json                 # Extension manifest (Manifest V3)
├── package.json                  # Project metadata
├── src/
│   ├── popup/                   # Extension popup UI
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   ├── content/                 # Content scripts (run on web pages)
│   │   └── content.js
│   ├── background/              # Background service worker
│   │   └── background.js
│   └── utils/                   # Utility functions
│       ├── api.js              # Groq API integration
│       ├── darkPatterns.js     # Dark pattern detection
│       └── policyAnalyzer.js   # Policy analysis utilities
├── backend/
│   └── static/
│       └── policies/            # Regulation templates
│           ├── gdpr.json
│           ├── ccpa.json
│           ├── pipeda.json
│           └── lgpd.json
├── assets/
│   ├── icons/                   # Extension icons
│   │   ├── icon16.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   └── css/
│       └── content.css          # Styles for dark pattern highlighting
└── config/                      # Configuration files
```

## Privacy & Security

- **No Data Collection:** WatchDogs does not collect or transmit any user data
- **Local Processing:** Dark pattern detection runs entirely in your browser
- **API Security:** Your Groq API key is stored locally and never shared
- **Open Source:** All code is open and auditable

## Dark Pattern Detection Rules

WatchDogs detects the following dark pattern categories:

| Pattern Type | Description | Severity |
|-------------|-------------|----------|
| False Urgency | Creates artificial time pressure | High |
| Fake Scarcity | Claims limited availability | High |
| Confirmshaming | Shames users for declining | High |
| Hidden Costs | Reveals extra costs late | High |
| Misdirection | Draws attention from better choices | High |
| Sneaking | Pre-checked consent boxes | High |
| Trick Questions | Confusing wording to deceive | High |
| Forced Continuity | Hard to cancel subscriptions | Medium |
| Social Proof | Potentially fabricated popularity | Medium |

## Compliance Scoring

The compliance checker analyzes privacy policies for:

- **GDPR:** 18 key requirements including data subject rights, legal basis, DPO contact
- **CCPA:** 16 requirements including opt-out rights, data categories, non-discrimination
- **PIPEDA:** 15 requirements including consent, accountability, safeguards
- **LGPD:** 18 requirements including legal basis, DPO, data subject rights

**Scoring:**
- 70-100%: Good compliance (green)
- 40-69%: Moderate compliance (yellow)
- 0-39%: Poor compliance (red)

## Known Limitations

1. **Policy Detection:** May not detect all privacy policy formats
2. **False Positives:** Some legitimate urgency messages may be flagged
3. **Language:** Currently optimized for English language policies
4. **Dynamic Content:** May not detect dark patterns in dynamically loaded content
5. **API Dependency:** Summarization requires internet connection and valid API key

## Contributing

Contributions are welcome! Areas for improvement:

- Additional dark pattern detection rules
- Support for more regulations (PDPA, DPDPA, etc.)
- Multilingual support
- Alternative LLM integrations
- Improved policy detection algorithms

## Roadmap

- [ ] Add support for more data protection regulations
- [ ] Implement report generation and export
- [ ] Add dark pattern statistics and analytics
- [ ] Create browser-specific optimizations
- [ ] Add support for multiple languages
- [ ] Implement user feedback mechanism
- [ ] Add visual comparison of policies over time

## License

MIT License - See LICENSE file for details

## Disclaimer

This extension provides analysis based on automated detection rules and AI summaries. It should not be considered legal advice. Always read the full privacy policy and consult with legal professionals for compliance matters.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review the code comments for implementation details

## Credits

- **Dark Pattern Research:** Based on research by Harry Brignull and the Dark Patterns community
- **Regulations:** GDPR, CCPA, PIPEDA, and LGPD official documentation
- **AI Model:** Groq (Mixtral-8x7b-32768)

---

**Made with ❤️ for privacy-conscious users**
