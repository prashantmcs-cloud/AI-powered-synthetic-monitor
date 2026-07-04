import { type TestRun } from '@ai-synthetic/shared-types';
export interface ExecutionInput {
    reportId: string;
    specFiles: string[];
    riskScore: number;
}
export declare function executeSpecFiles(input: ExecutionInput): TestRun[];
export declare function createFailureInsight(testRun: TestRun): {
    testId: string;
    failureSummary: string;
    rootCause: string;
    suggestedFix: string;
    confidence: number;
    evidenceRefs: string[];
    relatedCommit?: string | undefined;
};
export declare function emitExecutionEvent(input: ExecutionInput): {
    eventType: string;
    occurredAt: string;
    correlationId: string;
    orgId: string;
    projectId: string;
    eventId?: string | undefined;
    payload?: unknown;
};
