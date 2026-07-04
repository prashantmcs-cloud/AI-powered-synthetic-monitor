import test from 'node:test';
import assert from 'node:assert/strict';
import { processGitHubPush } from './index.js';

test('emits a commit.pushed event for master-branch pushes', () => {
  const envelope = processGitHubPush({
    ref: 'refs/heads/master',
    repository: { full_name: 'acme/platform' },
    head_commit: { id: 'newsha' },
    pusher: { name: 'octocat' },
    before: 'oldsha'
  });

  assert.equal(envelope.eventType, 'commit.pushed');
  assert.equal((envelope.payload as { commitSha: string }).commitSha, 'newsha');
});

test('ignores non-master pushes', () => {
  const envelope = processGitHubPush({
    ref: 'refs/heads/feature',
    repository: { full_name: 'acme/platform' },
    head_commit: { id: 'newsha' },
    pusher: { name: 'octocat' },
    before: 'oldsha'
  });

  assert.equal(envelope.eventType, 'ignored.push');
});
