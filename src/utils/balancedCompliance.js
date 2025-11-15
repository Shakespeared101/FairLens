// Balanced Compliance Checker
// More credible scoring that distinguishes between violations, concerns, and missing info

/**
 * Analyze policy compliance with balanced, nuanced scoring
 * @param {string} policyText - The privacy policy text
 * @param {array} requirements - Array of requirement strings
 * @param {string} regulation - Which regulation (gdpr, ccpa, etc)
 * @returns {object} - Compliance analysis results
 */
function analyzeComplianceBalanced(policyText, requirements, regulation) {
    const lowerPolicy = policyText.toLowerCase();
    const findings = [];
    const recommendations = [];
    const positiveFindings = [];

    let criticalViolations = 0;
    let moderateIssues = 0;
    let minorIssues = 0;
    let compliantCount = 0;
    let partialCount = 0;

    // Step 1: Detect CRITICAL violations only (actual law-breaking)
    const criticalFlags = detectCriticalViolations(lowerPolicy, regulation);
    criticalFlags.forEach(flag => {
        findings.push(`🚨 CRITICAL VIOLATION: ${flag.issue}`);
        recommendations.push(flag.recommendation);
        criticalViolations++;
    });

    // Step 2: Detect MODERATE concerns (problematic but not necessarily illegal)
    const moderateFlags = detectModerateConcerns(lowerPolicy, regulation);
    moderateFlags.forEach(flag => {
        findings.push(`⚠️ CONCERN: ${flag.issue}`);
        recommendations.push(flag.recommendation);
        moderateIssues++;
    });

    // Step 3: Check each requirement with nuanced validation
    requirements.forEach(requirement => {
        const result = checkRequirementBalanced(requirement, lowerPolicy);

        if (result.status === 'fully_compliant') {
            compliantCount++;
            positiveFindings.push(requirement);
        } else if (result.status === 'partially_compliant') {
            partialCount++;
            findings.push(`⚡ PARTIAL: ${requirement} - ${result.reason}`);
            recommendations.push(result.recommendation);
        } else if (result.status === 'contradicted') {
            findings.push(`❌ CONTRADICTED: ${requirement} - ${result.reason}`);
            recommendations.push(result.recommendation);
            moderateIssues++;
        } else {
            // Not found - but only count as minor issue if it's important
            findings.push(`◯ NOT ADDRESSED: ${requirement}`);
            recommendations.push(`Consider adding: ${requirement}`);
            minorIssues++;
        }
    });

    // Step 4: Calculate balanced score
    const score = calculateBalancedScore(
        compliantCount,
        partialCount,
        requirements.length,
        criticalViolations,
        moderateIssues,
        minorIssues
    );

    // Add summary at top
    const summary = generateComplianceSummary(
        compliantCount,
        partialCount,
        requirements.length,
        criticalViolations,
        moderateIssues
    );

    return {
        score,
        summary,
        findings,
        recommendations,
        positiveFindings,
        breakdown: {
            fullyCompliant: compliantCount,
            partiallyCompliant: partialCount,
            total: requirements.length,
            critical: criticalViolations,
            moderate: moderateIssues,
            minor: minorIssues
        }
    };
}

/**
 * Detect CRITICAL violations (actual law-breaking)
 */
function detectCriticalViolations(policyText, regulation) {
    const violations = [];

    const criticalChecks = {
        // Universal critical violations
        forcedRightsWaiver: {
            pattern: /you (waive|relinquish|give up|forfeit).*rights?|waive.*claim|no right to sue/i,
            issue: 'Forces users to waive legal rights',
            recommendation: 'Remove clauses forcing users to waive their legal rights'
        },
        refuseDataDeletion: {
            pattern: /will not delete|cannot delete|refuse.*delete|may not.*honor.*deletion/i,
            issue: 'Explicitly refuses data deletion requests',
            recommendation: 'Must provide data deletion capability (required by GDPR/CCPA)'
        },
        ignoreUserRights: {
            pattern: /may ignore.*request|will ignore|discretion.*deny.*request|refuse.*requests? at/i,
            issue: 'Reserves right to arbitrarily ignore user rights requests',
            recommendation: 'Cannot arbitrarily deny legitimate rights requests'
        }
    };

    // CCPA-specific critical violations
    if (regulation === 'ccpa') {
        criticalChecks.noOptOutSale = {
            pattern: /sell.*information.*(without.*opt|mandatory|required|must accept)/i,
            issue: 'Requires selling data without opt-out option',
            recommendation: 'CCPA requires "Do Not Sell" opt-out mechanism'
        };
    }

    // GDPR-specific critical violations
    if (regulation === 'gdpr') {
        criticalChecks.noLegalBasis = {
            pattern: /no legal basis|without.*legal.*basis|regardless.*law/i,
            issue: 'Processes data without legal basis',
            recommendation: 'GDPR requires lawful basis for all data processing'
        };
    }

    // Check each critical violation
    for (const [key, check] of Object.entries(criticalChecks)) {
        if (check.pattern.test(policyText)) {
            violations.push({
                issue: check.issue,
                recommendation: check.recommendation,
                severity: 'critical'
            });
        }
    }

    return violations;
}

/**
 * Detect MODERATE concerns (problematic practices)
 */
function detectModerateConcerns(policyText, regulation) {
    const concerns = [];

    const moderateChecks = {
        indefiniteRetention: {
            pattern: /retain.*(indefinitely|forever|permanently)|keep.*data.*(indefinitely|unlimited)/i,
            issue: 'Retains data indefinitely without justification',
            recommendation: 'Specify reasonable data retention periods'
        },
        vaguePurposes: {
            pattern: /any purpose|whatever purpose|purposes? we (choose|determine|deem)/i,
            issue: 'Data use purposes are overly vague',
            recommendation: 'Specify clear, limited purposes for data use'
        },
        unlimitedSharing: {
            pattern: /share with (anyone|any (company|entity|party))|unlimited.*shar/i,
            issue: 'Shares data with unlimited third parties',
            recommendation: 'Limit and specify third-party data sharing'
        },
        noSecurityCommitment: {
            pattern: /no guarantee.*(security|safe)|cannot guarantee.*secur/i,
            issue: 'Disclaims all responsibility for security',
            recommendation: 'Commit to reasonable security measures'
        },
        trackDespiteOptOut: {
            pattern: /(track|collect|monitor).*(anyway|regardless|despite.*opt)/i,
            issue: 'May ignore user privacy preferences',
            recommendation: 'Respect user opt-out choices'
        }
    };

    for (const [key, check] of Object.entries(moderateChecks)) {
        if (check.pattern.test(policyText)) {
            concerns.push({
                issue: check.issue,
                recommendation: check.recommendation,
                severity: 'moderate'
            });
        }
    }

    return concerns;
}

/**
 * Check individual requirement with balanced, nuanced validation
 */
function checkRequirementBalanced(requirement, policyText) {
    const reqLower = requirement.toLowerCase();

    // Extract key terms from requirement
    const keyTerms = extractKeyTerms(reqLower);

    // Check if ANY key terms are present
    const termsFound = keyTerms.filter(term => policyText.includes(term));

    if (termsFound.length === 0) {
        return { status: 'not_found' };
    }

    // Terms found - now check context
    const hasPositiveContext = checkPositiveContext(termsFound, policyText, requirement);
    const hasNegativeContext = checkNegativeContext(termsFound, policyText);

    if (hasNegativeContext) {
        return {
            status: 'contradicted',
            reason: 'Mentioned but contradicted by negative language',
            recommendation: `Provide clear, affirmative statement about ${requirement}`
        };
    }

    if (hasPositiveContext) {
        return { status: 'fully_compliant' };
    }

    // Terms mentioned but not clearly addressed
    if (termsFound.length >= keyTerms.length * 0.5) {
        return {
            status: 'partially_compliant',
            reason: 'Mentioned but not fully addressed',
            recommendation: `Provide more detail about ${requirement}`
        };
    }

    return { status: 'not_found' };
}

/**
 * Extract key terms from a requirement string
 */
function extractKeyTerms(requirement) {
    // Remove common words
    const stopWords = ['the', 'of', 'to', 'and', 'or', 'for', 'in', 'on', 'at', 'by', 'with'];

    const words = requirement
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.includes(w));

    return words;
}

/**
 * Check for positive context around terms
 */
function checkPositiveContext(terms, policyText, requirement) {
    const positiveIndicators = [
        /you (have|can|may).*right/i,
        /users? (can|may|have.*right)/i,
        /we (will|shall|must|provide|offer|allow)/i,
        /available/i,
        /entitled to/i,
        /you are able to/i
    ];

    for (const term of terms) {
        const termIndex = policyText.indexOf(term);
        if (termIndex === -1) continue;

        // Get context (200 chars before and after)
        const start = Math.max(0, termIndex - 200);
        const end = Math.min(policyText.length, termIndex + 200);
        const context = policyText.substring(start, end);

        // Check for positive indicators
        for (const indicator of positiveIndicators) {
            if (indicator.test(context)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Check for negative context (only strong negations)
 */
function checkNegativeContext(terms, policyText) {
    // Only check for STRONG negations
    const strongNegations = [
        /will not|cannot|may not.*honor|refuse to|deny/i,
        /(ignore|disregard).*request/i,
        /at our (sole )?discretion.*deny/i
    ];

    for (const term of terms) {
        const termIndex = policyText.indexOf(term);
        if (termIndex === -1) continue;

        const start = Math.max(0, termIndex - 100);
        const end = Math.min(policyText.length, termIndex + 100);
        const context = policyText.substring(start, end);

        for (const negation of strongNegations) {
            if (negation.test(context)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Calculate balanced score
 */
function calculateBalancedScore(fullyCompliant, partiallyCompliant, total, critical, moderate, minor) {
    // Base score: percentage of requirements addressed
    const baseScore = ((fullyCompliant + partiallyCompliant * 0.5) / total) * 100;

    // Penalties (more balanced)
    const criticalPenalty = critical * 20;   // Critical = -20% each (severe)
    const moderatePenalty = moderate * 5;    // Moderate = -5% each
    const minorPenalty = minor * 1;          // Minor = -1% each (lenient)

    // Calculate final
    let finalScore = baseScore - criticalPenalty - moderatePenalty - minorPenalty;

    // Ensure 0-100 range
    return Math.max(0, Math.min(100, Math.round(finalScore)));
}

/**
 * Generate human-readable summary
 */
function generateComplianceSummary(compliant, partial, total, critical, moderate) {
    const addressed = compliant + partial;

    let summary = `Found ${compliant} fully compliant, ${partial} partially compliant out of ${total} requirements. `;

    if (critical > 0) {
        summary += `⚠️ ${critical} critical violation${critical > 1 ? 's' : ''} detected. `;
    }
    if (moderate > 0) {
        summary += `${moderate} moderate concern${moderate > 1 ? 's' : ''} found.`;
    }
    if (critical === 0 && moderate === 0 && addressed >= total * 0.7) {
        summary += '✅ Generally compliant.';
    }

    return summary;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        analyzeComplianceBalanced,
        detectCriticalViolations,
        detectModerateConcerns,
        checkRequirementBalanced
    };
}
