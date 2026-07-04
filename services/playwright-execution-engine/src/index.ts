import { createBaseEnvelope, createRootCauseInsight, type TestRun } from '@ai-synthetic/shared-types';
import { executeSpecFiles } from './runner.js';

export { executeSpecFiles, analyzeFailure } from './runner.js';
export type { ExecutionInput, FailureContext } from './runner.js';

export function createFailureInsight(testRun: TestRun) {
  return createRootCauseInsight({
    testId: testRun.testId,
    failureSummary: 'The generated synthetic check failed during execution.',
    rootCause: 'Unexpected UI state or environment issue.',
    suggestedFix: 'Review the impacted flow and update the generated spec.',
    confidence: 0.78,
    evidenceRefs: testRun.artifacts.screenshots
  });
}

export function emitExecutionEvent(input: { reportId: string; specFiles: string[]; riskScore: number }) {
  return createBaseEnvelope({
    eventType: 'tests.generated',
    orgId: 'acme',
    projectId: 'platform',
    payload: input
  });
}