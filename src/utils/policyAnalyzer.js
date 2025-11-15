// Policy analyzer utilities for WatchDogs extension

/**
 * Extract policy sections from text
 * @param {string} policyText - Full policy text
 * @returns {object} - Extracted sections
 */
function extractPolicySections(policyText) {
    const sections = {
        dataCollection: [],
        dataUsage: [],
        dataSharing: [],
        userRights: [],
        security: [],
        cookies: [],
        children: [],
        contact: []
    };

    const lines = policyText.split('\n');
    let currentSection = null;

    const sectionKeywords = {
        dataCollection: ['collect', 'information we collect', 'data we gather', 'personal information'],
        dataUsage: ['use of', 'how we use', 'purpose', 'processing'],
        dataSharing: ['share', 'disclose', 'third party', 'third-party'],
        userRights: ['your rights', 'user rights', 'access', 'delete', 'opt-out', 'opt out'],
        security: ['security', 'protect', 'safeguard'],
        cookies: ['cookie', 'tracking', 'analytics'],
        children: ['children', 'minors', 'under'],
        contact: ['contact', 'reach us', 'questions']
    };

    lines.forEach(line => {
        const lowerLine = line.toLowerCase();

        // Check for section headers
        for (const [section, keywords] of Object.entries(sectionKeywords)) {
            if (keywords.some(keyword => lowerLine.includes(keyword))) {
                currentSection = section;
                break;
            }
        }

        if (currentSection && line.trim()) {
            sections[currentSection].push(line.trim());
        }
    });

    return sections;
}

/**
 * Calculate compliance score
 * @param {string} policyText - Policy text
 * @param {array} requirements - Regulation requirements
 * @returns {number} - Compliance score (0-100)
 */
function calculateComplianceScore(policyText, requirements) {
    const lowerPolicy = policyText.toLowerCase();
    let matchCount = 0;

    requirements.forEach(requirement => {
        const keywords = requirement.toLowerCase().split(' ');
        const matches = keywords.filter(keyword => lowerPolicy.includes(keyword));

        // Requirement is considered met if at least half the keywords are found
        if (matches.length >= keywords.length / 2) {
            matchCount++;
        }
    });

    return Math.round((matchCount / requirements.length) * 100);
}

/**
 * Extract key privacy concerns
 * @param {string} policyText - Policy text
 * @returns {array} - List of concerns
 */
function extractPrivacyConcerns(policyText) {
    const concerns = [];
    const lowerPolicy = policyText.toLowerCase();

    const concernPatterns = [
        {
            pattern: /sell.*personal.*information|personal.*information.*sold/i,
            concern: 'May sell personal information'
        },
        {
            pattern: /share.*third.*party|third.*party.*share/i,
            concern: 'Shares data with third parties'
        },
        {
            pattern: /track.*across.*websites|cross.*site.*tracking/i,
            concern: 'Tracks across websites'
        },
        {
            pattern: /automatic.*renewal|auto.*renew/i,
            concern: 'Automatic renewal/subscription'
        },
        {
            pattern: /may.*change.*policy|reserve.*right.*modify/i,
            concern: 'Policy may change without notice'
        },
        {
            pattern: /indefinitely|unlimited.*time|permanent/i,
            concern: 'May retain data indefinitely'
        },
        {
            pattern: /government.*request|law.*enforcement/i,
            concern: 'May share with law enforcement'
        },
        {
            pattern: /marketing.*purposes|advertising/i,
            concern: 'Uses data for marketing'
        }
    ];

    concernPatterns.forEach(({ pattern, concern }) => {
        if (pattern.test(lowerPolicy)) {
            concerns.push(concern);
        }
    });

    return concerns;
}

/**
 * Grade policy readability
 * @param {string} policyText - Policy text
 * @returns {object} - Readability metrics
 */
function assessReadability(policyText) {
    const words = policyText.split(/\s+/).length;
    const sentences = policyText.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;

    // Very basic readability assessment
    let grade;
    if (avgWordsPerSentence < 15) {
        grade = 'Easy';
    } else if (avgWordsPerSentence < 20) {
        grade = 'Moderate';
    } else if (avgWordsPerSentence < 25) {
        grade = 'Difficult';
    } else {
        grade = 'Very Difficult';
    }

    return {
        wordCount: words,
        sentenceCount: sentences,
        avgWordsPerSentence: Math.round(avgWordsPerSentence),
        readabilityGrade: grade
    };
}

/**
 * Find missing required elements
 * @param {string} policyText - Policy text
 * @param {array} mandatoryElements - Required elements
 * @returns {array} - Missing elements
 */
function findMissingElements(policyText, mandatoryElements) {
    const lowerPolicy = policyText.toLowerCase();
    const missing = [];

    mandatoryElements.forEach(element => {
        const keywords = element.toLowerCase().split(' ');
        const found = keywords.some(keyword => lowerPolicy.includes(keyword));

        if (!found) {
            missing.push(element);
        }
    });

    return missing;
}

/**
 * Detect vague language
 * @param {string} policyText - Policy text
 * @returns {array} - Instances of vague language
 */
function detectVagueLanguage(policyText) {
    const vagueInstances = [];

    const vagueTerms = [
        'may', 'might', 'could', 'possibly', 'sometimes',
        'generally', 'usually', 'typically', 'often',
        'various', 'certain', 'some', 'many', 'etc'
    ];

    const sentences = policyText.split(/[.!?]+/);

    sentences.forEach((sentence, index) => {
        const lowerSentence = sentence.toLowerCase();
        const foundVagueTerms = vagueTerms.filter(term =>
            new RegExp(`\\b${term}\\b`, 'i').test(lowerSentence)
        );

        if (foundVagueTerms.length >= 2) {
            vagueInstances.push({
                sentence: sentence.trim().substring(0, 100) + '...',
                vagueTerms: foundVagueTerms
            });
        }
    });

    return vagueInstances;
}

export {
    extractPolicySections,
    calculateComplianceScore,
    extractPrivacyConcerns,
    assessReadability,
    findMissingElements,
    detectVagueLanguage
};
