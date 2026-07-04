import { z } from 'zod';
export declare const baseEnvelopeSchema: z.ZodObject<{
    eventId: z.ZodOptional<z.ZodString>;
    eventType: z.ZodString;
    occurredAt: z.ZodString;
    correlationId: z.ZodString;
    orgId: z.ZodString;
    projectId: z.ZodString;
    payload: z.ZodOptional<z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    eventType: string;
    occurredAt: string;
    correlationId: string;
    orgId: string;
    projectId: string;
    eventId?: string | undefined;
    payload?: unknown;
}, {
    eventType: string;
    occurredAt: string;
    correlationId: string;
    orgId: string;
    projectId: string;
    eventId?: string | undefined;
    payload?: unknown;
}>;
export type BaseEnvelope = z.infer<typeof baseEnvelopeSchema>;
export declare const riskAssessmentSchema: z.ZodObject<{
    riskScore: z.ZodNumber;
    affectedFlows: z.ZodArray<z.ZodString, "many">;
    rationale: z.ZodString;
}, "strip", z.ZodTypeAny, {
    riskScore: number;
    affectedFlows: string[];
    rationale: string;
}, {
    riskScore: number;
    affectedFlows: string[];
    rationale: string;
}>;
export type RiskAssessment = z.infer<typeof riskAssessmentSchema>;
export declare const deploymentIntelligenceReportSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    commitSha: z.ZodString;
    previousCommitSha: z.ZodString;
    buildId: z.ZodString;
    previousBuildId: z.ZodString;
    riskAssessment: z.ZodObject<{
        riskScore: z.ZodNumber;
        affectedFlows: z.ZodArray<z.ZodString, "many">;
        rationale: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        riskScore: number;
        affectedFlows: string[];
        rationale: string;
    }, {
        riskScore: number;
        affectedFlows: string[];
        rationale: string;
    }>;
    generatedSpecFiles: z.ZodArray<z.ZodString, "many">;
    correlationId: z.ZodString;
    createdAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    commitSha: string;
    previousCommitSha: string;
    buildId: string;
    previousBuildId: string;
    riskAssessment: {
        riskScore: number;
        affectedFlows: string[];
        rationale: string;
    };
    generatedSpecFiles: string[];
    id?: string | undefined;
    createdAt?: string | undefined;
}, {
    correlationId: string;
    commitSha: string;
    previousCommitSha: string;
    buildId: string;
    previousBuildId: string;
    riskAssessment: {
        riskScore: number;
        affectedFlows: string[];
        rationale: string;
    };
    generatedSpecFiles: string[];
    id?: string | undefined;
    createdAt?: string | undefined;
}>;
export type DeploymentIntelligenceReport = z.infer<typeof deploymentIntelligenceReportSchema>;
export declare const testRunSchema: z.ZodObject<{
    id: z.ZodString;
    testId: z.ZodString;
    status: z.ZodEnum<["queued", "running", "passed", "failed"]>;
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
    createdAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "queued" | "running" | "passed" | "failed";
    id: string;
    testId: string;
    artifacts: {
        screenshots: string[];
        video?: string | undefined;
        trace?: string | undefined;
        har?: string | undefined;
    };
    createdAt?: string | undefined;
}, {
    status: "queued" | "running" | "passed" | "failed";
    id: string;
    testId: string;
    createdAt?: string | undefined;
    artifacts?: {
        screenshots: string[];
        video?: string | undefined;
        trace?: string | undefined;
        har?: string | undefined;
    } | undefined;
}>;
export type TestRun = z.infer<typeof testRunSchema>;
export declare const rootCauseInsightSchema: z.ZodObject<{
    testId: z.ZodString;
    failureSummary: z.ZodString;
    rootCause: z.ZodString;
    suggestedFix: z.ZodString;
    confidence: z.ZodNumber;
    relatedCommit: z.ZodOptional<z.ZodString>;
    evidenceRefs: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    testId: string;
    failureSummary: string;
    rootCause: string;
    suggestedFix: string;
    confidence: number;
    evidenceRefs: string[];
    relatedCommit?: string | undefined;
}, {
    testId: string;
    failureSummary: string;
    rootCause: string;
    suggestedFix: string;
    confidence: number;
    evidenceRefs: string[];
    relatedCommit?: string | undefined;
}>;
export type RootCauseInsight = z.infer<typeof rootCauseInsightSchema>;
export declare function createBaseEnvelope(input: {
    eventType: string;
    orgId: string;
    projectId: string;
    payload?: unknown;
}): {
    eventType: string;
    occurredAt: string;
    correlationId: string;
    orgId: string;
    projectId: string;
    eventId?: string | undefined;
    payload?: unknown;
};
export declare function createRiskAssessment(input: RiskAssessment): RiskAssessment;
export declare function createDeploymentIntelligenceReport(input: Omit<DeploymentIntelligenceReport, 'id' | 'createdAt'>): DeploymentIntelligenceReport;
export declare function createRootCauseInsight(input: RootCauseInsight): RootCauseInsight;
