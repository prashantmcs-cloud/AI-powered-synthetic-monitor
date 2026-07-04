import { z } from 'zod';
export declare const commitSchema: z.ZodObject<{
    id: z.ZodString;
    repository: z.ZodString;
    branch: z.ZodString;
    commitSha: z.ZodString;
    previousCommitSha: z.ZodOptional<z.ZodString>;
    author: z.ZodString;
    message: z.ZodString;
    timestamp: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    repository: string;
    branch: string;
    commitSha: string;
    author: string;
    message: string;
    timestamp: string;
    createdAt: string;
    previousCommitSha?: string | undefined;
}, {
    id: string;
    repository: string;
    branch: string;
    commitSha: string;
    author: string;
    message: string;
    timestamp: string;
    createdAt: string;
    previousCommitSha?: string | undefined;
}>;
export type Commit = z.infer<typeof commitSchema>;
export declare const buildSchema: z.ZodObject<{
    id: z.ZodString;
    commitId: z.ZodString;
    buildId: z.ZodString;
    previousBuildId: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["success", "failed", "pending"]>;
    bundleSize: z.ZodNumber;
    dependencyDelta: z.ZodArray<z.ZodString, "many">;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    status: "success" | "failed" | "pending";
    commitId: string;
    buildId: string;
    bundleSize: number;
    dependencyDelta: string[];
    previousBuildId?: string | undefined;
}, {
    id: string;
    createdAt: string;
    status: "success" | "failed" | "pending";
    commitId: string;
    buildId: string;
    bundleSize: number;
    dependencyDelta: string[];
    previousBuildId?: string | undefined;
}>;
export type Build = z.infer<typeof buildSchema>;
export declare const deploymentReportSchema: z.ZodObject<{
    id: z.ZodString;
    commitSha: z.ZodString;
    previousCommitSha: z.ZodOptional<z.ZodString>;
    buildId: z.ZodString;
    previousBuildId: z.ZodOptional<z.ZodString>;
    riskScore: z.ZodNumber;
    affectedFlows: z.ZodArray<z.ZodString, "many">;
    rationale: z.ZodString;
    generatedSpecFiles: z.ZodArray<z.ZodString, "many">;
    correlationId: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    commitSha: string;
    createdAt: string;
    buildId: string;
    riskScore: number;
    affectedFlows: string[];
    rationale: string;
    generatedSpecFiles: string[];
    correlationId: string;
    previousCommitSha?: string | undefined;
    previousBuildId?: string | undefined;
}, {
    id: string;
    commitSha: string;
    createdAt: string;
    buildId: string;
    riskScore: number;
    affectedFlows: string[];
    rationale: string;
    generatedSpecFiles: string[];
    correlationId: string;
    previousCommitSha?: string | undefined;
    previousBuildId?: string | undefined;
}>;
export type DeploymentReport = z.infer<typeof deploymentReportSchema>;
export declare const testRunSchema: z.ZodObject<{
    id: z.ZodString;
    reportId: z.ZodString;
    testId: z.ZodString;
    specFile: z.ZodString;
    status: z.ZodEnum<["queued", "running", "passed", "failed", "skipped"]>;
    startedAt: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodString>;
    durationMs: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "failed" | "queued" | "running" | "passed" | "skipped";
    reportId: string;
    testId: string;
    specFile: string;
    startedAt?: string | undefined;
    completedAt?: string | undefined;
    durationMs?: number | undefined;
}, {
    id: string;
    status: "failed" | "queued" | "running" | "passed" | "skipped";
    reportId: string;
    testId: string;
    specFile: string;
    startedAt?: string | undefined;
    completedAt?: string | undefined;
    durationMs?: number | undefined;
}>;
export type TestRun = z.infer<typeof testRunSchema>;
export declare const testArtifactSchema: z.ZodObject<{
    id: z.ZodString;
    testRunId: z.ZodString;
    type: z.ZodEnum<["screenshot", "video", "trace", "har"]>;
    url: z.ZodString;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    timestamp: string;
    type: "screenshot" | "video" | "trace" | "har";
    testRunId: string;
    url: string;
}, {
    id: string;
    timestamp: string;
    type: "screenshot" | "video" | "trace" | "har";
    testRunId: string;
    url: string;
}>;
export type TestArtifact = z.infer<typeof testArtifactSchema>;
export declare const rootCauseInsightSchema: z.ZodObject<{
    id: z.ZodString;
    testRunId: z.ZodString;
    failureSummary: z.ZodString;
    rootCause: z.ZodString;
    suggestedFix: z.ZodString;
    confidence: z.ZodNumber;
    relatedCommit: z.ZodOptional<z.ZodString>;
    evidenceRefs: z.ZodArray<z.ZodString, "many">;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    testRunId: string;
    failureSummary: string;
    rootCause: string;
    suggestedFix: string;
    confidence: number;
    evidenceRefs: string[];
    relatedCommit?: string | undefined;
}, {
    id: string;
    createdAt: string;
    testRunId: string;
    failureSummary: string;
    rootCause: string;
    suggestedFix: string;
    confidence: number;
    evidenceRefs: string[];
    relatedCommit?: string | undefined;
}>;
export type RootCauseInsight = z.infer<typeof rootCauseInsightSchema>;
export declare const monitoringConfigSchema: z.ZodObject<{
    id: z.ZodString;
    repository: z.ZodString;
    branch: z.ZodString;
    targetUrl: z.ZodString;
    testFlows: z.ZodArray<z.ZodString, "many">;
    schedule: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    repository: string;
    branch: string;
    createdAt: string;
    targetUrl: string;
    testFlows: string[];
    schedule?: string | undefined;
}, {
    id: string;
    repository: string;
    branch: string;
    createdAt: string;
    targetUrl: string;
    testFlows: string[];
    schedule?: string | undefined;
}>;
export type MonitoringConfig = z.infer<typeof monitoringConfigSchema>;
