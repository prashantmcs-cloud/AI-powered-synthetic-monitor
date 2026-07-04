import { createDeploymentIntelligenceReport, createRiskAssessment } from '@ai-synthetic/shared-types';
import { analyzeCommitChanges, generatePlaywrightTests } from './ai-analyzer.js';
export function analyzeDeploymentIntelligence(event, build) {
    const comparison = {
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
    const buildComparison = {
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
