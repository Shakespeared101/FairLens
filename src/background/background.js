// Background service worker for WatchDogs extension

// Install event
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('WatchDogs extension installed');

        // Set default settings
        chrome.storage.local.set({
            darkPatternDetectionEnabled: true,
            autoDetect: false,
            notificationsEnabled: true
        });

        // Open welcome page
        chrome.tabs.create({
            url: chrome.runtime.getURL('src/popup/popup.html')
        });
    } else if (details.reason === 'update') {
        console.log('WatchDogs extension updated');
    }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getDarkPatternCount') {
        // Return count of detected dark patterns
        sendResponse({ count: request.count || 0 });
    } else if (request.action === 'saveAnalysis') {
        // Save analysis results
        saveAnalysisResults(request.data).then(() => {
            sendResponse({ success: true });
        });
        return true;
    } else if (request.action === 'getAnalysisHistory') {
        // Get analysis history
        getAnalysisHistory().then(history => {
            sendResponse({ history });
        });
        return true;
    }
});

// Save analysis results
async function saveAnalysisResults(data) {
    const timestamp = new Date().toISOString();
    const result = await chrome.storage.local.get(['analysisHistory']);
    const history = result.analysisHistory || [];

    history.push({
        timestamp,
        url: data.url,
        type: data.type,
        results: data.results
    });

    // Keep only last 50 analyses
    if (history.length > 50) {
        history.shift();
    }

    await chrome.storage.local.set({ analysisHistory: history });
}

// Get analysis history
async function getAnalysisHistory() {
    const result = await chrome.storage.local.get(['analysisHistory']);
    return result.analysisHistory || [];
}

// Context menu setup
chrome.runtime.onInstalled.addListener(() => {
    // Add context menu for quick actions
    chrome.contextMenus.create({
        id: 'detectDarkPatterns',
        title: 'Detect Dark Patterns',
        contexts: ['page']
    });

    chrome.contextMenus.create({
        id: 'analyzePrivacyPolicy',
        title: 'Analyze Privacy Policy',
        contexts: ['page']
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'detectDarkPatterns') {
        chrome.tabs.sendMessage(tab.id, { action: 'highlightDarkPatterns' });
    } else if (info.menuItemId === 'analyzePrivacyPolicy') {
        // Open popup to analyze policy
        chrome.action.openPopup();
    }
});

// Badge update for dark pattern count
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateBadge') {
        const count = request.count || 0;
        if (count > 0) {
            chrome.action.setBadgeText({ text: count.toString(), tabId: sender.tab.id });
            chrome.action.setBadgeBackgroundColor({ color: '#ef4444', tabId: sender.tab.id });
        } else {
            chrome.action.setBadgeText({ text: '', tabId: sender.tab.id });
        }
    }
});

// Keep service worker alive
chrome.runtime.onStartup.addListener(() => {
    console.log('WatchDogs extension started');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // Open popup (this is default behavior with action.default_popup)
    console.log('Extension icon clicked');
});

console.log('WatchDogs background service worker loaded');
