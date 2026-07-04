import type { RootCauseInsight } from '@ai-synthetic/shared-types';
export interface FailureContext {
    testRunId: string;
    testId: string;
    artifacts: string[];
    relatedCommit?: string;
    error?: string;
}
export declare function analyzeFailure(context: FailureContext): Omit<RootCauseInsight, 'id'>;
export declare function startRootCauseAgent(): Promise<void>;
