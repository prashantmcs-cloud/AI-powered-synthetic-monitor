import { type RootCauseInsight } from '@ai-synthetic/shared-types';
export interface FailureContext {
    testId: string;
    artifacts: string[];
    relatedCommit?: string;
}
export declare function analyzeFailure(context: FailureContext): RootCauseInsight;
