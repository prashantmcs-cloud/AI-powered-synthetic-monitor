export declare class DatabaseRepository {
    private pool;
    saveCommit(commit: {
        repository: string;
        branch: string;
        commitSha: string;
        previousCommitSha?: string;
        author: string;
        message: string;
        timestamp: string;
    }): Promise<{
        id: any;
        createdAt: any;
        repository: string;
        branch: string;
        commitSha: string;
        previousCommitSha?: string;
        author: string;
        message: string;
        timestamp: string;
    }>;
    saveBuild(build: {
        commitId: string;
        buildId: string;
        previousBuildId?: string;
        status: 'success' | 'failed' | 'pending';
        bundleSize: number;
        dependencyDelta: string[];
    }): Promise<{
        id: any;
        createdAt: any;
        commitId: string;
        buildId: string;
        previousBuildId?: string;
        status: "success" | "failed" | "pending";
        bundleSize: number;
        dependencyDelta: string[];
    }>;
    saveDeploymentReport(report: {
        commitSha: string;
        previousCommitSha?: string;
        buildId: string;
        previousBuildId?: string;
        riskScore: number;
        affectedFlows: string[];
        rationale: string;
        generatedSpecFiles: string[];
        correlationId: string;
    }): Promise<{
        id: any;
        createdAt: any;
        commitSha: string;
        previousCommitSha?: string;
        buildId: string;
        previousBuildId?: string;
        riskScore: number;
        affectedFlows: string[];
        rationale: string;
        generatedSpecFiles: string[];
        correlationId: string;
    }>;
    saveTestRun(run: {
        reportId: string;
        testId: string;
        specFile: string;
        status: 'queued' | 'running' | 'passed' | 'failed' | 'skipped';
        durationMs?: number;
    }): Promise<{
        id: any;
        startedAt: any;
        completedAt: undefined;
        reportId: string;
        testId: string;
        specFile: string;
        status: "queued" | "running" | "passed" | "failed" | "skipped";
        durationMs?: number;
    }>;
    updateTestRunStatus(testRunId: string, status: 'queued' | 'running' | 'passed' | 'failed' | 'skipped', durationMs?: number): Promise<void>;
    saveArtifact(artifact: {
        testRunId: string;
        type: 'screenshot' | 'video' | 'trace' | 'har';
        url: string;
    }): Promise<{
        id: any;
        timestamp: any;
        testRunId: string;
        type: "screenshot" | "video" | "trace" | "har";
        url: string;
    }>;
    saveRootCause(insight: {
        testRunId: string;
        failureSummary: string;
        rootCause: string;
        suggestedFix: string;
        confidence: number;
        evidenceRefs: string[];
        relatedCommit?: string;
    }): Promise<{
        id: any;
        createdAt: any;
        testRunId: string;
        failureSummary: string;
        rootCause: string;
        suggestedFix: string;
        confidence: number;
        evidenceRefs: string[];
        relatedCommit?: string;
    }>;
    getReports(limit?: number): Promise<any[]>;
    getTestRuns(reportId: string): Promise<any[]>;
    getArtifacts(testRunId: string): Promise<any[]>;
    getRootCause(testRunId: string): Promise<any | null>;
}
