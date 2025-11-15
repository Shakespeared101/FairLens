// Dark pattern detection utilities for WatchDogs extension

/**
 * Dark pattern categories and detection rules
 */
const DARK_PATTERN_CATEGORIES = {
    URGENCY: {
        name: 'False Urgency',
        severity: 'high',
        description: 'Creates artificial time pressure to force quick decisions'
    },
    SCARCITY: {
        name: 'Fake Scarcity',
        severity: 'high',
        description: 'Claims limited availability to pressure purchases'
    },
    SOCIAL_PROOF: {
        name: 'Misleading Social Proof',
        severity: 'medium',
        description: 'Uses potentially fabricated popularity indicators'
    },
    MISDIRECTION: {
        name: 'Misdirection',
        severity: 'high',
        description: 'Draws attention away from better choices'
    },
    CONFIRMSHAMING: {
        name: 'Confirmshaming',
        severity: 'high',
        description: 'Shames users for declining offers'
    },
    FORCED_CONTINUITY: {
        name: 'Forced Continuity',
        severity: 'medium',
        description: 'Makes cancellation difficult after free trial'
    },
    SNEAKING: {
        name: 'Sneaking',
        severity: 'high',
        description: 'Hides or delays disclosure of information'
    },
    TRICK_QUESTIONS: {
        name: 'Trick Questions',
        severity: 'high',
        description: 'Uses confusing wording to trick users'
    },
    PRICE_COMPARISON: {
        name: 'Price Comparison Prevention',
        severity: 'medium',
        description: 'Makes it hard to compare prices'
    },
    HIDDEN_COSTS: {
        name: 'Hidden Costs',
        severity: 'high',
        description: 'Reveals extra costs late in the process'
    }
};

/**
 * Detect urgency dark patterns
 * @param {string} text - Text to analyze
 * @returns {boolean} - True if pattern detected
 */
function detectUrgency(text) {
    const patterns = [
        /only \d+ (left|remaining)/i,
        /\d+ (hours?|minutes?|days?) (left|remaining)/i,
        /(hurry|act now|don't wait|limited time)/i,
        /(expires? (soon|today)|ending soon)/i,
        /last chance/i,
        /(almost|nearly) (gone|sold out)/i,
        /selling fast/i,
        /flash sale/i
    ];

    return patterns.some(pattern => pattern.test(text));
}

/**
 * Detect scarcity dark patterns
 * @param {string} text - Text to analyze
 * @returns {boolean} - True if pattern detected
 */
function detectScarcity(text) {
    const patterns = [
        /\d+ (people|users|customers) (viewing|looking at|watching)/i,
        /high demand/i,
        /low stock/i,
        /limited (stock|quantity|availability)/i,
        /while supplies last/i,
        /in high demand/i
    ];

    return patterns.some(pattern => pattern.test(text));
}

/**
 * Detect social proof manipulation
 * @param {string} text - Text to analyze
 * @returns {boolean} - True if pattern detected
 */
function detectSocialProof(text) {
    const patterns = [
        /\d+ (customers?|people|users) (bought|purchased|ordered)/i,
        /bestseller/i,
        /(most|very) popular/i,
        /#\d+ (choice|seller)/i,
        /trending (now|today)/i,
        /\d+k?\+ (reviews?|ratings?)/i,
        /⭐+.*\d+/i  // Star ratings
    ];

    return patterns.some(pattern => pattern.test(text));
}

/**
 * Detect confirmshaming
 * @param {string} text - Text to analyze
 * @returns {boolean} - True if pattern detected
 */
function detectConfirmshaming(text) {
    const patterns = [
        /no thanks?,? i (don't want|hate|prefer|like)/i,
        /no,? i'll pay full price/i,
        /i don't want to save/i,
        /continue without/i,
        /skip this (offer|deal)/i,
        /no,? i'm not interested in/i
    ];

    return patterns.some(pattern => pattern.test(text));
}

/**
 * Detect hidden costs
 * @param {string} text - Text to analyze
 * @returns {boolean} - True if pattern detected
 */
function detectHiddenCosts(text) {
    const patterns = [
        /(additional|extra) (fees?|charges?) may apply/i,
        /plus (tax|shipping|handling)/i,
        /excluding (tax|shipping|fees?)/i,
        /(service|processing|convenience|handling) (fee|charge)/i,
        /taxes? and fees? not included/i
    ];

    return patterns.some(pattern => pattern.test(text));
}

/**
 * Detect forced continuity
 * @param {string} text - Text to analyze
 * @returns {boolean} - True if pattern detected
 */
function detectForcedContinuity(text) {
    const patterns = [
        /free trial/i,
        /cancel anytime/i,
        /no commitment/i,
        /try (it )?free/i,
        /(first|initial) (month|week|period) free/i,
        /(auto|automatic)(-|\s)?(renew|renewal)/i,
        /subscription/i
    ];

    return patterns.some(pattern => pattern.test(text));
}

/**
 * Detect trick questions/confusing language
 * @param {string} text - Text to analyze
 * @returns {boolean} - True if pattern detected
 */
function detectTrickQuestions(text) {
    const patterns = [
        /uncheck to (opt out|not receive)/i,
        /check to (not|stop) receive/i,
        /(don't|do not) send me/i,
        /unsubscribe/i,
        /opt out of/i,
        /decline to (accept|receive)/i
    ];

    return patterns.some(pattern => pattern.test(text));
}

/**
 * Detect sneaking (pre-checked boxes, hidden items in basket)
 * @param {Element} element - DOM element to check
 * @returns {boolean} - True if pattern detected
 */
function detectSneaking(element) {
    if (element.type === 'checkbox' && element.checked) {
        const label = findLabelText(element);
        if (label) {
            const patterns = [
                /newsletter/i,
                /marketing/i,
                /promotional/i,
                /third.{0,5}party/i,
                /partner offers/i,
                /special offers/i
            ];
            return patterns.some(pattern => pattern.test(label));
        }
    }
    return false;
}

/**
 * Find label text for an input element
 * @param {Element} element - Input element
 * @returns {string|null} - Label text or null
 */
function findLabelText(element) {
    // Check for associated label
    if (element.id) {
        const label = document.querySelector(`label[for="${element.id}"]`);
        if (label) return label.textContent;
    }

    // Check parent label
    let parent = element.parentElement;
    while (parent) {
        if (parent.tagName === 'LABEL') {
            return parent.textContent;
        }
        parent = parent.parentElement;
    }

    // Check next sibling
    if (element.nextElementSibling && element.nextElementSibling.tagName === 'LABEL') {
        return element.nextElementSibling.textContent;
    }

    return null;
}

/**
 * Get all dark pattern detection functions
 * @returns {object} - Map of category to detection function
 */
function getDetectionFunctions() {
    return {
        urgency: detectUrgency,
        scarcity: detectScarcity,
        socialProof: detectSocialProof,
        confirmshaming: detectConfirmshaming,
        hiddenCosts: detectHiddenCosts,
        forcedContinuity: detectForcedContinuity,
        trickQuestions: detectTrickQuestions,
        sneaking: detectSneaking
    };
}

/**
 * Analyze element for all dark patterns
 * @param {Element} element - DOM element to analyze
 * @returns {object|null} - Detection result or null
 */
function analyzeElement(element) {
    const text = element.textContent.trim();

    if (!text || text.length > 500) return null;

    const detections = [];

    // Text-based detections
    if (detectUrgency(text)) {
        detections.push({ type: 'urgency', ...DARK_PATTERN_CATEGORIES.URGENCY });
    }
    if (detectScarcity(text)) {
        detections.push({ type: 'scarcity', ...DARK_PATTERN_CATEGORIES.SCARCITY });
    }
    if (detectSocialProof(text)) {
        detections.push({ type: 'socialProof', ...DARK_PATTERN_CATEGORIES.SOCIAL_PROOF });
    }
    if (detectConfirmshaming(text)) {
        detections.push({ type: 'confirmshaming', ...DARK_PATTERN_CATEGORIES.CONFIRMSHAMING });
    }
    if (detectHiddenCosts(text)) {
        detections.push({ type: 'hiddenCosts', ...DARK_PATTERN_CATEGORIES.HIDDEN_COSTS });
    }
    if (detectForcedContinuity(text)) {
        detections.push({ type: 'forcedContinuity', ...DARK_PATTERN_CATEGORIES.FORCED_CONTINUITY });
    }
    if (detectTrickQuestions(text)) {
        detections.push({ type: 'trickQuestions', ...DARK_PATTERN_CATEGORIES.TRICK_QUESTIONS });
    }

    // Element-based detections
    if (detectSneaking(element)) {
        detections.push({ type: 'sneaking', ...DARK_PATTERN_CATEGORIES.SNEAKING });
    }

    return detections.length > 0 ? detections[0] : null;
}

export {
    DARK_PATTERN_CATEGORIES,
    detectUrgency,
    detectScarcity,
    detectSocialProof,
    detectConfirmshaming,
    detectHiddenCosts,
    detectForcedContinuity,
    detectTrickQuestions,
    detectSneaking,
    getDetectionFunctions,
    analyzeElement
};
