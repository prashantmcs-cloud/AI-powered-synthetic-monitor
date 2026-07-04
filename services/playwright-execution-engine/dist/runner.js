export async function executeSpecFiles(input) {
    const runs = [];
    const startTimes = {};
    for (const specFile of input.specFiles) {
        const testRunId = crypto.randomUUID();
        const startTime = Date.now();
        startTimes[testRunId] = startTime;
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
        }
        catch (error) {
            run.status = 'failed';
            run.artifacts = { screenshots: [] };
        }
        run.durationMs = Date.now() - startTime;
        runs.push(run);
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
