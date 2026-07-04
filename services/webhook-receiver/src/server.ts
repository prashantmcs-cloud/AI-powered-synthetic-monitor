import { createServer } from 'node:http';
import { processGitHubPush } from './index.js';
import { analyzeDeploymentIntelligence } from '../../deployment-intelligence-agent/src/index.js';
import { executeSpecFiles, createFailureInsight } from '../../playwright-execution-engine/src/index.js';
import { analyzeFailure } from '../../root-cause-agent/src/index.js';

const port = Number(process.env.PORT || 3000);

export function startWebhookServer() {
  const server = createServer((req, res) => {
    if (req.method !== 'POST') {
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      const payload = JSON.parse(body || '{}');
      const envelope = processGitHubPush(payload);

      if (envelope.eventType === 'commit.pushed') {
        const commitPayload = envelope.payload as { repo: string; branch: string; commitSha: string; previousCommitSha: string; pusher: string; isMasterBranch: boolean };
        const report = analyzeDeploymentIntelligence({
          repo: commitPayload.repo,
          branch: commitPayload.branch,
          commitSha: commitPayload.commitSha,
          previousCommitSha: commitPayload.previousCommitSha,
          pusher: commitPayload.pusher,
          timestamp: new Date().toISOString()
        }, {
          buildId: 'build-local',
          previousBuildId: 'build-previous',
          bundleSize: 210000,
          dependencyDelta: ['playwright']
        });

        const runs = executeSpecFiles({
          reportId: report.id ?? 'report-local',
          specFiles: report.generatedSpecFiles,
          riskScore: report.riskAssessment.riskScore
        });

        const failedRun = runs.find((run) => run.status === 'failed');
        if (failedRun) {
          const insight = analyzeFailure({
            testId: failedRun.testId,
            artifacts: failedRun.artifacts.screenshots,
            relatedCommit: report.commitSha
          });
          createFailureInsight(failedRun);
          console.log(JSON.stringify({ event: 'insight.generated', insight }));
        }

        console.log(JSON.stringify({ event: 'deployment.intelligence.generated', report, runs }));
      }

      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ received: true, eventType: envelope.eventType }));
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
