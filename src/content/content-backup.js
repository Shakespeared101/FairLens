// Content script for WatchDogs extension
// Runs on all web pages to detect dark patterns and analyze policies

// Dark pattern detection rules
const DARK_PATTERN_RULES = {
    // Urgency/Scarcity patterns
    urgency: {
        keywords: [
            'only \\d+ left', 'hurry', 'limited time', 'expires soon', 'ending soon',
            'last chance', 'almost gone', 'selling fast', 'while supplies last',
            'limited stock', 'flash sale', 'today only', 'act now', 'don\'t miss out',
            '\\d+ people are viewing', 'almost sold out', 'going fast'
        ],
        description: 'Creates false urgency to pressure users'
    },

    // Hidden costs
    hiddenCosts: {
        keywords: [
            'additional fees may apply', 'plus tax', 'excluding shipping',
            'handling fees', 'service charge', 'processing fee', 'convenience fee'
        ],
        description: 'Hides additional costs until late in purchase'
    },

    // Forced continuity
    forcedContinuity: {
        keywords: [
            'free trial', 'cancel anytime', 'no commitment', 'try free',
            'start free trial', 'first month free', 'automatic renewal'
        ],
        description: 'Makes it easy to subscribe but hard to cancel'
    },

    // Confirmshaming
    confirmshaming: {
        keywords: [
            'no thanks, i don\'t want', 'no, i\'ll pay full price',
            'no, i don\'t want to save', 'no thanks, i hate',
            'i don\'t want to', 'continue without'
        ],
        description: 'Shames users who decline offers'
    },

    // Misdirection
    misdirection: {
        keywords: [
            'agree to all', 'accept all cookies', 'allow all',
            'i agree to the terms', 'i accept'
        ],
        visualCues: ['button', 'checkbox'],
        description: 'Draws attention away from better choices'
    },

    // Trick questions
    trickQuestions: {
        keywords: [
            'uncheck to opt out', 'check to not receive', 'unsubscribe',
            'do not send me', 'opt out of'
        ],
        description: 'Uses confusing wording to trick users'
    },

    // Social proof (fabricated)
    socialProof: {
        keywords: [
            '\\d+ customers purchased', '\\d+ people bought', 'bestseller',
            'most popular', '#1 choice', 'customer favorite', 'trending now',
            'highly rated', '\\d+ reviews'
        ],
        description: 'Uses potentially fabricated social proof'
    },

    // Bait and switch
    baitAndSwitch: {
        keywords: [
            'was \\$\\d+', 'originally \\$\\d+', 'save \\d+%', 'discount',
            'sale price', 'regular price', 'now only'
        ],
        description: 'Advertises one thing but delivers another'
    }
};

// Store detected patterns
let detectedPatterns = [];
let highlightedElements = [];

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'highlightDarkPatterns') {
        detectAndHighlightDarkPatterns();
        sendResponse({ success: true, count: detectedPatterns.length, patterns: detectedPatterns });
    } else if (request.action === 'checkCompliance') {
        checkPolicyCompliance(request.regulation).then(result => {
            sendResponse(result);
        });
        return true; // Keep channel open for async response
    } else if (request.action === 'summarizePolicy') {
        summarizePolicy(request.apiKey).then(result => {
            sendResponse(result);
        });
        return true; // Keep channel open for async response
    }
});

// Detect and highlight dark patterns
function detectAndHighlightDarkPatterns() {
    // Clear previous highlights
    clearHighlights();
    detectedPatterns = [];

    // Get all text elements
    const textElements = document.querySelectorAll('p, span, div, button, a, label, h1, h2, h3, h4, h5, h6, li');

    textElements.forEach(element => {
        const text = element.textContent.trim().toLowerCase();

        // Skip if element is too large or empty
        if (text.length === 0 || text.length > 500) return;

        // Check against each dark pattern rule
        for (const [patternType, rule] of Object.entries(DARK_PATTERN_RULES)) {
            for (const keyword of rule.keywords) {
                const regex = new RegExp(keyword, 'i');
                if (regex.test(text)) {
                    // Found a dark pattern
                    highlightElement(element, patternType, rule.description);
                    detectedPatterns.push({
                        type: patternType,
                        description: rule.description,
                        text: text.substring(0, 100)
                    });
                    break; // Only highlight once per element
                }
            }
        }
    });

    // Check for pre-checked checkboxes (sneaking into basket)
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        const label = findLabelForCheckbox(checkbox);
        if (label) {
            const text = label.textContent.toLowerCase();
            if (text.includes('newsletter') || text.includes('marketing') || text.includes('promotional')) {
                highlightElement(checkbox, 'sneaking', 'Pre-checked consent checkbox');
                detectedPatterns.push({
                    type: 'sneaking',
                    description: 'Pre-checked consent checkbox',
                    text: label.textContent.substring(0, 100)
                });
            }
        }
    });

    return detectedPatterns;
}

// Highlight an element as a dark pattern
function highlightElement(element, type, description) {
    // Don't highlight if already highlighted
    if (element.classList.contains('dark-pattern-highlight')) return;

    element.classList.add('dark-pattern-highlight');
    element.setAttribute('data-dark-pattern', type);
    element.setAttribute('title', `⚠️ Dark Pattern: ${description}`);

    highlightedElements.push(element);

    // Add click listener to show tooltip
    element.addEventListener('mouseenter', showTooltip);
    element.addEventListener('mouseleave', hideTooltip);
}

// Clear all highlights
function clearHighlights() {
    highlightedElements.forEach(element => {
        element.classList.remove('dark-pattern-highlight');
        element.removeAttribute('data-dark-pattern');
        element.removeAttribute('title');
        element.removeEventListener('mouseenter', showTooltip);
        element.removeEventListener('mouseleave', hideTooltip);
    });
    highlightedElements = [];

    // Remove any existing tooltips
    const tooltips = document.querySelectorAll('.dark-pattern-tooltip');
    tooltips.forEach(tooltip => tooltip.remove());
}

// Show tooltip on hover
function showTooltip(event) {
    const element = event.target;
    const type = element.getAttribute('data-dark-pattern');
    const description = DARK_PATTERN_RULES[type]?.description || 'Dark pattern detected';

    const tooltip = document.createElement('div');
    tooltip.className = 'dark-pattern-tooltip';
    tooltip.textContent = `⚠️ ${type.toUpperCase()}: ${description}`;
    tooltip.style.position = 'absolute';
    tooltip.style.zIndex = '10000';

    document.body.appendChild(tooltip);

    // Position tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';

    element._tooltip = tooltip;
}

// Hide tooltip
function hideTooltip(event) {
    const tooltip = event.target._tooltip;
    if (tooltip) {
        tooltip.remove();
    }
}

// Find label for checkbox
function findLabelForCheckbox(checkbox) {
    // Try to find by 'for' attribute
    if (checkbox.id) {
        const label = document.querySelector(`label[for="${checkbox.id}"]`);
        if (label) return label;
    }

    // Try parent label
    let parent = checkbox.parentElement;
    while (parent) {
        if (parent.tagName === 'LABEL') return parent;
        parent = parent.parentElement;
    }

    // Try next sibling
    let sibling = checkbox.nextElementSibling;
    if (sibling && sibling.tagName === 'LABEL') return sibling;

    return null;
}

// ============================================================================
// IMPROVED POLICY EXTRACTION
// ============================================================================

// Extract privacy policy from page - IMPROVED version with better site compatibility
function extractPrivacyPolicy() {
    console.log('[WatchDogs] Extracting privacy policy from:', window.location.href);

    let policyText = '';
    let extractionMethod = 'none';

    // Method 1: Try multiple content selectors (in order of preference)
    const contentSelectors = [
        'main',
        'article',
        '[role="main"]',
        '.main-content',
        '#main-content',
        '.content',
        '#content',
        '.privacy-policy',
        '.policy-content',
        '#privacy',
        '.page-content',
        '.post-content',
        '.entry-content',
        'body'  // Last resort
    ];

    for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.length > 500) {
            policyText = element.textContent;
            extractionMethod = `selector: ${selector}`;
            break;
        }
    }

    // Method 2: If nothing found or too short, try to get all visible text
    if (!policyText || policyText.length < 500) {
        // Get all paragraph, div, and list text
        const textElements = document.querySelectorAll('p, div, li, span, td');
        const textParts = [];

        textElements.forEach(el => {
            // Only get text from visible elements
            const style = window.getComputedStyle(el);
            if (style.display !== 'none' && style.visibility !== 'hidden') {
                const text = el.textContent.trim();
                if (text.length > 20) {
                    textParts.push(text);
                }
            }
        });

        if (textParts.length > 0) {
            policyText = textParts.join('\n');
            extractionMethod = 'visible text aggregation';
        }
    }

    // Clean up the text
    if (policyText) {
        policyText = policyText
            .replace(/\s+/g, ' ')
            .replace(/\t+/g, ' ')
            .trim();

        console.log(`[WatchDogs] Extracted ${policyText.length} characters using: ${extractionMethod}`);
        console.log('[WatchDogs] First 200 chars:', policyText.substring(0, 200));

        return policyText;
    }

    console.log('[WatchDogs] Failed to extract policy text');
    return null;
}

// ============================================================================
// IMPROVED COMPLIANCE CHECKING - Much More Lenient
// ============================================================================

// Check policy compliance against a regulation
async function checkPolicyCompliance(regulation) {
    const policyText = extractPrivacyPolicy();

    if (!policyText) {
        return {
            success: false,
            message: 'Could not find privacy policy on this page. Please navigate to the privacy policy page.'
        };
    }

    console.log(`[WatchDogs] Checking compliance with ${regulation}`);

    // Load regulation requirements
    const requirements = await loadRegulationRequirements(regulation);

    // Analyze compliance with LENIENT approach
    const analysis = analyzeComplianceLenient(policyText, requirements, regulation);

    return {
        success: true,
        regulation: regulation,
        score: analysis.score,
        findings: analysis.findings,
        recommendations: analysis.recommendations,
        debug: {
            policyLength: policyText.length,
            requirementsTotal: requirements.length,
            requirementsMet: analysis.requirementsMet
        }
    };
}

// Load regulation requirements from backend
async function loadRegulationRequirements(regulation) {
    try {
        const url = chrome.runtime.getURL(`backend/static/policies/${regulation}.json`);
        const response = await fetch(url);
        const data = await response.json();
        return data.requirements || [];
    } catch (error) {
        console.error('Error loading regulation requirements:', error);
        // Return default requirements
        return getDefaultRequirements(regulation);
    }
}

// Get default requirements if file not found
function getDefaultRequirements(regulation) {
    const defaults = {
        gdpr: [
            'right to access',
            'right to erasure',
            'right to rectification',
            'data portability',
            'consent mechanism',
            'data protection officer',
            'breach notification',
            'legitimate interest',
            'third party sharing'
        ],
        ccpa: [
            'right to know',
            'right to delete',
            'right to opt-out',
            'non-discrimination',
            'sale of personal information',
            'categories of information',
            'business purpose'
        ],
        pipeda: [
            'consent',
            'limiting collection',
            'limiting use',
            'accuracy',
            'safeguards',
            'openness',
            'individual access',
            'challenging compliance'
        ],
        lgpd: [
            'consent',
            'data purpose',
            'data security',
            'data subject rights',
            'international transfer',
            'data protection officer'
        ]
    };

    return defaults[regulation] || [];
}

// ============================================================================
// LENIENT COMPLIANCE ANALYSIS - Gives credit for reasonable policies
// ============================================================================

function analyzeComplianceLenient(policyText, requirements, regulation) {
    const lowerPolicy = policyText.toLowerCase();
    const findings = [];
    const recommendations = [];
    let requirementsMet = 0;
    let partiallyMet = 0;

    console.log(`[WatchDogs] Analyzing ${requirements.length} requirements`);

    // Step 1: Check each requirement with LENIENT validation
    requirements.forEach((requirement, index) => {
        const result = validateRequirementLenient(requirement, lowerPolicy, regulation);

        console.log(`[WatchDogs] Requirement ${index + 1}/${requirements.length}: "${requirement}" -> ${result.status}`);

        if (result.status === 'FOUND') {
            requirementsMet++;
        } else if (result.status === 'PARTIAL') {
            partiallyMet++;
            findings.push(`⚡ Partially Addressed: ${requirement}`);
        } else if (result.status === 'VIOLATED') {
            findings.push(`❌ VIOLATED: ${requirement} - ${result.reason}`);
            recommendations.push(`Fix violation: ${result.recommendation}`);
        } else {
            findings.push(`◯ Not Clearly Addressed: ${requirement}`);
            recommendations.push(`Consider adding: ${requirement}`);
        }
    });

    // Step 2: Detect ONLY CRITICAL violations (law-breaking)
    const criticalViolations = detectCriticalViolationsOnly(lowerPolicy);

    criticalViolations.forEach(violation => {
        findings.push(`🚨 CRITICAL: ${violation.issue}`);
        recommendations.push(violation.recommendation);
    });

    // Step 3: Calculate LENIENT score
    // Base score: Give full credit for found + partial credit for partial
    const baseScore = ((requirementsMet + partiallyMet * 0.6) / requirements.length) * 100;

    // Only apply penalties for CRITICAL violations (not moderate or minor)
    const criticalPenalty = criticalViolations.length * 10; // Reduced from 15 to 10

    const finalScore = Math.max(0, Math.min(100, Math.round(baseScore - criticalPenalty)));

    console.log(`[WatchDogs] Score Calculation:
        - Requirements Met: ${requirementsMet}/${requirements.length}
        - Partially Met: ${partiallyMet}
        - Base Score: ${baseScore.toFixed(1)}%
        - Critical Violations: ${criticalViolations.length}
        - Penalty: -${criticalPenalty}%
        - Final Score: ${finalScore}%`);

    if (findings.length === 0) {
        findings.push('✅ Policy addresses most major requirements');
    }

    return {
        score: finalScore,
        findings,
        recommendations,
        requirementsMet: requirementsMet + partiallyMet,
        criticalViolations: criticalViolations.length
    };
}

// ============================================================================
// LENIENT REQUIREMENT VALIDATION - Recognizes many ways to express requirements
// ============================================================================

function validateRequirementLenient(requirement, policyText, regulation) {
    const reqLower = requirement.toLowerCase();

    // Define keyword sets with SYNONYMS for each common requirement
    const keywordSets = getKeywordSetsForRequirement(reqLower, regulation);

    // Check if ANY keyword set is found
    let foundKeywordSet = null;
    let foundCount = 0;

    for (const keywordSet of keywordSets) {
        const matchCount = keywordSet.filter(keyword => policyText.includes(keyword)).length;

        if (matchCount > 0) {
            foundCount = matchCount;
            foundKeywordSet = keywordSet;
            break;
        }
    }

    if (!foundKeywordSet || foundCount === 0) {
        return { status: 'NOT_FOUND' };
    }

    // Found keywords - now check for CRITICAL negative context only
    const hasViolation = checkForCriticalViolation(foundKeywordSet, policyText);

    if (hasViolation) {
        return {
            status: 'VIOLATED',
            reason: 'Requirement mentioned but explicitly violated',
            recommendation: `Remove violating language about ${requirement}`
        };
    }

    // Check if fully or partially addressed
    if (foundCount >= foundKeywordSet.length * 0.5) {
        return { status: 'FOUND' };
    } else {
        return { status: 'PARTIAL' };
    }
}

// Get keyword sets for a requirement with SYNONYMS
function getKeywordSetsForRequirement(requirement, regulation) {
    const sets = [];

    // Common patterns with synonyms
    if (requirement.includes('access')) {
        sets.push(['access', 'view', 'obtain', 'retrieve', 'copy']);
        sets.push(['access your data', 'view your information', 'see your data']);
    }

    if (requirement.includes('delete') || requirement.includes('erasure')) {
        sets.push(['delete', 'erase', 'remove', 'deletion']);
        sets.push(['delete your data', 'remove your information', 'erase your data']);
    }

    if (requirement.includes('opt-out') || requirement.includes('opt out')) {
        sets.push(['opt-out', 'opt out', 'unsubscribe', 'do not sell']);
        sets.push(['opt-out of sale', 'do not sell my']);
    }

    if (requirement.includes('consent')) {
        sets.push(['consent', 'permission', 'agree', 'authorization']);
        sets.push(['your consent', 'with your permission', 'you agree']);
    }

    if (requirement.includes('rectification') || requirement.includes('correct')) {
        sets.push(['rectify', 'correct', 'update', 'amend', 'modify']);
        sets.push(['correct your data', 'update your information']);
    }

    if (requirement.includes('portability')) {
        sets.push(['portability', 'export', 'download', 'transfer']);
        sets.push(['data portability', 'export your data', 'download your data']);
    }

    if (requirement.includes('categories')) {
        sets.push(['categories', 'types', 'kinds']);
        sets.push(['categories of information', 'types of data']);
    }

    if (requirement.includes('purpose')) {
        sets.push(['purpose', 'reason', 'use', 'why']);
        sets.push(['purpose of', 'why we collect', 'how we use']);
    }

    if (requirement.includes('third party') || requirement.includes('shar')) {
        sets.push(['third party', 'third-party', 'share', 'sharing']);
        sets.push(['share with', 'third parties', 'share your']);
    }

    if (requirement.includes('security')) {
        sets.push(['security', 'protect', 'safeguard', 'secure']);
        sets.push(['security measures', 'protect your data', 'keep your data safe']);
    }

    if (requirement.includes('breach')) {
        sets.push(['breach', 'notification', 'notify', 'inform']);
        sets.push(['data breach', 'security breach', 'notify you']);
    }

    if (requirement.includes('retention')) {
        sets.push(['retention', 'keep', 'store', 'retain']);
        sets.push(['how long', 'retention period', 'keep your data']);
    }

    if (requirement.includes('discrimination')) {
        sets.push(['discrimination', 'discriminate', 'equal treatment']);
        sets.push(['will not discriminate', 'non-discrimination']);
    }

    if (requirement.includes('data protection officer') || requirement.includes('dpo')) {
        sets.push(['data protection officer', 'dpo', 'privacy officer']);
    }

    // Fallback: use words from requirement itself
    if (sets.length === 0) {
        const words = requirement.split(' ').filter(w => w.length > 3);
        sets.push(words);
    }

    return sets;
}

// Check for CRITICAL violations only (not normal disclaimers)
function checkForCriticalViolation(keywords, policyText) {
    // Only check for EXPLICIT denials, not soft language
    const criticalNegations = [
        /will not (provide|honor|allow|grant|respect)/i,
        /cannot (provide|honor|allow|grant|give)/i,
        /do not (provide|offer|allow|grant|give).*(right|ability)/i,
        /refuse to (provide|honor|allow|grant)/i,
        /you waive.*right/i
    ];

    for (const keyword of keywords) {
        const index = policyText.indexOf(keyword);
        if (index !== -1) {
            const start = Math.max(0, index - 150);
            const end = Math.min(policyText.length, index + 150);
            const context = policyText.substring(start, end);

            for (const negation of criticalNegations) {
                if (negation.test(context)) {
                    return true;
                }
            }
        }
    }

    return false;
}

// ============================================================================
// CRITICAL VIOLATIONS ONLY - Only flag truly illegal/unethical practices
// ============================================================================

function detectCriticalViolationsOnly(policyText) {
    const violations = [];

    // ONLY 3 CRITICAL violations - actual law-breaking
    const criticalChecks = [
        {
            pattern: /you (waive|relinquish|give up|forfeit) (all|any|your) (rights?|claims?)|waive.*right to sue|no right to (sue|claim)/i,
            issue: 'Forces users to waive legal rights',
            recommendation: 'Cannot legally force users to waive privacy rights'
        },
        {
            pattern: /(will not|cannot|refuse to) (delete|remove|erase).*(your )?data|no (way|method|means|option) to delete/i,
            issue: 'Explicitly refuses data deletion',
            recommendation: 'Must provide data deletion mechanism (GDPR/CCPA requirement)',
            skipIf: /except (where|when)|unless (required|necessary)|as required by law/i
        },
        {
            pattern: /may ignore (all |your )?requests?|will ignore.*requests?|arbitrarily (deny|refuse)/i,
            issue: 'Reserves right to arbitrarily ignore user rights',
            recommendation: 'Cannot arbitrarily deny legitimate user rights requests'
        }
    ];

    criticalChecks.forEach(check => {
        if (check.pattern.test(policyText)) {
            // Check skipIf condition
            if (check.skipIf && check.skipIf.test(policyText)) {
                return; // Skip this one
            }

            violations.push({
                issue: check.issue,
                recommendation: check.recommendation
            });
        }
    });

    return violations;
}

// ============================================================================
// POLICY SUMMARIZER (unchanged)
// ============================================================================

// Summarize policy using Groq API
async function summarizePolicy(apiKey) {
    const policyText = extractPrivacyPolicy();

    if (!policyText) {
        return {
            success: false,
            message: 'Could not find privacy policy on this page. Please navigate to the privacy policy page.'
        };
    }

    // Truncate if too long (Groq has token limits)
    const maxLength = 8000;
    const textToSummarize = policyText.length > maxLength
        ? policyText.substring(0, maxLength) + '...'
        : policyText;

    try {
        const summary = await callGroqAPI(apiKey, textToSummarize);

        return {
            success: true,
            summary: summary
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error calling Groq API: ' + error.message
        };
    }
}

// Call Groq API for summarization
async function callGroqAPI(apiKey, text) {
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    const prompt = `Analyze this privacy policy in detail and provide a comprehensive summary with the following sections:

1. Key Points: List 7-10 most important points users should know about this policy
2. Data Collection: Detailed explanation of what data is collected and how
3. User Rights: What specific rights users have regarding their data
4. Red Flags: Any concerning or potentially problematic clauses (if present)
5. Third Party Sharing: How data is shared with third parties
6. Data Retention: How long data is kept

Privacy Policy:
${text}

Format your response as JSON with keys: keyPoints (array of strings), dataCollection (string), userRights (string), redFlags (array of strings, can be empty), thirdPartySharing (string), dataRetention (string)

Be thorough and highlight any concerning practices.`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'You are a privacy policy expert that analyzes privacy policies and identifies both positive and concerning practices. Always respond with valid JSON. Be thorough and detailed in your analysis.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.2,
            max_tokens: 2000
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
        throw new Error('No response from API');
    }

    try {
        // Try to parse as JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        // Fallback: return as plain text
        return { keyPoints: [content] };
    } catch (e) {
        // If JSON parsing fails, return as array of points
        const points = content.split('\n').filter(line => line.trim().length > 0);
        return points;
    }
}

// Initialize
console.log('WatchDogs extension content script loaded');
