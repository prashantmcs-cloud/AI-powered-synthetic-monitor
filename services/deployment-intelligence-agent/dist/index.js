import { createDeploymentIntelligenceReport, createRiskAssessment } from '@ai-synthetic/shared-types';
import { analyzeCommitChanges, generatePlaywrightTests } from './ai-analyzer.js';
import { DatabaseRepository } from '@ai-synthetic/database';
import { dequeue, enqueue, QUEUE_NAMES } from '@ai-synthetic/message-queue';
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
export async function startDeploymentIntelligenceAgent() {
    console.log('Deployment intelligence agent started');
    const repo = new DatabaseRepository();
    while (true) {
        try {
            const message = await dequeue(QUEUE_NAMES.DEPLOYMENT_REPORT);
            if (!message) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }
            console.log('Processing deployment report:', message.id);
            const payload = message.payload;
            const build = {
                buildId: `build-${payload.commitSha.substring(0, 7)}`,
                previousBuildId: `build-${payload.previousCommitSha.substring(0, 7)}`,
                bundleSize: 210000,
                dependencyDelta: []
            };
            const report = analyzeDeploymentIntelligence(payload, build);
            const savedReport = await repo.saveDeploymentReport({
                commitSha: report.commitSha,
                previousCommitSha: report.previousCommitSha,
                buildId: report.buildId,
                previousBuildId: report.previousBuildId,
                riskScore: report.riskAssessment.riskScore,
                affectedFlows: report.riskAssessment.affectedFlows,
                rationale: report.riskAssessment.rationale,
                generatedSpecFiles: report.generatedSpecFiles,
                correlationId: report.correlationId
            });
            await enqueue(QUEUE_NAMES.TEST_EXECUTION, {
                reportId: savedReport.id,
                specFiles: report.generatedSpecFiles,
                riskScore: report.riskAssessment.riskScore,
                commitSha: report.commitSha
            });
            console.log(JSON.stringify({ event: 'tests.generated.enqueued', reportId: savedReport.id }, null, 2));
        }
        catch (error) {
            console.error('Deployment intelligence agent error:', error);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}
if (import.meta.url === `file://${process.argv[1]}`) {
    startDeploymentIntelligenceAgent();
}
