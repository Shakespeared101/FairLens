// Dark Pattern Knowledge Base
// Semantic descriptions and examples for LLM-based detection

export const DARK_PATTERN_KNOWLEDGE = {
    urgency: {
        name: "Urgency/Scarcity",
        description: "Creates false or exaggerated sense of urgency to pressure users into quick decisions",
        semanticIndicators: [
            "Time pressure language",
            "Limited availability claims",
            "Countdown timers",
            "Stock scarcity warnings",
            "Expiration threats",
            "Now-or-never messaging"
        ],
        examples: [
            "Only 2 left in stock!",
            "Sale ends in 3 hours",
            "Limited time offer",
            "Almost gone",
            "Act now before it's too late",
            "This deal won't last",
            "Hurry, selling fast"
        ],
        intent: "Manipulate users through artificial time/scarcity pressure",
        severity: "medium"
    },

    confirmshaming: {
        name: "Confirmshaming",
        description: "Uses guilt, shame, or negative emotions to manipulate users who decline an offer",
        semanticIndicators: [
            "Guilt-inducing decline options",
            "Shame-based language",
            "Negative self-description in opt-out",
            "Emotional manipulation",
            "Implied personal failure"
        ],
        examples: [
            "No thanks, I don't want to save money",
            "No, I prefer paying full price",
            "No thanks, I hate discounts",
            "Continue without protection",
            "No, I don't care about my privacy",
            "Skip and remain vulnerable"
        ],
        intent: "Shame users into accepting unwanted offers",
        severity: "high"
    },

    forcedContinuity: {
        name: "Forced Continuity",
        description: "Makes it easy to sign up but difficult to cancel subscriptions or services",
        semanticIndicators: [
            "Easy signup, hard cancel",
            "Free trial that auto-renews",
            "Hidden cancellation process",
            "Subscription without clear exit",
            "Automatic renewal without notice"
        ],
        examples: [
            "Free trial, cancel anytime (but process is hidden)",
            "Automatic renewal after trial",
            "No commitment (but hard to find cancel)",
            "Start your free trial (charges automatically)",
            "Try free for 7 days"
        ],
        intent: "Trap users in subscriptions they can't easily exit",
        severity: "high"
    },

    hiddenCosts: {
        name: "Hidden Costs",
        description: "Conceals additional fees, charges, or costs until late in the purchase process",
        semanticIndicators: [
            "Surprise fees at checkout",
            "Undisclosed additional charges",
            "Hidden shipping costs",
            "Service fees revealed late",
            "Tax not included in price"
        ],
        examples: [
            "Plus tax and shipping",
            "Additional fees may apply",
            "Excluding handling fees",
            "Service charge not included",
            "Processing fee added at checkout",
            "Convenience fee applies"
        ],
        intent: "Deceive users about true cost until committed",
        severity: "high"
    },

    misdirection: {
        name: "Misdirection",
        description: "Draws attention to one thing to distract from another, often using visual tricks",
        semanticIndicators: [
            "Prominent accept/allow buttons",
            "Hidden decline options",
            "Visual emphasis on one choice",
            "Deceptive button placement",
            "Confusing visual hierarchy"
        ],
        examples: [
            "Accept all (big button) vs Manage preferences (tiny link)",
            "Allow all cookies (highlighted) vs Necessary only (grayed out)",
            "Agree (green, large) vs Decline (gray, small)",
            "Subscribe (prominent) vs No thanks (barely visible)"
        ],
        intent: "Manipulate attention to favor desired action",
        severity: "medium"
    },

    trickQuestions: {
        name: "Trick Questions",
        description: "Uses confusing or double-negative wording to trick users into unintended choices",
        semanticIndicators: [
            "Double negatives",
            "Confusing checkbox wording",
            "Reverse logic",
            "Ambiguous phrasing",
            "Contradictory instructions"
        ],
        examples: [
            "Uncheck to opt out",
            "Check here to NOT receive emails",
            "Disable to enable notifications",
            "Click to stop not receiving updates",
            "Opt out of unsubscribing"
        ],
        intent: "Confuse users into making wrong choices",
        severity: "high"
    },

    sneaking: {
        name: "Sneaking",
        description: "Hides, disguises, or delays revealing information until user is committed",
        semanticIndicators: [
            "Pre-checked boxes for extras",
            "Hidden items added to cart",
            "Bundled unwanted items",
            "Auto-enrollment in programs",
            "Unexpected additions"
        ],
        examples: [
            "Pre-checked: Add insurance ($15)",
            "Newsletter subscription (checked by default)",
            "Marketing consent (pre-selected)",
            "Sign up for premium (auto-selected)"
        ],
        intent: "Sneak unwanted items/commitments past users",
        severity: "high"
    },

    socialProof: {
        name: "Social Proof (Fabricated)",
        description: "Uses potentially fake or misleading social proof to influence decisions",
        semanticIndicators: [
            "Suspicious popularity claims",
            "Vague customer numbers",
            "Unverified testimonials",
            "Generic review counts",
            "Manufactured trends"
        ],
        examples: [
            "10,000 people are viewing this",
            "Most popular choice",
            "Bestseller (without proof)",
            "Trending now",
            "Customer favorite",
            "Highly rated (no rating shown)"
        ],
        intent: "Create false impression of popularity",
        severity: "low"
    },

    baitAndSwitch: {
        name: "Bait and Switch",
        description: "Advertises one thing but delivers another, or shows fake prices/discounts",
        semanticIndicators: [
            "Fake original prices",
            "Misleading discounts",
            "Inflated 'regular' prices",
            "Different product delivered",
            "False savings claims"
        ],
        examples: [
            "Was $199, now $99 (never was $199)",
            "Originally $500 (fabricated price)",
            "Save 70% (inflated base price)",
            "Regular price $X (never sold at that price)"
        ],
        intent: "Deceive users about value or offering",
        severity: "medium"
    },

    obstruction: {
        name: "Obstruction",
        description: "Makes desired user actions difficult or impossible to complete",
        semanticIndicators: [
            "Hard-to-find settings",
            "Multiple steps to cancel",
            "Disabled options without reason",
            "Broken unsubscribe links",
            "Convoluted processes"
        ],
        examples: [
            "Call to cancel (no online option)",
            "Contact customer service to unsubscribe",
            "Account deletion requires phone call",
            "Privacy settings buried in menus"
        ],
        intent: "Prevent users from taking desired actions",
        severity: "high"
    },

    nagging: {
        name: "Nagging",
        description: "Repeatedly interrupts or pesters users to take unwanted actions",
        semanticIndicators: [
            "Repeated popup requests",
            "Persistent notifications",
            "Multiple asks for same action",
            "Won't take no for answer",
            "Constant reminders"
        ],
        examples: [
            "Enable notifications (asked repeatedly)",
            "Rate our app (every time you open)",
            "Subscribe to newsletter (shown every visit)",
            "Allow location (asked on every page)"
        ],
        intent: "Wear down user resistance through repetition",
        severity: "medium"
    }
};

// LLM Prompt for dark pattern detection
export const DARK_PATTERN_DETECTION_PROMPT = `You are an expert at identifying dark patterns in user interfaces and website copy. Dark patterns are deceptive design techniques that trick or manipulate users into doing things they might not want to do.

Analyze the following text and determine if it contains any dark patterns. Consider not just exact keyword matches, but also semantic meaning, intent, and manipulative techniques.

Dark Pattern Categories:
1. **Urgency/Scarcity**: False time pressure or limited availability
2. **Confirmshaming**: Guilt/shame in decline options
3. **Forced Continuity**: Easy signup, hard cancel
4. **Hidden Costs**: Surprise fees revealed late
5. **Misdirection**: Visual tricks to favor one choice
6. **Trick Questions**: Confusing double-negative wording
7. **Sneaking**: Pre-checked boxes, hidden additions
8. **Social Proof**: Fake popularity claims
9. **Bait and Switch**: Fake prices/discounts
10. **Obstruction**: Making desired actions difficult
11. **Nagging**: Repeated unwanted requests

Text to analyze: "{text}"

Context (if available): {context}

Respond in JSON format:
{
  "isDarkPattern": boolean,
  "patterns": [
    {
      "type": "pattern_type",
      "confidence": 0.0-1.0,
      "reasoning": "why this is considered a dark pattern",
      "severity": "low|medium|high"
    }
  ],
  "summary": "brief explanation"
}

If no dark patterns detected, return: {"isDarkPattern": false, "patterns": [], "summary": "No dark patterns detected"}`;

// Semantic similarity check (simplified - can be enhanced)
export function calculateSemanticSimilarity(text, examples) {
    const textLower = text.toLowerCase();

    // Simple word overlap scoring
    let maxSimilarity = 0;

    for (const example of examples) {
        const exampleWords = example.toLowerCase().split(/\s+/);
        const textWords = textLower.split(/\s+/);

        const commonWords = exampleWords.filter(word =>
            textWords.includes(word) && word.length > 3
        );

        const similarity = commonWords.length / Math.max(exampleWords.length, textWords.length);
        maxSimilarity = Math.max(maxSimilarity, similarity);
    }

    return maxSimilarity;
}

// Check if text matches semantic indicators
export function matchesSemanticIndicators(text, indicators) {
    const textLower = text.toLowerCase();

    for (const indicator of indicators) {
        const indicatorWords = indicator.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const matchedWords = indicatorWords.filter(word => textLower.includes(word));

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
