import { createDeploymentIntelligenceReport, createRiskAssessment, type DeploymentIntelligenceReport } from '@ai-synthetic/shared-types';
import { analyzeCommitChanges, generatePlaywrightTests, type GitHubCommitComparison, type BuildComparison } from './ai-analyzer.js';

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
  const comparison: GitHubCommitComparison = {
    currentCommit: {
      sha: event.commitSha,
      message: 'Commit for analysis',
      author: event.pusher,
      files: [],
      additions: 0,
      deletions: 0
    },
    previousCommit: {
      sha: event.previousCommitSha,
      message: 'Previous commit'
    }
  };
  
  const buildComparison: BuildComparison = {
    buildId: build.buildId,
    previousBuildId: build.previousBuildId,
    bundleSize: build.bundleSize,
    previousBundleSize: build.bundleSize * 0.9,
    dependencyDelta: build.dependencyDelta
  };
  
  const analysis = analyzeCommitChanges(comparison);
  
  const riskAssessment = createRiskAssessment({
    riskScore: analysis.riskScore,
    affectedFlows: analysis.affectedFlows,
    rationale: analysis.rationale
  });
  
  return createDeploymentIntelligenceReport({
    commitSha: event.commitSha,
    previousCommitSha: event.previousCommitSha,
    buildId: build.buildId,
    previousBuildId: build.previousBuildId,
    riskAssessment,
    generatedSpecFiles: analysis.affectedFlows.map(f => `tests/generated/${event.commitSha.substring(0, 7)}-${f}.spec.ts`),
    correlationId: crypto.randomUUID()
  });
}

export { analyzeCommitChanges, generatePlaywrightTests };