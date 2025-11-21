// Enhanced Content Script for WatchDogs Extension
// Hybrid dark pattern detection: Pattern matching + LLM verification
// Runs on all web pages to detect dark patterns and analyze policies

// ============================================================================
// DARK PATTERN DETECTION - ENHANCED WITH LLM
// ============================================================================

// Import would work with proper module setup, using inline for extension compatibility
const DARK_PATTERN_KNOWLEDGE = {
    urgency: {
        name: "Urgency/Scarcity",
        description: "Creates false or exaggerated urgency to pressure users",
        keywords: [
            'only \\d+ left', 'hurry', 'limited time', 'expires soon', 'ending soon',
            'last chance', 'almost gone', 'selling fast', 'while supplies last',
            'limited stock', 'flash sale', 'today only', 'act now', 'don\'t miss out',
            '\\d+ people (are )?viewing', 'almost sold out', 'going fast'
        ],
        semanticIndicators: ["time pressure", "limited availability", "countdown", "stock scarcity"],
        examples: ["Only 2 left!", "Sale ends in 3 hours", "Almost gone", "Limited time offer"]
    },
    confirmshaming: {
        name: "Confirmshaming",
        description: "Uses guilt or shame to manipulate users who decline",
        keywords: [
            'no thanks, i don\'t want', 'no, i\'ll pay full price',
            'no, i don\'t want to save', 'no thanks, i hate',
            'i don\'t want to', 'continue without', 'skip this (great|amazing)'
        ],
        semanticIndicators: ["guilt-inducing", "shame-based", "negative self-description"],
        examples: ["No thanks, I hate savings", "Continue without protection"]
    },
    forcedContinuity: {
        name: "Forced Continuity",
        description: "Easy signup, hard cancel subscription model",
        keywords: [
            'free trial.*cancel', 'cancel anytime', 'no commitment.*automatic',
            'start.*free trial', 'first.*free', 'automatic renewal'
        ],
        semanticIndicators: ["auto-renewal", "trial converts", "hard to cancel"],
        examples: ["Free trial, cancel anytime", "Automatic renewal after trial"]
    },
    hiddenCosts: {
        name: "Hidden Costs",
        description: "Conceals additional fees until late in process",
        keywords: [
            'additional fees may apply', 'plus tax', 'exclud(e|ing) shipping',
            'handling fee', 'service charge', 'processing fee', 'convenience fee',
            'fees? (not )?includ'
        ],
        semanticIndicators: ["surprise fees", "undisclosed charges", "hidden costs"],
        examples: ["Plus tax", "Additional fees may apply", "Excluding handling"]
    },
    misdirection: {
        name: "Misdirection",
        description: "Draws attention to one choice over others through visual tricks",
        keywords: [
            'agree to all', 'accept all', 'allow all',
            'i agree to (the )?terms', 'i accept'
        ],
        visualCues: ['button', 'checkbox'],
        semanticIndicators: ["prominent accept", "hidden decline", "visual manipulation"],
        examples: ["Accept all (big button)", "Allow all cookies"]
    },
    trickQuestions: {
        name: "Trick Questions",
        description: "Confusing wording to trick users into wrong choices",
        keywords: [
            'uncheck to opt out', 'check to not receive',
            'disable to enable', 'opt out of.*not', 'do not.*to receive'
        ],
        semanticIndicators: ["double negative", "confusing checkbox", "reverse logic"],
        examples: ["Uncheck to opt out", "Check here to NOT receive emails"]
    },
    sneaking: {
        name: "Sneaking",
        description: "Hides information or adds items without clear consent",
        keywords: [
            'pre.*select', 'default.*check', 'automatically.*add',
            'included.*purchase', 'added to (your )?cart'
        ],
        semanticIndicators: ["pre-checked", "hidden additions", "bundled unwanted"],
        examples: ["Pre-checked insurance", "Newsletter (checked by default)"]
    },
    socialProof: {
        name: "Social Proof (Fabricated)",
        description: "Potentially fake popularity claims",
        keywords: [
            '\\d+ (customers?|people) (purchased|bought|viewing)',
            'bestseller', 'most popular', '#1 choice', 'customer favorite',
            'trending( now)?', 'highly rated', '\\d+ reviews?'
        ],
        semanticIndicators: ["suspicious popularity", "unverified testimonials"],
        examples: ["10,000 people viewing", "Bestseller", "Most popular"]
    },
    baitAndSwitch: {
        name: "Bait and Switch",
        description: "Fake prices or misleading discounts",
        keywords: [
            'was \\$\\d+', 'originally \\$\\d+', 'save \\d+%',
            'regular price', 'sale price', 'now only', 'msrp'
        ],
        semanticIndicators: ["inflated original price", "fake discount"],
        examples: ["Was $199 now $99", "Save 70%"]
    },
    obstruction: {
        name: "Obstruction",
        description: "Makes desired actions difficult to complete",
        keywords: [
            'call (us )?to cancel', 'contact.*customer service.*delete',
            'write to.*unsubscribe', 'no online.*cancel'
        ],
        semanticIndicators: ["hard to find", "multiple steps", "phone required"],
        examples: ["Call to cancel", "Contact customer service to unsubscribe"]
    },
    nagging: {
        name: "Nagging",
        description: "Repeatedly asks for same action despite refusal",
        keywords: [
            'ask (me )?later', 'remind me', 'not now',
            'maybe later', 'ask again'
        ],
        semanticIndicators: ["repeated requests", "persistent popup", "won't take no"],
        examples: ["Enable notifications (shown every visit)", "Rate our app"]
    }
};

// Detection cache to avoid re-analyzing same text
const detectionCache = new Map();
const LLM_BATCH_CACHE = new Map();

// Store detected patterns
let detectedPatterns = [];
let highlightedElements = [];
let detectionMode = 'hybrid'; // 'patterns', 'llm', or 'hybrid'

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'highlightDarkPatterns') {
        detectAndHighlightDarkPatternsEnhanced(request.useAI, request.apiKey).then(result => {
            sendResponse(result);
        });
        return true; // Keep channel open for async response
    } else if (request.action === 'checkCompliance') {
        checkPolicyCompliance(request.regulation).then(result => {
            sendResponse(result);
        });
        return true;
    } else if (request.action === 'summarizePolicy') {
        summarizePolicy(request.apiKey).then(result => {
            sendResponse(result);
        });
        return true;
    }
});

// ============================================================================
// ENHANCED DARK PATTERN DETECTION - HYBRID APPROACH
// ============================================================================

async function detectAndHighlightDarkPatternsEnhanced(useAI = false, apiKey = null) {
    console.log(`[WatchDogs] Starting dark pattern detection (AI: ${useAI})`);

    // Clear previous highlights
    clearHighlights();
    detectedPatterns = [];

    // Phase 1: Fast pattern matching
    const patternCandidates = detectWithPatterns();

    console.log(`[WatchDogs] Pattern matching found ${patternCandidates.length} candidates`);

    // Phase 2: AI-enhanced detection (if enabled and API key available)
    if (useAI && apiKey) {
        try {
            const aiDetected = await detectWithAI(apiKey);
            console.log(`[WatchDogs] AI detection found ${aiDetected.length} additional patterns`);

            // Merge results (avoid duplicates)
            aiDetected.forEach(aiPattern => {
                const isDuplicate = patternCandidates.some(p =>
                    p.element === aiPattern.element && p.type === aiPattern.type
                );

                if (!isDuplicate) {
                    patternCandidates.push(aiPattern);
                }
            });
        } catch (error) {
            console.error('[WatchDogs] AI detection error:', error);
        }
    }

    // Phase 3: Semantic similarity check for borderline cases
    const semanticCandidates = detectWithSemantics();
    console.log(`[WatchDogs] Semantic detection found ${semanticCandidates.length} candidates`);

    // Merge semantic results
    semanticCandidates.forEach(semPattern => {
        const isDuplicate = patternCandidates.some(p =>
            p.element === semPattern.element && p.type === semPattern.type
        );

        if (!isDuplicate) {
            patternCandidates.push(semPattern);
        }
    });

    // Highlight all detected patterns
    patternCandidates.forEach(pattern => {
        highlightElement(pattern.element, pattern.type, pattern.description, pattern.confidence);
        detectedPatterns.push({
            type: pattern.type,
            description: pattern.description,
            text: pattern.text,
            confidence: pattern.confidence || 1.0,
            detectionMethod: pattern.method || 'pattern'
        });
    });

    return {
        success: true,
        count: detectedPatterns.length,
        patterns: detectedPatterns,
        methods: {
            pattern: patternCandidates.filter(p => p.method === 'pattern').length,
            semantic: patternCandidates.filter(p => p.method === 'semantic').length,
            ai: patternCandidates.filter(p => p.method === 'ai').length
        }
    };
}

// Pattern-based detection (fast, baseline)
function detectWithPatterns() {
    const candidates = [];
    const textElements = document.querySelectorAll('p, span, div, button, a, label, h1, h2, h3, h4, h5, h6, li');

    textElements.forEach(element => {
        const text = element.textContent.trim();
        const textLower = text.toLowerCase();

        // Skip if element is too large or empty
        if (text.length === 0 || text.length > 500) return;

        // Check cache
        const cacheKey = `${textLower.substring(0, 50)}_${text.length}`;
        if (detectionCache.has(cacheKey)) {
            const cached = detectionCache.get(cacheKey);
            if (cached) {
                candidates.push({ ...cached, element });
            }
            return;
        }

        // Check against each dark pattern
        for (const [patternType, rule] of Object.entries(DARK_PATTERN_KNOWLEDGE)) {
            for (const keyword of rule.keywords) {
                const regex = new RegExp(keyword, 'i');
                if (regex.test(textLower)) {
                    const result = {
                        element,
                        type: patternType,
                        description: rule.description,
                        text: text.substring(0, 100),
                        confidence: 1.0,
                        method: 'pattern'
                    };

                    candidates.push(result);
                    detectionCache.set(cacheKey, result);
                    return; // Only one pattern per element
                }
            }
        }

        detectionCache.set(cacheKey, null);
    });

    // Check for pre-checked checkboxes (sneaking)
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        const label = findLabelForCheckbox(checkbox);
        if (label) {
            const text = label.textContent.toLowerCase();
            if (text.includes('newsletter') || text.includes('marketing') || text.includes('promotional')) {
                candidates.push({
                    element: checkbox,
                    type: 'sneaking',
                    description: 'Pre-checked consent checkbox',
                    text: label.textContent.substring(0, 100),
                    confidence: 1.0,
                    method: 'pattern'
                });
            }
        }
    });

    return candidates;
}

// Semantic similarity detection (catches similar wordings)
function detectWithSemantics() {
    const candidates = [];
    const textElements = document.querySelectorAll('button, a, label, span.decline, span.cancel, div[role="button"]');

    textElements.forEach(element => {
        const text = element.textContent.trim();
        const textLower = text.toLowerCase();

        if (text.length === 0 || text.length > 200) return;

        // Check semantic similarity with known examples
        for (const [patternType, rule] of Object.entries(DARK_PATTERN_KNOWLEDGE)) {
            if (!rule.examples) continue;

            const similarity = calculateSemanticSimilarity(textLower, rule.examples);

            // If similarity above threshold, it's likely a dark pattern
            if (similarity > 0.5) {
                candidates.push({
                    element,
                    type: patternType,
                    description: rule.description,
                    text: text.substring(0, 100),
                    confidence: similarity,
                    method: 'semantic'
                });
                return;
            }

            // Check semantic indicators
            const indicatorMatch = matchesSemanticIndicators(textLower, rule.semanticIndicators);
            if (indicatorMatch.matched && indicatorMatch.confidence > 0.6) {
                candidates.push({
                    element,
                    type: patternType,
                    description: rule.description,
                    text: text.substring(0, 100),
                    confidence: indicatorMatch.confidence,
                    method: 'semantic'
                });
                return;
            }
        }
    });

    return candidates;
}

// Calculate semantic similarity between text and examples
function calculateSemanticSimilarity(text, examples) {
    let maxSimilarity = 0;

    for (const example of examples) {
        const exampleWords = example.toLowerCase().split(/\W+/).filter(w => w.length > 3);
        const textWords = text.split(/\W+/).filter(w => w.length > 3);

        const commonWords = exampleWords.filter(word => textWords.includes(word));
        const similarity = commonWords.length / Math.max(exampleWords.length, textWords.length, 1);

        maxSimilarity = Math.max(maxSimilarity, similarity);
    }

    return maxSimilarity;
}

// Check if text matches semantic indicators
function matchesSemanticIndicators(text, indicators) {
    for (const indicator of indicators) {
        const indicatorWords = indicator.toLowerCase().split(/\W+/).filter(w => w.length > 3);
        const matchedWords = indicatorWords.filter(word => text.includes(word));

        if (matchedWords.length >= Math.ceil(indicatorWords.length * 0.6)) {
            return {
                matched: true,
                indicator: indicator,
                confidence: matchedWords.length / indicatorWords.length
            };
        }
    }

    return { matched: false, confidence: 0 };
}

// AI-based detection using Groq LLM (batch processing)
async function detectWithAI(apiKey) {
    const candidates = [];

    // Collect suspicious elements (buttons, links, prompts)
    const suspiciousElements = document.querySelectorAll(
        'button, a, label, [role="button"], .modal, .popup, .banner, .notice'
    );

    // Batch texts for analysis
    const batch = [];
    const elementMap = new Map();

    suspiciousElements.forEach((element, idx) => {
        const text = element.textContent.trim();

        if (text.length < 5 || text.length > 300) return;

        // Skip if obviously normal
        if (isObviouslyNormalText(text)) return;

        batch.push({
            id: idx,
            text: text,
            context: getElementContext(element)
        });

        elementMap.set(idx, element);
    });

    // Process in batches of 20
    const batchSize = 20;
    for (let i = 0; i < batch.length; i += batchSize) {
        const currentBatch = batch.slice(i, i + batchSize);

        try {
            const results = await analyzeTextBatchForDarkPatterns(apiKey, currentBatch);

            results.forEach(result => {
                if (result.isDarkPattern && result.patterns && result.patterns.length > 0) {
                    const element = elementMap.get(result.id);
                    const pattern = result.patterns[0]; // Take highest confidence

                    candidates.push({
                        element,
                        type: pattern.type,
                        description: pattern.reasoning || DARK_PATTERN_KNOWLEDGE[pattern.type]?.description,
                        text: currentBatch.find(b => b.id === result.id).text.substring(0, 100),
                        confidence: pattern.confidence,
                        method: 'ai'
                    });
                }
            });
        } catch (error) {
            console.error('[WatchDogs] Batch AI analysis error:', error);
        }
    }

    return candidates;
}

// Analyze batch of texts with LLM
async function analyzeTextBatchForDarkPatterns(apiKey, batch) {
    const prompt = `Analyze these UI texts for dark patterns. Dark patterns are manipulative design techniques.

Texts to analyze:
${batch.map(b => `[${b.id}] "${b.text}" (Context: ${b.context})`).join('\n')}

For each text, determine if it contains dark patterns from these categories:
- urgency: False time pressure
- confirmshaming: Guilt in decline options
- forcedContinuity: Hard to cancel
- hiddenCosts: Surprise fees
- misdirection: Visual tricks
- trickQuestions: Confusing wording
- sneaking: Pre-checked boxes
- socialProof: Fake popularity
- baitAndSwitch: Fake prices
- obstruction: Hard to complete
- nagging: Repeated requests

Respond with JSON array:
[
  {
    "id": number,
    "isDarkPattern": boolean,
    "patterns": [{"type": "type", "confidence": 0.0-1.0, "reasoning": "brief"}]
  }
]`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
                    content: 'You are a UX expert specializing in detecting dark patterns. Respond only with valid JSON.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.1,
            max_tokens: 2000
        })
    });

    if (!response.ok) {
        throw new Error('AI analysis failed');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.error('[WatchDogs] JSON parse error:', e);
    }

    return [];
}

// Get context around element
function getElementContext(element) {
    const parent = element.parentElement;
    const siblings = parent ? Array.from(parent.children).slice(0, 3) : [];

    const context = siblings
        .map(el => el.textContent.trim().substring(0, 30))
        .filter(t => t.length > 0)
        .join(', ');

    return context || 'none';
}

// Check if text is obviously normal
function isObviouslyNormalText(text) {
    const normal Patterns = [
        /^(home|about|contact|login|sign up|search|menu|close|ok|yes|no)$/i,
        /^(submit|send|next|previous|back|cancel)$/i,
        /^\d+$/,
        /^[A-Z]{1,5}$/
    ];

    return normalPatterns.some(pattern => pattern.test(text.trim()));
}

// ============================================================================
// HIGHLIGHTING AND UI
// ============================================================================

function highlightElement(element, type, description, confidence = 1.0) {
    if (element.classList.contains('dark-pattern-highlight')) return;

    element.classList.add('dark-pattern-highlight');
    element.setAttribute('data-dark-pattern', type);
    element.setAttribute('data-confidence', confidence.toFixed(2));
    element.setAttribute('title', `⚠️ Dark Pattern: ${description} (${Math.round(confidence * 100)}% confidence)`);

    highlightedElements.push(element);

    element.addEventListener('mouseenter', showTooltip);
    element.addEventListener('mouseleave', hideTooltip);
}

function clearHighlights() {
    highlightedElements.forEach(element => {
        element.classList.remove('dark-pattern-highlight');
        element.removeAttribute('data-dark-pattern');
        element.removeAttribute('data-confidence');
        element.removeAttribute('title');
        element.removeEventListener('mouseenter', showTooltip);
        element.removeEventListener('mouseleave', hideTooltip);
    });
    highlightedElements = [];

    const tooltips = document.querySelectorAll('.dark-pattern-tooltip');
    tooltips.forEach(tooltip => tooltip.remove());
}

function showTooltip(event) {
    const element = event.target;
    const type = element.getAttribute('data-dark-pattern');
    const confidence = element.getAttribute('data-confidence');
    const description = DARK_PATTERN_KNOWLEDGE[type]?.description || 'Dark pattern detected';

    const tooltip = document.createElement('div');
    tooltip.className = 'dark-pattern-tooltip';
    tooltip.textContent = `⚠️ ${type.toUpperCase()}: ${description} (${Math.round(confidence * 100)}% confidence)`;
    tooltip.style.position = 'absolute';
    tooltip.style.zIndex = '10000';

    document.body.appendChild(tooltip);

    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';

    element._tooltip = tooltip;
}

function hideTooltip(event) {
    const tooltip = event.target._tooltip;
    if (tooltip) {
        tooltip.remove();
    }
}

function findLabelForCheckbox(checkbox) {
    if (checkbox.id) {
        const label = document.querySelector(`label[for="${checkbox.id}"]`);
        if (label) return label;
    }

    let parent = checkbox.parentElement;
    while (parent) {
        if (parent.tagName === 'LABEL') return parent;
        parent = parent.parentElement;
    }

    let sibling = checkbox.nextElementSibling;
    if (sibling && sibling.tagName === 'LABEL') return sibling;

    return null;
}

// ============================================================================
// POLICY COMPLIANCE CHECKING (keep existing from previous version)
// ============================================================================

// [Previous compliance checking code remains the same - extractPrivacyPolicy, checkPolicyCompliance, etc.]
// [Copy from lines 243-800 of previous content.js]

console.log('[WatchDogs] Enhanced content script loaded with AI detection');
