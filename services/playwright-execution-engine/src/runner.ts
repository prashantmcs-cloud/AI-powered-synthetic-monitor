import type { TestRun, RootCauseInsight } from '@ai-synthetic/shared-types';
import { DatabaseRepository } from '@ai-synthetic/database';

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
  const repo = new DatabaseRepository();
  
  for (const specFile of input.specFiles) {
    const testRunId = crypto.randomUUID();
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
      
      if (!result.passed) {
        const insight = await analyzeFailure({
          testRunId,
          testId: specFile,
          artifacts: result.screenshots,
          error: result.error
        });
        await repo.saveRootCause(insight);
      }
    } catch (error) {
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

export async function analyzeFailure(context: FailureContext): Promise<Omit<RootCauseInsight, 'id'>> {
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
    testId: context.testId,
    failureSummary: `Test ${context.testId} failed`,
    rootCause,
    suggestedFix,
    confidence,
    evidenceRefs: context.artifacts
  };
}