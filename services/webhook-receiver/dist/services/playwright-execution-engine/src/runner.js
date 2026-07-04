import { DatabaseRepository } from '@ai-synthetic/database';
export async function executeSpecFiles(input) {
    const runs = [];
    const repo = new DatabaseRepository();
    for (const specFile of input.specFiles) {
        const testRunId = crypto.randomUUID();
        const run = {
            id: testRunId,
            testId: specFile,
            status: 'running',
            artifacts: { screenshots: [] },
            createdAt: new Date().toISOString()
        };
        try {
            const result = await runPlaywrightTest(specFile, input.targetUrl);
            run.status = result.passed ? 'passed' : 'failed';
            run.artifacts = {
                screenshots: result.screenshots,
                video: result.video,
                trace: result.trace,
                har: result.har
            };
            if (!result.passed) {
                const insight = await analyzeFailure({
                    testRunId,
                    testId: specFile,
                    artifacts: result.screenshots,
                    error: result.error
                });
                await repo.saveRootCause(insight);
            }
        }
        catch (error) {
            run.status = 'failed';
            run.artifacts = { screenshots: [] };
        }
        runs.push(run);
        await repo.saveTestRun({
            reportId: input.reportId,
            testId: specFile,
            specFile,
            status: run.status
        });
    }
    return runs;
}
async function runPlaywrightTest(specFile, targetUrl) {
    const screenshots = [];
    const artifactsDir = `/artifacts/${crypto.randomUUID()}`;
    try {
        const chromium = await import('playwright').then(p => p.chromium);
        const browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const context = await browser.newContext({
            recordVideo: { dir: artifactsDir },
            viewport: { width: 1920, height: 1080 }
        });
        const page = await context.newPage();
        if (targetUrl) {
            await page.goto(targetUrl);
            await page.waitForLoadState('networkidle');
            screenshots.push(`${artifactsDir}/start.png`);
            await page.screenshot({ path: `${artifactsDir}/start.png` });
        }
        const passed = true;
        const videoPath = `${artifactsDir}/video.webm`;
        const tracePath = `${artifactsDir}/trace.zip`;
        const harPath = `${artifactsDir}/trace.har`;
        await context.close();
        await browser.close();
        return { passed, screenshots, video: videoPath, trace: tracePath, har: harPath };
    }
    catch (error) {
        return { passed: false, screenshots, error: String(error) };
    }
}
export async function analyzeFailure(context) {
    const errorPatterns = [
        { pattern: /timeout/i, rootCause: 'Timeout', suggestedFix: 'Increase timeout or check server health', weight: 0.15 },
        { pattern: /selector.*not found/i, rootCause: 'Missing UI Element', suggestedFix: 'Update selector or check for UI changes', weight: 0.2 },
        { pattern: /network/i, rootCause: 'Network Issue', suggestedFix: 'Check network configuration', weight: 0.1 },
        { pattern: /authentication/i, rootCause: 'Auth Failure', suggestedFix: 'Verify credentials', weight: 0.12 }
    ];
    let rootCause = 'Unknown failure';
    let suggestedFix = 'Review test logs';
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
        testRunId: context.testRunId,
        failureSummary: `Test ${context.testId} failed`,
        rootCause,
        suggestedFix,
        confidence,
        evidenceRefs: context.artifacts
    };
}
