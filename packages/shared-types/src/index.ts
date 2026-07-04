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

export type BaseEnvelope = z.infer<typeof baseEnvelopeSchema>;

export const riskAssessmentSchema = z.object({
  riskScore: z.number().min(0).max(1),
  affectedFlows: z.array(z.string()),
  rationale: z.string()
});

export type RiskAssessment = z.infer<typeof riskAssessmentSchema>;

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

export type DeploymentIntelligenceReport = z.infer<typeof deploymentIntelligenceReportSchema>;

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

export type TestRun = z.infer<typeof testRunSchema>;

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

export type RootCauseInsight = z.infer<typeof rootCauseInsightSchema>;

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

export type AiTestSpec = z.infer<typeof aiTestSpecSchema>;

export function createBaseEnvelope(input: { eventType: string; orgId: string; projectId: string; payload?: unknown }) {
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

export function createRiskAssessment(input: RiskAssessment): RiskAssessment {
  return riskAssessmentSchema.parse(input);
}

export function createDeploymentIntelligenceReport(input: Omit<DeploymentIntelligenceReport, 'id' | 'createdAt'>): DeploymentIntelligenceReport {
  return deploymentIntelligenceReportSchema.parse({
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  });
}

export function createRootCauseInsight(input: {
   testRunId: string;
   testId?: string;
   failureSummary: string;
   rootCause: string;
   suggestedFix: string;
   confidence: number;
   evidenceRefs: string[];
   relatedCommit?: string;
 }): RootCauseInsight {
   return rootCauseInsightSchema.parse(input);
 }

export function createAiTestSpec(input: {
   testId: string;
   specFile: string;
   title: string;
   description: string;
   steps: Array<{ action: string; selector?: string; value?: string; url?: string }>;
 }): AiTestSpec {
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

export type CommitPushed = z.infer<typeof commitPushedSchema>;
export type TestsGenerated = z.infer<typeof testsGeneratedSchema>;
export type TestCompleted = z.infer<typeof testCompletedSchema>;
export type TestFailed = z.infer<typeof testFailedSchema>;
export type InsightGenerated = z.infer<typeof insightGeneratedSchema>;

export function createCommitPushed(input: {
   repo: string;
   branch: string;
   commitSha: string;
   previousCommitSha: string;
   pusher: string;
   isMasterBranch: boolean;
   orgId?: string;
   projectId?: string;
 }) {
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

export function createTestsGenerated(input: {
   reportId: string;
   specFiles: string[];
   riskScore: number;
   commitSha: string;
   correlationId: string;
   orgId?: string;
   projectId?: string;
 }) {
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

export function createTestFailed(input: {
   testRunId: string;
   testId: string;
   error?: string;
   artifacts?: { screenshots: string[]; video?: string; trace?: string; har?: string };
   correlationId: string;
   orgId?: string;
   projectId?: string;
 }) {
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

export function createInsightGenerated(input: {
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
 }) {
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
