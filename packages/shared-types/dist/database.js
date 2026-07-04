import { z } from 'zod';
export const commitSchema = z.object({
    id: z.string().uuid(),
    repository: z.string(),
    branch: z.string(),
    commitSha: z.string(),
    previousCommitSha: z.string().optional(),
    author: z.string(),
    message: z.string(),
    timestamp: z.string().datetime(),
    createdAt: z.string().datetime()
});
export const buildSchema = z.object({
    id: z.string().uuid(),
    commitId: z.string().uuid(),
    buildId: z.string(),
    previousBuildId: z.string().optional(),
    status: z.enum(['success', 'failed', 'pending']),
    bundleSize: z.number(),
    dependencyDelta: z.array(z.string()),
    createdAt: z.string().datetime()
});
export const deploymentReportSchema = z.object({
    id: z.string().uuid(),
    commitSha: z.string(),
    previousCommitSha: z.string().optional(),
    buildId: z.string(),
    previousBuildId: z.string().optional(),
    riskScore: z.number().min(0).max(1),
    affectedFlows: z.array(z.string()),
    rationale: z.string(),
    generatedSpecFiles: z.array(z.string()),
    correlationId: z.string(),
    createdAt: z.string().datetime()
});
export const testRunSchema = z.object({
    id: z.string().uuid(),
    reportId: z.string().uuid(),
    testId: z.string(),
    specFile: z.string(),
    status: z.enum(['queued', 'running', 'passed', 'failed', 'skipped']),
    startedAt: z.string().datetime().optional(),
    completedAt: z.string().datetime().optional(),
    durationMs: z.number().optional()
});
export const testArtifactSchema = z.object({
    id: z.string().uuid(),
    testRunId: z.string().uuid(),
    type: z.enum(['screenshot', 'video', 'trace', 'har']),
    url: z.string(),
    timestamp: z.string().datetime()
});
export const rootCauseInsightSchema = z.object({
    id: z.string().uuid(),
    testRunId: z.string().uuid(),
    failureSummary: z.string(),
    rootCause: z.string(),
    suggestedFix: z.string(),
    confidence: z.number().min(0).max(1),
    relatedCommit: z.string().optional(),
    evidenceRefs: z.array(z.string()),
    createdAt: z.string().datetime()
});
export const monitoringConfigSchema = z.object({
    id: z.string().uuid(),
    repository: z.string(),
    branch: z.string(),
    targetUrl: z.string().url(),
    testFlows: z.array(z.string()),
    schedule: z.string().optional(),
    createdAt: z.string().datetime()
});
