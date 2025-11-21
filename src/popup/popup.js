// Popup functionality for WatchDogs extension

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const highlightBtn = document.getElementById('highlightBtn');
    const complianceBtn = document.getElementById('complianceBtn');
    const summarizeBtn = document.getElementById('summarizeBtn');
    const saveApiBtn = document.getElementById('saveApiBtn');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const regulationSelect = document.getElementById('regulationSelect');
    const resultsPanel = document.getElementById('resultsPanel');
    const closeResults = document.getElementById('closeResults');
    const resultsContent = document.getElementById('resultsContent');
    const resultsTitle = document.getElementById('resultsTitle');

    // Load saved API key
    chrome.storage.local.get(['groqApiKey'], function(result) {
        if (result.groqApiKey) {
            apiKeyInput.value = result.groqApiKey;
            showStatus('complianceStatus', 'API Key loaded', 'success');
        }
    });

    // Save API Key
    saveApiBtn.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            showStatus('complianceStatus', 'Please enter an API key', 'error');
            return;
        }

        chrome.storage.local.set({ groqApiKey: apiKey }, function() {
            showStatus('complianceStatus', 'API Key saved successfully', 'success');
            setTimeout(() => hideStatus('complianceStatus'), 2000);
        });
    });

    // Highlight Dark Patterns
    highlightBtn.addEventListener('click', async function() {
        setButtonLoading(highlightBtn, true);

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Check if AI detection is enabled
            const useAI = document.getElementById('useAIDetection').checked;

            // Get API key if AI is enabled
            let apiKey = null;
            if (useAI) {
                const result = await chrome.storage.local.get(['groqApiKey']);
                apiKey = result.groqApiKey;

                if (!apiKey) {
                    setButtonLoading(highlightBtn, false);
                    showStatus('highlightStatus', 'AI detection requires API key. Please set it in API Settings.', 'error');
                    return;
                }
            }

            // First, try to ensure content script is injected
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['src/content/content.js']
                });
            } catch (injectionError) {
                // Content script might already be injected, continue
                console.log('Content script injection attempt:', injectionError.message);
            }

            // Small delay to ensure script is ready
            await new Promise(resolve => setTimeout(resolve, 100));

            // Send message with AI detection flag and API key
            const message = {
                action: 'highlightDarkPatterns',
                useAI: useAI,
                apiKey: apiKey
            };

            chrome.tabs.sendMessage(tab.id, message, function(response) {
                setButtonLoading(highlightBtn, false);

                if (chrome.runtime.lastError) {
                    showStatus('highlightStatus', 'Error: Please refresh the page and try again', 'error');
                    console.error('Connection error:', chrome.runtime.lastError);
                    return;
                }

                if (response && response.success) {
                    let statusMsg = `Found ${response.count} dark patterns`;

                    // Show detection method breakdown if AI was used
                    if (useAI && response.methods) {
                        statusMsg += ` (Pattern: ${response.methods.pattern}, Semantic: ${response.methods.semantic}, AI: ${response.methods.ai})`;
                    }

                    showStatus('highlightStatus', statusMsg, 'success');

                    if (response.count > 0) {
                        displayResults('Dark Patterns Detected', formatDarkPatternsResults(response.patterns, useAI));
                    }
                } else {
                    showStatus('highlightStatus', 'No dark patterns detected', 'warning');
                }
            });
        } catch (error) {
            setButtonLoading(highlightBtn, false);
            showStatus('highlightStatus', 'Error: ' + error.message, 'error');
        }
    });

    // Policy Compliance Checker
    complianceBtn.addEventListener('click', async function() {
        const regulation = regulationSelect.value;

        if (!regulation) {
            showStatus('complianceStatus', 'Please select a regulation', 'error');
            return;
        }

        setButtonLoading(complianceBtn, true);

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Ensure content script is injected
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['src/content/content.js']
                });
            } catch (injectionError) {
                console.log('Content script injection attempt:', injectionError.message);
            }

            await new Promise(resolve => setTimeout(resolve, 100));

            chrome.tabs.sendMessage(tab.id, {
                action: 'checkCompliance',
                regulation: regulation
            }, function(response) {
                setButtonLoading(complianceBtn, false);

                if (chrome.runtime.lastError) {
                    showStatus('complianceStatus', 'Error: Please refresh the page and try again', 'error');
                    console.error('Connection error:', chrome.runtime.lastError);
                    return;
                }

                if (response && response.success) {
                    showStatus('complianceStatus', `Compliance: ${response.score}%`, 'success');
                    displayResults('Compliance Report', formatComplianceResults(response));
                } else {
                    showStatus('complianceStatus', response?.message || 'Could not analyze policy', 'error');
                }
            });
        } catch (error) {
            setButtonLoading(complianceBtn, false);
            showStatus('complianceStatus', 'Error: ' + error.message, 'error');
        }
    });

    // Policy Summarizer
    summarizeBtn.addEventListener('click', async function() {
        setButtonLoading(summarizeBtn, true);

        try {
            // Get API key
            const result = await chrome.storage.local.get(['groqApiKey']);
            if (!result.groqApiKey) {
                setButtonLoading(summarizeBtn, false);
                showStatus('summaryStatus', 'Please set your Groq API key first', 'error');
                return;
            }

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Ensure content script is injected
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['src/content/content.js']
                });
            } catch (injectionError) {
                console.log('Content script injection attempt:', injectionError.message);
            }

            await new Promise(resolve => setTimeout(resolve, 100));

            chrome.tabs.sendMessage(tab.id, {
                action: 'summarizePolicy',
                apiKey: result.groqApiKey
            }, function(response) {
                setButtonLoading(summarizeBtn, false);

                if (chrome.runtime.lastError) {
                    showStatus('summaryStatus', 'Error: Please refresh the page and try again', 'error');
                    console.error('Connection error:', chrome.runtime.lastError);
                    return;
                }

                if (response && response.success) {
                    showStatus('summaryStatus', 'Policy summarized', 'success');
                    displayResults('Policy Summary', formatSummaryResults(response.summary));
                } else {
                    showStatus('summaryStatus', response?.message || 'Could not summarize policy', 'error');
                }
            });
        } catch (error) {
            setButtonLoading(summarizeBtn, false);
            showStatus('summaryStatus', 'Error: ' + error.message, 'error');
        }
    });

    // Close results panel
    closeResults.addEventListener('click', function() {
        resultsPanel.style.display = 'none';
    });

    // Helper Functions
    function setButtonLoading(button, loading) {
        const btnText = button.querySelector('.btn-text');
        const btnLoader = button.querySelector('.btn-loader');

        if (loading) {
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-block';
            button.disabled = true;
        } else {
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            button.disabled = false;
        }
    }

    function showStatus(elementId, message, type) {
        const statusEl = document.getElementById(elementId);
        statusEl.textContent = message;
        statusEl.className = `status-indicator ${type}`;
    }

    function hideStatus(elementId) {
        const statusEl = document.getElementById(elementId);
        statusEl.className = 'status-indicator';
    }

    function displayResults(title, content) {
        resultsTitle.textContent = title;
        resultsContent.innerHTML = content;
        resultsPanel.style.display = 'block';
    }

    function formatDarkPatternsResults(patterns, useAI = false) {
        let html = '<div>';

        html += `<div style="background: rgba(239, 68, 68, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 16px; border-left: 3px solid #ef4444;">
            <strong>⚠️ Found ${patterns.length} Dark Pattern${patterns.length !== 1 ? 's' : ''}</strong>
        </div>`;

        // Explanation of dark patterns
        html += `<div style="background: rgba(99, 102, 241, 0.1); padding: 12px; border-radius: 8px; margin: 12px 0; font-size: 12px;">
            <strong>ℹ️ ${useAI ? 'AI-Enhanced' : 'Pattern-Based'} Detection</strong><br>
            ${useAI ?
                'Using hybrid detection: pattern matching + semantic similarity + AI verification. Patterns are scored by confidence (60-100%).' :
                'Using pattern matching to detect deceptive UI/UX techniques. Enable AI detection for more comprehensive analysis.'
            }
        </div>`;

        // Group patterns by type and method if AI
        const patternsByType = {};
        patterns.forEach((pattern) => {
            if (!patternsByType[pattern.type]) {
                patternsByType[pattern.type] = [];
            }
            patternsByType[pattern.type].push(pattern);
        });

        html += '<h4>🎯 Detected Patterns:</h4>';
        html += '<ul style="line-height: 1.8;">';

        Object.keys(patternsByType).forEach(type => {
            const typePatterns = patternsByType[type];
            const count = typePatterns.length;
            const description = typePatterns[0].description;

            // Calculate average confidence if AI was used
            let avgConfidence = null;
            if (useAI && typePatterns[0].confidence !== undefined) {
                avgConfidence = typePatterns.reduce((sum, p) => sum + (p.confidence || 1.0), 0) / count;
            }

            // Show detection method breakdown if AI was used
            let methodInfo = '';
            if (useAI) {
                const methods = typePatterns.map(p => p.method || 'pattern');
                const methodCounts = {};
                methods.forEach(m => methodCounts[m] = (methodCounts[m] || 0) + 1);

                const methodLabels = {
                    pattern: '🔍',
                    semantic: '🧠',
                    ai: '🤖'
                };

                methodInfo = ' [' + Object.entries(methodCounts)
                    .map(([method, count]) => `${methodLabels[method] || ''}${count}`)
                    .join(' ') + ']';
            }

            const confidenceInfo = avgConfidence ? ` <span style="color: #10b981; font-size: 11px;">(${Math.round(avgConfidence * 100)}% confidence)</span>` : '';

            html += `<li><strong style="color: #ef4444;">${type}</strong> (${count}x)${methodInfo}${confidenceInfo}: ${description}</li>`;
        });

        html += '</ul>';

        html += `<div style="margin-top: 16px; padding: 12px; background: rgba(15, 23, 42, 0.5); border-radius: 8px; font-size: 13px;">
            <strong>👁️ Visual Highlighting:</strong> All detected patterns are highlighted on the page.
            ${useAI ? 'Hover to see confidence scores and detection methods.' : 'Hover for detailed explanations.'}
        </div>`;

        html += '</div>';

        return html;
    }

    function formatComplianceResults(data) {
        const scoreClass = data.score >= 70 ? 'high' : data.score >= 40 ? 'medium' : 'low';
        const scoreLabel = data.score >= 70 ? 'Good' : data.score >= 40 ? 'Moderate' : 'Poor';

        let html = '<div>';

        // Score with interpretation
        html += `<div class="compliance-score ${scoreClass}">
            Compliance Score: ${data.score}% (${scoreLabel})
        </div>`;

        html += `<p><strong>📜 Regulation:</strong> ${data.regulation.toUpperCase()}</p>`;

        // Explanation of how scoring works
        html += `<div style="background: rgba(99, 102, 241, 0.1); padding: 12px; border-radius: 8px; margin: 12px 0; font-size: 12px;">
            <strong>ℹ️ How This Works:</strong><br>
            The compliance checker analyzes the privacy policy for required elements and detects violations.
            Red flags (like selling data without opt-out, ignoring user rights, or indefinite retention) reduce the score.
            A score below 40% indicates serious compliance issues.
        </div>`;

        // Findings with better formatting
        html += '<h4>🔍 Detailed Findings:</h4>';
        html += '<ul style="line-height: 1.8;">';

        if (data.findings && data.findings.length > 0) {
            data.findings.forEach(finding => {
                // Color code different types of findings
                let style = '';
                if (finding.includes('VIOLATION')) {
                    style = 'color: #ef4444; font-weight: 600;';
                } else if (finding.includes('NEGATIVE')) {
                    style = 'color: #f59e0b; font-weight: 600;';
                } else if (finding.includes('Missing')) {
                    style = 'color: #94a3b8;';
                }
                html += `<li style="${style}">${finding}</li>`;
            });
        } else {
            html += '<li style="color: #10b981;">✅ No specific issues found</li>';
        }

        html += '</ul>';

        // Recommendations
        if (data.recommendations && data.recommendations.length > 0) {
            html += '<h4>💡 Recommendations:</h4>';
            html += '<ul style="line-height: 1.8;">';
            data.recommendations.forEach(rec => {
                html += `<li>${rec}</li>`;
            });
            html += '</ul>';
        }

        // Summary interpretation
        html += '<div style="margin-top: 16px; padding: 12px; background: rgba(15, 23, 42, 0.5); border-radius: 8px; font-size: 13px;">';
        if (data.score >= 70) {
            html += '<strong style="color: #10b981;">✅ Summary:</strong> This policy appears to meet most compliance requirements.';
        } else if (data.score >= 40) {
            html += '<strong style="color: #f59e0b;">⚠️ Summary:</strong> This policy has some compliance issues that should be addressed.';
        } else {
            html += '<strong style="color: #ef4444;">❌ Summary:</strong> This policy has serious compliance violations and may not meet regulatory requirements.';
        }
        html += '</div>';

        html += '</div>';

        return html;
    }

    function formatSummaryResults(summary) {
        let html = '<div>';

        if (Array.isArray(summary)) {
            html += '<h4>Key Points:</h4>';
            html += '<ul>';
            summary.forEach(point => {
                html += `<li>${point}</li>`;
            });
            html += '</ul>';
        } else if (typeof summary === 'object') {
            // Key Points
            if (summary.keyPoints && summary.keyPoints.length > 0) {
                html += '<h4>📋 Key Points:</h4>';
                html += '<ul>';
                summary.keyPoints.forEach(point => {
                    html += `<li>${point}</li>`;
                });
                html += '</ul>';
            }

            // Red Flags
            if (summary.redFlags && summary.redFlags.length > 0) {
                html += '<h4 style="color: #ef4444;">🚩 Red Flags & Concerns:</h4>';
                html += '<ul style="color: #ef4444;">';
                summary.redFlags.forEach(flag => {
                    html += `<li>${flag}</li>`;
                });
                html += '</ul>';
            }

            // Data Collection
            if (summary.dataCollection) {
                html += '<h4>📊 Data Collection:</h4>';
                html += `<p style="margin-left: 10px;">${summary.dataCollection}</p>`;
            }

            // Third Party Sharing
            if (summary.thirdPartySharing) {
                html += '<h4>🔄 Third Party Sharing:</h4>';
                html += `<p style="margin-left: 10px;">${summary.thirdPartySharing}</p>`;
            }

            // User Rights
            if (summary.userRights) {
                html += '<h4>⚖️ Your Rights:</h4>';
                html += `<p style="margin-left: 10px;">${summary.userRights}</p>`;
            }

            // Data Retention
            if (summary.dataRetention) {
                html += '<h4>🕒 Data Retention:</h4>';
                html += `<p style="margin-left: 10px;">${summary.dataRetention}</p>`;
            }
        } else {
            html += `<p>${summary}</p>`;
        }

        html += '</div>';

        return html;
    }
});
