import { z } from 'zod';
export declare const testRunSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    reportId: z.ZodOptional<z.ZodString>;
    testRunId: z.ZodOptional<z.ZodString>;
    testId: z.ZodString;
    specFile: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["queued", "running", "passed", "failed", "skipped"]>;
    startedAt: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodString>;
    durationMs: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodOptional<z.ZodString>;
    artifacts: z.ZodDefault<z.ZodObject<{
        screenshots: z.ZodArray<z.ZodString, "many">;
        video: z.ZodOptional<z.ZodString>;
        trace: z.ZodOptional<z.ZodString>;
        har: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        screenshots: string[];
        video?: string | undefined;
        trace?: string | undefined;
        har?: string | undefined;
    }, {
        screenshots: string[];
        video?: string | undefined;
        trace?: string | undefined;
        har?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    status: "failed" | "queued" | "running" | "passed" | "skipped";
    testId: string;
    artifacts: {
        screenshots: string[];
        video?: string | undefined;
        trace?: string | undefined;
        har?: string | undefined;
    };
    id?: string | undefined;
    createdAt?: string | undefined;
    reportId?: string | undefined;
    specFile?: string | undefined;
    startedAt?: string | undefined;
    completedAt?: string | undefined;
    durationMs?: number | undefined;
    testRunId?: string | undefined;
}, {
    status: "failed" | "queued" | "running" | "passed" | "skipped";
    testId: string;
    id?: string | undefined;
    createdAt?: string | undefined;
    reportId?: string | undefined;
    specFile?: string | undefined;
    startedAt?: string | undefined;
    completedAt?: string | undefined;
    durationMs?: number | undefined;
    testRunId?: string | undefined;
    artifacts?: {
        screenshots: string[];
        video?: string | undefined;
        trace?: string | undefined;
        har?: string | undefined;
    } | undefined;
}>;
export type TestRun = z.infer<typeof testRunSchema>;
export declare const rootCauseInsightSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    testRunId: z.ZodString;
    testId: z.ZodOptional<z.ZodString>;
    failureSummary: z.ZodString;
    rootCause: z.ZodString;
    suggestedFix: z.ZodString;
    confidence: z.ZodNumber;
    relatedCommit: z.ZodOptional<z.ZodString>;
    evidenceRefs: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    testRunId: string;
    failureSummary: string;
    rootCause: string;
    suggestedFix: string;
    confidence: number;
    evidenceRefs: string[];
    id?: string | undefined;
    testId?: string | undefined;
    relatedCommit?: string | undefined;
}, {
    testRunId: string;
    failureSummary: string;
    rootCause: string;
    suggestedFix: string;
    confidence: number;
    evidenceRefs: string[];
    id?: string | undefined;
    testId?: string | undefined;
    relatedCommit?: string | undefined;
}>;
export type RootCauseInsight = z.infer<typeof rootCauseInsightSchema>;
