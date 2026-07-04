import test from 'node:test';
import assert from 'node:assert/strict';
import { startWebhookServer } from './server.js';

let server: ReturnType<typeof startWebhookServer> | undefined;

test('starts a webhook server and handles POST payloads', async () => {
  server = startWebhookServer();
  const response = await fetch('http://127.0.0.1:3000', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      ref: 'refs/heads/master',
      repository: { full_name: 'acme/platform' },
      head_commit: { id: 'newsha' },
      pusher: { name: 'octocat' },
      before: 'oldsha'
    })
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.received, true);
  server.close();
  server = undefined;
});
