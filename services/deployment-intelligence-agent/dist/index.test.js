import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeDeploymentIntelligence } from './index.js';
test('generates deployment intelligence and a spec file list', () => {
    const report = analyzeDeploymentIntelligence({
        repo: 'acme/app',
        branch: 'master',
        commitSha: 'feature-commit-123',
        previousCommitSha: 'previous-commit-456',
        pusher: 'octocat',
        timestamp: '2026-07-04T00:00:00.000Z'
    }, {
        buildId: 'build-200',
        previousBuildId: 'build-199',
        bundleSize: 220000,
        dependencyDelta: ['playwright']
    });
    assert.ok(report.riskAssessment.riskScore > 0);
    assert.ok(report.generatedSpecFiles.length > 0);
    assert.match(report.generatedSpecFiles[0], /tests\/generated\//);
});
