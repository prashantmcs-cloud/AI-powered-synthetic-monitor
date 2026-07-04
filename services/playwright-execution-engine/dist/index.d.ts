import { type TestRun } from '@ai-synthetic/shared-types';
import { executeSpecFiles } from './runner.js';
export { executeSpecFiles };
export type { ExecutionInput, FailureContext } from './runner.js';
export declare function createFailureInsight(testRun: TestRun): {
    testRunId: string;
    failureSummary: string;
    rootCause: string;
    suggestedFix: string;
    confidence: number;
    evidenceRefs: string[];
    id?: string | undefined;
    testId?: string | undefined;
    relatedCommit?: string | undefined;
};
export declare function emitExecutionEvent(input: {
    reportId: string;
    specFiles: string[];
    riskScore: number;
}): {
    correlationId: string;
    eventType: string;
    occurredAt: string;
    orgId: string;
    projectId: string;
    eventId?: string | undefined;
    payload?: unknown;
};
export * from './runner.js';
