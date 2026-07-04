import type { RootCauseInsight } from '@ai-synthetic/shared-types';

export interface FailureContext {
  testRunId: string;
  testId: string;
  artifacts: string[];
  relatedCommit?: string;
  error?: string;
}

export function analyzeFailure(context: FailureContext): Omit<RootCauseInsight, 'id'> {
  const errorPatterns = [
    { pattern: /timeout|timed out/i, rootCause: 'Timeout', suggestedFix: 'Increase timeout or check server health', weight: 0.15 },
    { pattern: /selector.*not found|element not found/i, rootCause: 'Missing UI Element', suggestedFix: 'Update selector or check for UI changes', weight: 0.2 },
    { pattern: /network|connection refused/i, rootCause: 'Network Issue', suggestedFix: 'Check network configuration', weight: 0.1 },
    { pattern: /authentication|401|403/i, rootCause: 'Auth Failure', suggestedFix: 'Verify credentials', weight: 0.12 }
  ];
  
  let rootCause = 'Unknown failure';
  let suggestedFix = 'Review test logs for details';
  let confidence = 0.6;
  
  if (context.error) {
    for (const { pattern, rootCause: rc, suggestedFix: fix, weight } of errorPatterns) {
      if (pattern.test(context.error)) {
        rootCause = rc;
        suggestedFix = fix;
        confidence = 0.75 + weight;
        break;
      }
    }
  }
  
  return {
    testId: context.testId,
    failureSummary: `Test ${context.testId} failed during execution`,
    rootCause,
    suggestedFix,
    confidence,
    relatedCommit: context.relatedCommit,
    evidenceRefs: context.artifacts
  };
}