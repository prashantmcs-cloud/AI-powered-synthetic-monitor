import { createBaseEnvelope, createRootCauseInsight } from '@ai-synthetic/shared-types';
export function executeSpecFiles(input) {
    return input.specFiles.map((specFile, index) => ({
        id: `run-${index + 1}`,
        testId: specFile,
        status: input.riskScore > 0.7 ? 'failed' : 'passed',
        artifacts: {
            screenshots: [`artifacts/${specFile.replace(/\W+/g, '-')}-start.png`],
            video: `artifacts/${specFile.replace(/\W+/g, '-')}.webm`,
            trace: `artifacts/${specFile.replace(/\W+/g, '-')}.zip`,
            har: `artifacts/${specFile.replace(/\W+/g, '-')}.har`
        },
        createdAt: new Date().toISOString()
    }));
}
export function createFailureInsight(testRun) {
    return createRootCauseInsight({
        testId: testRun.testId,
        failureSummary: 'The generated synthetic check failed during execution.',
        rootCause: 'The Playwright flow likely hit an unexpected UI state or environment issue.',
        suggestedFix: 'Review the impacted flow and update the generated spec to match the latest UI contract.',
        confidence: 0.78,
        relatedCommit: 'latest',
        evidenceRefs: testRun.artifacts.screenshots.concat(testRun.artifacts.video ?? [])
    });
}
export function emitExecutionEvent(input) {
    return createBaseEnvelope({
        eventType: 'tests.generated',
        orgId: 'acme',
        projectId: 'platform',
        payload: input
    });
}
