import { createBaseEnvelope, createRootCauseInsight } from '@ai-synthetic/shared-types';
import { executeSpecFiles, analyzeFailure } from './runner.js';
export { executeSpecFiles, analyzeFailure };
export function createFailureInsight(testRun) {
    return createRootCauseInsight({
        testId: testRun.testId,
        failureSummary: 'The generated synthetic check failed during execution.',
        rootCause: 'The Playwright flow likely hit an unexpected UI state or environment issue.',
        suggestedFix: 'Review the impacted flow and update the generated spec to match the latest UI contract.',
        confidence: 0.78,
        relatedCommit: 'latest',
        evidenceRefs: testRun.artifacts.screenshots.concat(testRun.artifacts.video ?? [])
    });
}
export function emitExecutionEvent(input) {
    return createBaseEnvelope({
        eventType: 'tests.generated',
        orgId: 'acme',
        projectId: 'platform',
        payload: input
    });
}
