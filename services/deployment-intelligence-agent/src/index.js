import { createDeploymentIntelligenceReport, createRiskAssessment } from '@ai-synthetic/shared-types';
export function analyzeDeploymentIntelligence(event, build) {
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
export function generateSpecFiles(event, risk) {
    const baseDir = 'tests/generated';
    return risk.affectedFlows.map((flow, index) => `${baseDir}/${event.repo.replace(/\W+/g, '-')}-${flow}-${index + 1}.spec.ts`);
}
function inferAffectedFlows(event) {
    const flows = ['checkout', 'login', 'dashboard'];
    if (event.commitSha.includes('feature')) {
        return ['checkout'];
    }
    return flows.filter((flow) => flow.length > 0).slice(0, 2);
}
function computeRiskScore(event, build) {
    const commitDelta = event.commitSha.length % 5;
    const buildDelta = build.bundleSize > 180000 ? 0.25 : 0.1;
    return Math.min(0.99, 0.3 + commitDelta * 0.08 + buildDelta);
}
