import { createServer } from 'node:http';
import { processGitHubPush } from './index.js';
import { enqueue, QUEUE_NAMES } from '@ai-synthetic/message-queue';
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
            try {
                const payload = JSON.parse(body || '{}');
                const envelope = processGitHubPush(payload);
                if (envelope.eventType === 'commit.pushed') {
                    const commitPayload = envelope.payload;
                    const event = {
                        repo: commitPayload.repo,
                        branch: commitPayload.branch,
                        commitSha: commitPayload.commitSha,
                        previousCommitSha: commitPayload.previousCommitSha,
                        pusher: commitPayload.pusher,
                        timestamp: new Date().toISOString()
                    };
                    await enqueue(QUEUE_NAMES.DEPLOYMENT_REPORT, event);
                    console.log(JSON.stringify({ event: 'commit.pushed.enqueued', repo: event.repo, commitSha: event.commitSha }, null, 2));
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
