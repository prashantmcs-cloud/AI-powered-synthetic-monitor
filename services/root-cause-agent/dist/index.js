import { DatabaseRepository } from '@ai-synthetic/database';
export function analyzeFailure(context) {
    const errorPatterns = [
        { pattern: /timeout|timed out/i, rootCause: 'Timeout', suggestedFix: 'Increase timeout or check server health', weight: 0.15 },
        { pattern: /selector.*not found|element not found/i, rootCause: 'Missing UI Element', suggestedFix: 'Update selector or check for UI changes', weight: 0.2 },
        { pattern: /network|connection refused|ECONNREFUSED/i, rootCause: 'Network Issue', suggestedFix: 'Check network configuration and endpoint availability', weight: 0.1 },
        { pattern: /authentication|401|403/i, rootCause: 'Authentication Failure', suggestedFix: 'Verify credentials and auth flow', weight: 0.12 },
        { pattern: /500|502|503|internal server error/i, rootCause: 'Server Error', suggestedFix: 'Check backend logs for server-side issues', weight: 0.18 }
    ];
    let rootCause = 'Unknown failure';
    let suggestedFix = 'Review test logs for details';
    let confidence = 0.6;
    if (context.error) {
        for (const { pattern, rootCause: rc, suggestedFix: fix, weight } of errorPatterns) {
            if (pattern.test(context.error)) {
                rootCause = rc;
                suggestedFix = fix;
                confidence = 0.75 + weight;
                break;
            }
        }
    }
    return {
        testRunId: context.testRunId,
        testId: context.testId,
        failureSummary: `Test ${context.testId} failed during execution`,
        rootCause,
        suggestedFix,
        confidence,
        relatedCommit: context.relatedCommit,
        evidenceRefs: context.artifacts
    };
}
export async function processFailedTest(context) {
    const insight = analyzeFailure(context);
    return await DatabaseRepository.saveRootCause(insight);
}
