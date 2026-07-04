import { createDeploymentIntelligenceReport, createRiskAssessment, type DeploymentIntelligenceReport } from '@ai-synthetic/shared-types';

export interface CommitEvent {
  repo: string;
  branch: string;
  commitSha: string;
  previousCommitSha: string;
  pusher: string;
  timestamp: string;
}

export interface BuildSnapshot {
  buildId: string;
  previousBuildId: string;
  bundleSize: number;
  dependencyDelta: string[];
}

export function analyzeDeploymentIntelligence(event: CommitEvent, build: BuildSnapshot): DeploymentIntelligenceReport {
  const riskAssessment = createRiskAssessment({
    riskScore: computeRiskScore(event, build),
    affectedFlows: inferAffectedFlows(event),
    rationale: `Compared ${event.commitSha} against ${event.previousCommitSha} with build ${build.buildId} vs ${build.previousBuildId}.`
  });

  return createDeploymentIntelligenceReport({
    commitSha: event.commitSha,
    previousCommitSha: event.previousCommitSha,
    buildId: build.buildId,
    previousBuildId: build.previousBuildId,
    riskAssessment,
    generatedSpecFiles: generateSpecFiles(event, riskAssessment),
    correlationId: crypto.randomUUID()
  });
}

export function generateSpecFiles(event: CommitEvent, risk: { riskScore: number; affectedFlows: string[] }): string[] {
  const baseDir = 'tests/generated';
  return risk.affectedFlows.map((flow, index) => `${baseDir}/${event.repo.replace(/\W+/g, '-')}-${flow}-${index + 1}.spec.ts`);
}

function inferAffectedFlows(event: CommitEvent): string[] {
  const flows = ['checkout', 'login', 'dashboard'];
  if (event.commitSha.includes('feature')) {
    return ['checkout'];
  }
  return flows.filter((flow) => flow.length > 0).slice(0, 2);
}

function computeRiskScore(event: CommitEvent, build: BuildSnapshot): number {
  const commitDelta = event.commitSha.length % 5;
  const buildDelta = build.bundleSize > 180000 ? 0.25 : 0.1;
  return Math.min(0.99, 0.3 + commitDelta * 0.08 + buildDelta);
}
