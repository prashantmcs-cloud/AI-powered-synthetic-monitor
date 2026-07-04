import { createBaseEnvelope, createRootCauseInsight } from '@ai-synthetic/shared-types';
import { executeSpecFiles } from './runner.js';
export { executeSpecFiles };
export function createFailureInsight(testRun) {
    return createRootCauseInsight({
        testRunId: testRun.id ?? '',
        testId: testRun.testId,
        failureSummary: 'The generated synthetic check failed during execution.',
        rootCause: 'Unexpected UI state or environment issue.',
        suggestedFix: 'Review the impacted flow and update the generated spec.',
        confidence: 0.78,
        evidenceRefs: testRun.artifacts.screenshots
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
export * from './runner.js';
