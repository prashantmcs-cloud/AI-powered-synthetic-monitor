import { z } from 'zod';
export const baseEnvelopeSchema = z.object({
    eventId: z.string().uuid().optional(),
    eventType: z.string(),
    occurredAt: z.string().datetime(),
    correlationId: z.string(),
    orgId: z.string(),
    projectId: z.string(),
    payload: z.unknown().optional()
});
export const riskAssessmentSchema = z.object({
    riskScore: z.number().min(0).max(1),
    affectedFlows: z.array(z.string()),
    rationale: z.string()
});
export const deploymentIntelligenceReportSchema = z.object({
    id: z.string().optional(),
    commitSha: z.string(),
    previousCommitSha: z.string(),
    buildId: z.string(),
    previousBuildId: z.string(),
    riskAssessment: riskAssessmentSchema,
    generatedSpecFiles: z.array(z.string()),
    correlationId: z.string(),
    createdAt: z.string().datetime().optional()
});
export const testRunSchema = z.object({
    id: z.string(),
    testId: z.string(),
    status: z.enum(['queued', 'running', 'passed', 'failed']),
    artifacts: z.object({
        screenshots: z.array(z.string()),
        video: z.string().optional(),
        trace: z.string().optional(),
        har: z.string().optional()
    }).default({ screenshots: [] }),
    createdAt: z.string().datetime().optional()
});
export const rootCauseInsightSchema = z.object({
    testId: z.string(),
    failureSummary: z.string(),
    rootCause: z.string(),
    suggestedFix: z.string(),
    confidence: z.number().min(0).max(1),
    relatedCommit: z.string().optional(),
    evidenceRefs: z.array(z.string())
});
export function createBaseEnvelope(input) {
    return baseEnvelopeSchema.parse({
        eventId: crypto.randomUUID(),
        eventType: input.eventType,
        occurredAt: new Date().toISOString(),
        correlationId: crypto.randomUUID(),
        orgId: input.orgId,
        projectId: input.projectId,
        payload: input.payload
    });
}
export function createRiskAssessment(input) {
    return riskAssessmentSchema.parse(input);
}
export function createDeploymentIntelligenceReport(input) {
    return deploymentIntelligenceReportSchema.parse({
        ...input,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
    });
}
export function createRootCauseInsight(input) {
    return rootCauseInsightSchema.parse(input);
}
