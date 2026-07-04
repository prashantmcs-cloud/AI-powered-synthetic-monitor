import test from 'node:test';
import assert from 'node:assert/strict';
import { executeSpecFiles, createFailureInsight } from './index.js';

test('executes generated specs and produces artifacts', () => {
  const runs = executeSpecFiles({
    reportId: 'report-1',
    specFiles: ['tests/generated/login.spec.ts'],
    riskScore: 0.8
  });

  assert.equal(runs[0].status, 'failed');
  assert.ok(runs[0].artifacts.screenshots.length > 0);
  assert.ok(runs[0].artifacts.video);
});

test('creates a root cause insight for failures', () => {
  const insight = createFailureInsight({
    id: 'run-1',
    testId: 'tests/generated/login.spec.ts',
    status: 'failed',
    artifacts: { screenshots: ['artifacts/login.png'], video: 'artifacts/login.webm' },
    createdAt: '2026-07-04T00:00:00.000Z'
  });

  assert.ok(insight.failureSummary.length > 0);
  assert.ok(insight.evidenceRefs.length > 0);
});
