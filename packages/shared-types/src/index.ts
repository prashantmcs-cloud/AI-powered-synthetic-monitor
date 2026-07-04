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

export * from './database.js';
