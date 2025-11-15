# WatchDogs - Quick Start Guide

Get up and running with WatchDogs in 5 minutes!

## 1. Generate Icons (30 seconds)

```bash
# Open this file in your browser:
open assets/icons/generate-icons.html

# Then download the 3 icons (16x16, 48x48, 128x128)
# Save them in assets/icons/ folder
```

## 2. Load Extension (1 minute)

**Chrome/Edge/Brave:**
```
1. Go to chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the WatchDogs folder
```

**Firefox:**
```
1. Go to about:debugging#/runtime/this-firefox
2. Click "Load Temporary Add-on"
3. Select manifest.json
```

## 3. Get Groq API Key (2 minutes)

```
1. Visit: https://console.groq.com
2. Sign up (free)
3. Create API Key
4. Copy the key
```

## 4. Configure Extension (30 seconds)

```
1. Click WatchDogs extension icon
2. Scroll to "API Settings"
3. Paste your Groq API key
4. Click "Save API Key"
```

## 5. Test Features (1 minute)

**Test Dark Pattern Detection:**
```
1. Visit any shopping site (Amazon, eBay)
2. Click WatchDogs icon
3. Click "Activate" under Dark Patterns
4. See highlighted patterns!
```

**Test Policy Compliance:**
```
1. Visit google.com/policies/privacy
2. Click WatchDogs icon
3. Select "GDPR" from dropdown
4. Click "Check Compliance"
5. View results!
```

**Test Policy Summarizer:**
```
1. Stay on privacy policy page
2. Click WatchDogs icon
3. Click "Summarize Policy"
4. Read AI summary!
```

## Done! 🎉

You're now protected by WatchDogs!

For detailed setup and troubleshooting, see [SETUP.md](SETUP.md)

---

## Common Commands

**Update extension after code changes:**
- Chrome: Go to chrome://extensions/ and click reload icon
- Firefox: Reload temporary add-on

**View console logs:**
- Press F12 → Console tab

**Clear extension data:**
- Chrome: chrome://extensions/ → Details → Clear data
- Or: Right-click extension icon → Manage → Clear data

---

## Feature Overview

| Feature | What It Does | When to Use |
|---------|-------------|-------------|
| Dark Pattern Detection | Highlights deceptive UI | Shopping, signing up |
| Policy Compliance | Checks against laws | Reading policies |
| Policy Summarizer | AI-powered summary | Understanding policies |

---

## Tips

💡 **Dark patterns** are most common on:
- E-commerce sites
- Subscription services
- Newsletter popups
- Cookie banners

💡 **Best policies to test:**
- Google Privacy Policy
- Facebook Privacy Policy
- Amazon Privacy Notice
- Any SaaS privacy policy

💡 **Save API credits:**
- Only summarize when needed
- Groq free tier is generous
- One summary ≈ small API cost

---

## Need Help?

- 📖 Full documentation: [README.md](README.md)
- 🛠️ Setup guide: [SETUP.md](SETUP.md)
- 🤝 Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)

**Enjoy safer browsing! 🐕**
