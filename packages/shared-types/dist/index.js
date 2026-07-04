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
    id: z.string().uuid().optional(),
    commitSha: z.string(),
    previousCommitSha: z.string().optional(),
    buildId: z.string(),
    previousBuildId: z.string().optional(),
    riskAssessment: riskAssessmentSchema,
    generatedSpecFiles: z.array(z.string()),
    correlationId: z.string(),
    createdAt: z.string().datetime().optional()
});
export const testRunSchema = z.object({
    id: z.string().uuid().optional(),
    testId: z.string(),
    status: z.enum(['queued', 'running', 'passed', 'failed']),
    artifacts: z.object({
        screenshots: z.array(z.string()),
        video: z.string().optional(),
        trace: z.string().optional(),
        har: z.string().optional()
    }).default({ screenshots: [] }),
    createdAt: z.string().datetime().optional(),
    durationMs: z.number().optional()
});
export const rootCauseInsightSchema = z.object({
    id: z.string().uuid().optional(),
    testRunId: z.string().uuid(),
    testId: z.string().optional(),
    failureSummary: z.string(),
    rootCause: z.string(),
    suggestedFix: z.string(),
    confidence: z.number().min(0).max(1),
    relatedCommit: z.string().optional(),
    evidenceRefs: z.array(z.string())
});
export const aiTestSpecSchema = z.object({
    id: z.string().uuid().optional(),
    testId: z.string(),
    specFile: z.string(),
    title: z.string(),
    description: z.string(),
    steps: z.array(z.object({
        action: z.string(),
        selector: z.string().optional(),
        value: z.string().optional(),
        url: z.string().optional()
    })),
    createdAt: z.string().datetime().optional()
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
export function createAiTestSpec(input) {
    return aiTestSpecSchema.parse({
        ...input,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
    });
}
export const commitPushedSchema = baseEnvelopeSchema.extend({
    payload: z.object({
        repo: z.string(),
        branch: z.string(),
        commitSha: z.string(),
        previousCommitSha: z.string(),
        pusher: z.string(),
        isMasterBranch: z.boolean()
    })
});
export const testsGeneratedSchema = baseEnvelopeSchema.extend({
    payload: z.object({
        reportId: z.string(),
        specFiles: z.array(z.string()),
        riskScore: z.number().min(0).max(1),
        commitSha: z.string()
    })
});
export const testCompletedSchema = baseEnvelopeSchema.extend({
    payload: z.object({
        testRunId: z.string(),
        status: z.enum(['passed', 'failed', 'skipped']),
        durationMs: z.number().optional()
    })
});
export const testFailedSchema = baseEnvelopeSchema.extend({
    payload: z.object({
        testRunId: z.string(),
        testId: z.string(),
        status: z.literal('failed'),
        error: z.string().optional(),
        artifacts: z.object({
            screenshots: z.array(z.string()),
            video: z.string().optional(),
            trace: z.string().optional(),
            har: z.string().optional()
        }).optional()
    })
});
export const insightGeneratedSchema = baseEnvelopeSchema.extend({
    payload: z.object({
        testRunId: z.string(),
        failureSummary: z.string(),
        rootCause: z.string(),
        suggestedFix: z.string(),
        confidence: z.number().min(0).max(1),
        evidenceRefs: z.array(z.string()),
        relatedCommit: z.string().optional()
    })
});
export function createCommitPushed(input) {
    return commitPushedSchema.parse({
        ...createBaseEnvelope({
            eventType: 'commit.pushed',
            orgId: input.orgId ?? 'acme',
            projectId: input.projectId ?? 'platform',
            payload: {
                repo: input.repo,
                branch: input.branch,
                commitSha: input.commitSha,
                previousCommitSha: input.previousCommitSha,
                pusher: input.pusher,
                isMasterBranch: input.isMasterBranch
            }
        })
    });
}
export function createTestsGenerated(input) {
    return testsGeneratedSchema.parse({
        eventId: crypto.randomUUID(),
        eventType: 'tests.generated',
        occurredAt: new Date().toISOString(),
        correlationId: input.correlationId,
        orgId: input.orgId ?? 'acme',
        projectId: input.projectId ?? 'platform',
        payload: {
            reportId: input.reportId,
            specFiles: input.specFiles,
            riskScore: input.riskScore,
            commitSha: input.commitSha
        }
    });
}
export function createTestFailed(input) {
    return testFailedSchema.parse({
        eventId: crypto.randomUUID(),
        eventType: 'test.failed',
        occurredAt: new Date().toISOString(),
        correlationId: input.correlationId,
        orgId: input.orgId ?? 'acme',
        projectId: input.projectId ?? 'platform',
        payload: {
            testRunId: input.testRunId,
            testId: input.testId,
            status: 'failed',
            error: input.error,
            artifacts: input.artifacts
        }
    });
}
export function createInsightGenerated(input) {
    return insightGeneratedSchema.parse({
        eventId: crypto.randomUUID(),
        eventType: 'insight.generated',
        occurredAt: new Date().toISOString(),
        correlationId: input.correlationId,
        orgId: input.orgId ?? 'acme',
        projectId: input.projectId ?? 'platform',
        payload: {
            testRunId: input.testRunId,
            failureSummary: input.failureSummary,
            rootCause: input.rootCause,
            suggestedFix: input.suggestedFix,
            confidence: input.confidence,
            evidenceRefs: input.evidenceRefs,
            relatedCommit: input.relatedCommit
        }
    });
}
export * from './database.js';
