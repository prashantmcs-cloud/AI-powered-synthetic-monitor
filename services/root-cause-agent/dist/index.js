import { createRootCauseInsight } from '@ai-synthetic/shared-types';
export function analyzeFailure(context) {
    return createRootCauseInsight({
        testId: context.testId,
        failureSummary: 'The Playwright flow failed during automation execution.',
        rootCause: 'A mismatch between the expected UI state and the live application state was detected.',
        suggestedFix: 'Update the generated spec and verify the impacted page components before re-running.',
        confidence: 0.84,
        relatedCommit: context.relatedCommit,
        evidenceRefs: context.artifacts
    });
}
