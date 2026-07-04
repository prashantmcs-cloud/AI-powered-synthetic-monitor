import { z } from 'zod';
export const testRunSchema = z.object({
    id: z.string().uuid().optional(),
    reportId: z.string().uuid().optional(),
    testRunId: z.string().uuid().optional(),
    testId: z.string(),
    specFile: z.string().optional(),
    status: z.enum(['queued', 'running', 'passed', 'failed', 'skipped']),
    startedAt: z.string().datetime().optional(),
    completedAt: z.string().datetime().optional(),
    durationMs: z.number().optional(),
    createdAt: z.string().datetime().optional(),
    artifacts: z.object({
        screenshots: z.array(z.string()),
        video: z.string().optional(),
        trace: z.string().optional(),
        har: z.string().optional()
    }).default({ screenshots: [] })
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
