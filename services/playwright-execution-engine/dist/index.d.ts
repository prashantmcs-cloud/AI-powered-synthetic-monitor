import { type TestRun } from '@ai-synthetic/shared-types';
import { executeSpecFiles, analyzeFailure } from './runner.js';
export { executeSpecFiles, analyzeFailure };
export type { ExecutionInput } from './runner.js';
export declare function createFailureInsight(testRun: TestRun): {
    testId: string;
    failureSummary: string;
    rootCause: string;
    suggestedFix: string;
    confidence: number;
    evidenceRefs: string[];
    id?: string | undefined;
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
