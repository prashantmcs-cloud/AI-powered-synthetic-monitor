import type { Commit, Build, DeploymentReport, TestRun, TestArtifact, RootCauseInsight } from '@ai-synthetic/shared-types';
export declare class DatabaseRepository {
    static saveCommit(commit: Omit<Commit, 'id' | 'createdAt'>): Promise<Commit>;
    static getCommit(commitSha: string): Promise<Commit | null>;
    static saveBuild(build: Omit<Build, 'id' | 'createdAt'>): Promise<Build>;
    static saveDeploymentReport(report: Omit<DeploymentReport, 'id' | 'createdAt'>): Promise<DeploymentReport>;
    static saveTestRun(run: Omit<TestRun, 'id' | 'startedAt' | 'completedAt'>): Promise<TestRun>;
    static updateTestRunStatus(testRunId: string, status: 'queued' | 'running' | 'passed' | 'failed' | 'skipped', durationMs?: number): Promise<void>;
    static saveArtifact(artifact: Omit<TestArtifact, 'id' | 'timestamp'>): Promise<TestArtifact>;
    static saveRootCause(insight: Omit<RootCauseInsight, 'id' | 'createdAt'>): Promise<RootCauseInsight>;
    static getReports(limit?: number): Promise<DeploymentReport[]>;
    static getTestRuns(reportId: string): Promise<TestRun[]>;
    static getArtifacts(testRunId: string): Promise<TestArtifact[]>;
    static getRootCause(testRunId: string): Promise<RootCauseInsight | null>;
}
