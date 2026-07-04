import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeFailure } from './index.js';
test('produces a structured root cause insight', () => {
    const insight = analyzeFailure({
        testId: 'tests/generated/dashboard.spec.ts',
        artifacts: ['artifacts/dashboard.png'],
        relatedCommit: 'abc123'
    });
    assert.equal(insight.testId, 'tests/generated/dashboard.spec.ts');
    assert.ok(insight.confidence > 0.8);
});
