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
    correlationId: string;
    eventType: string;
    occurredAt: string;
    orgId: string;
    projectId: string;
    eventId?: string | undefined;
    payload?: unknown;
}, {
    correlationId: string;
    eventType: string;
    occurredAt: string;
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
    previousCommitSha: z.ZodOptional<z.ZodString>;
    buildId: z.ZodString;
    previousBuildId: z.ZodOptional<z.ZodString>;
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
    commitSha: string;
    buildId: string;
    generatedSpecFiles: string[];
    correlationId: string;
    riskAssessment: {
        riskScore: number;
        affectedFlows: string[];
        rationale: string;
    };
    id?: string | undefined;
    previousCommitSha?: string | undefined;
    createdAt?: string | undefined;
    previousBuildId?: string | undefined;
}, {
    commitSha: string;
    buildId: string;
    generatedSpecFiles: string[];
    correlationId: string;
    riskAssessment: {
        riskScore: number;
        affectedFlows: string[];
        rationale: string;
    };
    id?: string | undefined;
    previousCommitSha?: string | undefined;
    createdAt?: string | undefined;
    previousBuildId?: string | undefined;
}>;
export type DeploymentIntelligenceReport = z.infer<typeof deploymentIntelligenceReportSchema>;
export declare const testRunSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
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
    durationMs: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status: "failed" | "queued" | "running" | "passed";
    testId: string;
    artifacts: {
        screenshots: string[];
        video?: string | undefined;
        trace?: string | undefined;
        har?: string | undefined;
    };
    id?: string | undefined;
    createdAt?: string | undefined;
    durationMs?: number | undefined;
}, {
    status: "failed" | "queued" | "running" | "passed";
    testId: string;
    id?: string | undefined;
    createdAt?: string | undefined;
    durationMs?: number | undefined;
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
export declare const aiTestSpecSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    testId: z.ZodString;
    specFile: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    steps: z.ZodArray<z.ZodObject<{
        action: z.ZodString;
        selector: z.ZodOptional<z.ZodString>;
        value: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        action: string;
        value?: string | undefined;
        url?: string | undefined;
        selector?: string | undefined;
    }, {
        action: string;
        value?: string | undefined;
        url?: string | undefined;
        selector?: string | undefined;
    }>, "many">;
    createdAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    testId: string;
    specFile: string;
    title: string;
    description: string;
    steps: {
        action: string;
        value?: string | undefined;
        url?: string | undefined;
        selector?: string | undefined;
    }[];
    id?: string | undefined;
    createdAt?: string | undefined;
}, {
    testId: string;
    specFile: string;
    title: string;
    description: string;
    steps: {
        action: string;
        value?: string | undefined;
        url?: string | undefined;
        selector?: string | undefined;
    }[];
    id?: string | undefined;
    createdAt?: string | undefined;
}>;
export type AiTestSpec = z.infer<typeof aiTestSpecSchema>;
export declare function createBaseEnvelope(input: {
    eventType: string;
    orgId: string;
    projectId: string;
    payload?: unknown;
}): {
    correlationId: string;
    eventType: string;
    occurredAt: string;
    orgId: string;
    projectId: string;
    eventId?: string | undefined;
    payload?: unknown;
};
export declare function createRiskAssessment(input: RiskAssessment): RiskAssessment;
export declare function createDeploymentIntelligenceReport(input: Omit<DeploymentIntelligenceReport, 'id' | 'createdAt'>): DeploymentIntelligenceReport;
export declare function createRootCauseInsight(input: {
    testRunId: string;
    testId?: string;
    failureSummary: string;
    rootCause: string;
    suggestedFix: string;
    confidence: number;
    evidenceRefs: string[];
    relatedCommit?: string;
}): RootCauseInsight;
export declare function createAiTestSpec(input: {
    testId: string;
    specFile: string;
    title: string;
    description: string;
    steps: Array<{
        action: string;
        selector?: string;
        value?: string;
        url?: string;
    }>;
}): AiTestSpec;
export declare const commitPushedSchema: z.ZodObject<{
    eventId: z.ZodOptional<z.ZodString>;
    eventType: z.ZodString;
    occurredAt: z.ZodString;
    correlationId: z.ZodString;
    orgId: z.ZodString;
    projectId: z.ZodString;
} & {
    payload: z.ZodObject<{
        repo: z.ZodString;
        branch: z.ZodString;
        commitSha: z.ZodString;
        previousCommitSha: z.ZodString;
        pusher: z.ZodString;
        isMasterBranch: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        branch: string;
        commitSha: string;
        previousCommitSha: string;
        repo: string;
        pusher: string;
        isMasterBranch: boolean;
    }, {
        branch: string;
        commitSha: string;
        previousCommitSha: string;
        repo: string;
        pusher: string;
        isMasterBranch: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    eventType: string;
    occurredAt: string;
    orgId: string;
    projectId: string;
    payload: {
        branch: string;
        commitSha: string;
        previousCommitSha: string;
        repo: string;
        pusher: string;
        isMasterBranch: boolean;
    };
    eventId?: string | undefined;
}, {
    correlationId: string;
    eventType: string;
    occurredAt: string;
    orgId: string;
    projectId: string;
    payload: {
        branch: string;
        commitSha: string;
        previousCommitSha: string;
        repo: string;
        pusher: string;
        isMasterBranch: boolean;
    };
    eventId?: string | undefined;
}>;
export declare const testsGeneratedSchema: z.ZodObject<{
    eventId: z.ZodOptional<z.ZodString>;
    eventType: z.ZodString;
    occurredAt: z.ZodString;
    correlationId: z.ZodString;
    orgId: z.ZodString;
    projectId: z.ZodString;
} & {
    payload: z.ZodObject<{
        reportId: z.ZodString;
        specFiles: z.ZodArray<z.ZodString, "many">;
        riskScore: z.ZodNumber;
        commitSha: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        commitSha: string;
        riskScore: number;
        reportId: string;
        specFiles: string[];
    }, {
        commitSha: string;
        riskScore: number;
        reportId: string;
        specFiles: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    eventType: string;
    occurredAt: string;
    orgId: string;
    projectId: string;
    payload: {
        commitSha: string;
        riskScore: number;
        reportId: string;
        specFiles: string[];
    };
    eventId?: string | undefined;
}, {
    correlationId: string;
    eventType: string;
    occurredAt: string;
    orgId: string;
    projectId: string;
    payload: {
        commitSha: string;
        riskScore: number;
        reportId: string;
        specFiles: string[];
    };
    eventId?: string | undefined;
}>;
export declare const testCompletedSchema: z.ZodObject<{
    eventId: z.ZodOptional<z.ZodString>;
    eventType: z.ZodString;
    occurredAt: z.ZodString;
    correlationId: z.ZodString;
    orgId: z.ZodString;
    projectId: z.ZodString;
} & {
    payload: z.ZodObject<{
        testRunId: z.ZodString;
        status: z.ZodEnum<["passed", "failed", "skipped"]>;
        durationMs: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        status: "failed" | "passed" | "skipped";
        testRunId: string;
        durationMs?: number | undefined;
    }, {
        status: "failed" | "passed" | "skipped";
        testRunId: string;
        durationMs?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    eventType: string;
    occurredAt: string;
    orgId: string;
    projectId: string;
    payload: {
        status: "failed" | "passed" | "skipped";
        testRunId: string;
        durationMs?: number | undefined;
    };
    eventId?: string | undefined;
}, {
    correlationId: string;
    eventType: string;
    occurredAt: string;
    orgId: string;
    projectId: string;
    payload: {
        status: "failed" | "passed" | "skipped";
        testRunId: string;
        durationMs?: number | undefined;
    };
    eventId?: string | undefined;
}>;
export declare const testFailedSchema: z.ZodObject<{
    eventId: z.ZodOptional<z.ZodString>;
    eventType: z.ZodString;
    occurredAt: z.ZodString;
    correlationId: z.ZodString;
    orgId: z.ZodString;
    projectId: z.ZodString;
} & {
    payload: z.ZodObject<{
        testRunId: z.ZodString;
        testId: z.ZodString;
        status: z.ZodLiteral<"failed">;
        error: z.ZodOptional<z.ZodString>;
        artifacts: z.ZodOptional<z.ZodObject<{
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
        status: "failed";
        testId: string;
        testRunId: string;
        artifacts?: {
            screenshots: string[];
            video?: string | undefined;
            trace?: string | undefined;
            har?: string | undefined;
        } | undefined;
        error?: string | undefined;
    }, {
        status: "failed";
        testId: string;
        testRunId: string;
        artifacts?: {
            screenshots: string[];
            video?: string | undefined;
            trace?: string | undefined;
            har?: string | undefined;
        } | undefined;
        error?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    eventType: string;
    occurredAt: string;
    orgId: string;
    projectId: string;
    payload: {
        status: "failed";
        testId: string;
        testRunId: string;
        artifacts?: {
            screenshots: string[];
            video?: string | undefined;
            trace?: string | undefined;
            har?: string | undefined;
        } | undefined;
        error?: string | undefined;
    };
    eventId?: string | undefined;
}, {
    correlationId: string;
    eventType: string;
    occurredAt: string;
    orgId: string;
    projectId: string;
    payload: {
        status: "failed";
        testId: string;
        testRunId: string;
        artifacts?: {
            screenshots: string[];
            video?: string | undefined;
            trace?: string | undefined;
            har?: string | undefined;
        } | undefined;
        error?: string | undefined;
    };
    eventId?: string | undefined;
}>;
export declare const insightGeneratedSchema: z.ZodObject<{
    eventId: z.ZodOptional<z.ZodString>;
    eventType: z.ZodString;
    occurredAt: z.ZodString;
    correlationId: z.ZodString;
    orgId: z.ZodString;
    projectId: z.ZodString;
} & {
    payload: z.ZodObject<{
        testRunId: z.ZodString;
        failureSummary: z.ZodString;
        rootCause: z.ZodString;
        suggestedFix: z.ZodString;
        confidence: z.ZodNumber;
        evidenceRefs: z.ZodArray<z.ZodString, "many">;
        relatedCommit: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        testRunId: string;
        failureSummary: string;
        rootCause: string;
        suggestedFix: string;
        confidence: number;
        evidenceRefs: string[];
        relatedCommit?: string | undefined;
    }, {
        testRunId: string;
        failureSummary: string;
        rootCause: string;
        suggestedFix: string;
        confidence: number;
        evidenceRefs: string[];
        relatedCommit?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    eventType: string;
    occurredAt: string;
    orgId: string;
    projectId: string;
    payload: {
        testRunId: string;
        failureSummary: string;
        rootCause: string;
        suggestedFix: string;
        confidence: number;
        evidenceRefs: string[];
        relatedCommit?: string | undefined;
    };
    eventId?: string | undefined;
}, {
    correlationId: string;
    eventType: string;
    occurredAt: string;
    orgId: string;
    projectId: string;
    payload: {
        testRunId: string;
        failureSummary: string;
        rootCause: string;
        suggestedFix: string;
        confidence: number;
        evidenceRefs: string[];
        relatedCommit?: string | undefined;
    };
    eventId?: string | undefined;
}>;
export type CommitPushed = z.infer<typeof commitPushedSchema>;
export type TestsGenerated = z.infer<typeof testsGeneratedSchema>;
export type TestCompleted = z.infer<typeof testCompletedSchema>;
export type TestFailed = z.infer<typeof testFailedSchema>;
export type InsightGenerated = z.infer<typeof insightGeneratedSchema>;
export declare function createCommitPushed(input: {
    repo: string;
    branch: string;
    commitSha: string;
    previousCommitSha: string;
    pusher: string;
    isMasterBranch: boolean;
    orgId?: string;
    projectId?: string;
}): {
    correlationId: string;
    eventType: string;
    occurredAt: string;
    orgId: string;
    projectId: string;
    payload: {
        branch: string;
        commitSha: string;
        previousCommitSha: string;
        repo: string;
        pusher: string;
        isMasterBranch: boolean;
    };
    eventId?: string | undefined;
};
export declare function createTestsGenerated(input: {
    reportId: string;
    specFiles: string[];
    riskScore: number;
    commitSha: string;
    correlationId: string;
    orgId?: string;
    projectId?: string;
}): {
    correlationId: string;
    eventType: string;
    occurredAt: string;
    orgId: string;
    projectId: string;
    payload: {
        commitSha: string;
        riskScore: number;
        reportId: string;
        specFiles: string[];
    };
    eventId?: string | undefined;
};
export declare function createTestFailed(input: {
    testRunId: string;
    testId: string;
    error?: string;
    artifacts?: {
        screenshots: string[];
        video?: string;
        trace?: string;
        har?: string;
    };
    correlationId: string;
    orgId?: string;
    projectId?: string;
}): {
    correlationId: string;
    eventType: string;
    occurredAt: string;
    orgId: string;
    projectId: string;
    payload: {
        status: "failed";
        testId: string;
        testRunId: string;
        artifacts?: {
            screenshots: string[];
            video?: string | undefined;
            trace?: string | undefined;
            har?: string | undefined;
        } | undefined;
        error?: string | undefined;
    };
    eventId?: string | undefined;
};
export declare function createInsightGenerated(input: {
    testRunId: string;
    failureSummary: string;
    rootCause: string;
    suggestedFix: string;
    confidence: number;
    evidenceRefs: string[];
    relatedCommit?: string;
    correlationId: string;
    orgId?: string;
    projectId?: string;
}): {
    correlationId: string;
    eventType: string;
    occurredAt: string;
    orgId: string;
    projectId: string;
    payload: {
        testRunId: string;
        failureSummary: string;
        rootCause: string;
        suggestedFix: string;
        confidence: number;
        evidenceRefs: string[];
        relatedCommit?: string | undefined;
    };
    eventId?: string | undefined;
};
export * from './database.js';
