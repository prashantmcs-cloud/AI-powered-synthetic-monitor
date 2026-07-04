import test from 'node:test';
import assert from 'node:assert/strict';
import { createBaseEnvelope, createRiskAssessment, createDeploymentIntelligenceReport } from './index.js';

test('creates a typed deployment report envelope and risk assessment', () => {
  const envelope = createBaseEnvelope({
    eventType: 'commit.pushed',
    orgId: 'acme',
    projectId: 'platform'
  });

  const assessment = createRiskAssessment({
    riskScore: 0.82,
    affectedFlows: ['checkout', 'checkout-success'],
    rationale: 'Payment checkout paths changed.'
  });

  const report = createDeploymentIntelligenceReport({
    commitSha: 'abc123',
    previousCommitSha: 'def456',
    buildId: 'build-100',
    previousBuildId: 'build-99',
    riskAssessment: assessment,
    generatedSpecFiles: ['tests/checkout.spec.ts'],
    correlationId: envelope.correlationId
  });

  assert.equal(report.commitSha, 'abc123');
  assert.equal(report.riskAssessment.riskScore, 0.82);
  assert.equal(report.generatedSpecFiles[0], 'tests/checkout.spec.ts');
  assert.equal(report.correlationId, envelope.correlationId);
});
