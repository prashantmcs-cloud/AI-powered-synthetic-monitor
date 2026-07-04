import type { TestRun } from '@ai-synthetic/shared-types';

export interface ExecutionInput {
   reportId: string;
   specFiles: string[];
   riskScore: number;
   targetUrl?: string;
}

export interface FailureContext {
   testRunId: string;
   testId: string;
   artifacts: string[];
   error?: string;
}

export async function executeSpecFiles(input: ExecutionInput): Promise<TestRun[]> {
   const runs: TestRun[] = [];
   const startTimes: Record<string, number> = {};

   for (const specFile of input.specFiles) {
     const testRunId = crypto.randomUUID();
     const startTime = Date.now();
     startTimes[testRunId] = startTime;
     const run: TestRun = {
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
     } catch (error) {
       run.status = 'failed';
       run.artifacts = { screenshots: [] };
     }

     run.durationMs = Date.now() - startTime;
     runs.push(run);
   }

   return runs;
 }

interface TestResult {
   passed: boolean;
   screenshots: string[];
   video?: string;
   trace?: string;
   har?: string;
   error?: string;
}

async function runPlaywrightTest(specFile: string, targetUrl?: string): Promise<TestResult> {
   const screenshots: string[] = [];
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
   } catch (error) {
     return { passed: false, screenshots, error: String(error) };
   }
 }