import { createServer } from 'node:http';
import { processGitHubPush } from './index.js';
import { analyzeDeploymentIntelligence } from '../../deployment-intelligence-agent/src/index.js';
import { executeSpecFiles } from '../../playwright-execution-engine/src/runner.js';
import { analyzeFailure } from '../../root-cause-agent/src/index.js';
import { DatabaseRepository } from '@ai-synthetic/database';
import { enqueue } from '@ai-synthetic/message-queue';
const port = Number(process.env.PORT || 3000);
export function startWebhookServer() {
    const server = createServer(async (req, res) => {
        if (req.method !== 'POST') {
            res.writeHead(404, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not found' }));
            return;
        }
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', async () => {
            const repo = new DatabaseRepository();
            try {
                const payload = JSON.parse(body || '{}');
                const envelope = processGitHubPush(payload);
                if (envelope.eventType === 'commit.pushed') {
                    const commitPayload = envelope.payload;
                    const report = analyzeDeploymentIntelligence({
                        repo: commitPayload.repo,
                        branch: commitPayload.branch,
                        commitSha: commitPayload.commitSha,
                        previousCommitSha: commitPayload.previousCommitSha,
                        pusher: commitPayload.pusher,
                        timestamp: new Date().toISOString()
                    }, {
                        buildId: `build-${commitPayload.commitSha.substring(0, 7)}`,
                        previousBuildId: `build-${commitPayload.previousCommitSha.substring(0, 7)}`,
                        bundleSize: 210000,
                        dependencyDelta: []
                    });
                    await repo.saveDeploymentReport({
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
                    const runs = await executeSpecFiles({
                        reportId: report.id ?? 'report-local',
                        specFiles: report.generatedSpecFiles,
                        riskScore: report.riskAssessment.riskScore
                    });
                    for (const run of runs) {
                        if (run.status === 'failed') {
                            const insight = await analyzeFailure({
                                testRunId: run.id ?? '',
                                testId: run.testId,
                                artifacts: run.artifacts.screenshots,
                                relatedCommit: report.commitSha
                            });
                            await repo.saveRootCause(insight);
                        }
                    }
                    await enqueue('TEST_EXECUTION', { reportId: report.id, runs });
                    console.log(JSON.stringify({ event: 'deployment.intelligence.processed', report, runs }, null, 2));
                }
                res.writeHead(200, { 'content-type': 'application/json' });
                res.end(JSON.stringify({ received: true, eventType: envelope.eventType }));
            }
            catch (error) {
                res.writeHead(500, { 'content-type': 'application/json' });
                res.end(JSON.stringify({ error: String(error) }));
            }
        });
    });
    server.listen(port, () => {
        console.log(`Webhook receiver listening on http://localhost:${port}`);
    });
    return server;
}
if (import.meta.url === `file://${process.argv[1]}`) {
    startWebhookServer();
}
