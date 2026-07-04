import type { TestRun } from '@ai-synthetic/shared-types';
export interface ExecutionInput {
    reportId: string;
    specFiles: string[];
    riskScore: number;
    targetUrl?: string;
}
export interface FailureContext {
    testRunId: string;
    testId: string;
    artifacts: string[];
    error?: string;
}
export declare function executeSpecFiles(input: ExecutionInput): Promise<TestRun[]>;
