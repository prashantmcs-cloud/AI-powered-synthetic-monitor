import { type RootCauseInsight } from '@ai-synthetic/shared-types';
export interface FailureContext {
    testRunId: string;
    testId: string;
    artifacts: string[];
    relatedCommit?: string;
    error?: string;
    logs?: string;
}
export declare function analyzeFailure(context: FailureContext): Omit<RootCauseInsight, 'id' | 'createdAt'>;
export declare function processFailedTest(context: FailureContext): Promise<RootCauseInsight>;
