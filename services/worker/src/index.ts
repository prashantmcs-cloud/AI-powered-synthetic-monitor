import { enqueue, dequeue, QUEUE_NAMES } from '@ai-synthetic/message-queue';
import { executeSpecFiles, analyzeFailure } from '@ai-synthetic/playwright-execution-engine/src/runner.js';
import { DatabaseRepository } from '@ai-synthetic/database';

interface TestExecutionPayload {
   reportId: string;
   specFiles: string[];
   riskScore: number;
}

export async function startWorker() {
   console.log('Test execution worker started');
   const repo = new DatabaseRepository();
   
   while (true) {
     try {
       const message = await dequeue('TEST_EXECUTION');
       if (!message) {
         await new Promise(resolve => setTimeout(resolve, 1000));
         continue;
       }
       
       console.log('Processing test execution:', message.id);
       
       const payload = message.payload as TestExecutionPayload;
       const runs = await executeSpecFiles({
         reportId: payload.reportId,
         specFiles: payload.specFiles,
         riskScore: payload.riskScore
       });
       
       for (const run of runs) {
         await repo.updateTestRunStatus(run.id ?? '', run.status, run.durationMs);
         
         if (run.status === 'failed') {
           const insight = await analyzeFailure({
             testRunId: run.id ?? '',
             testId: run.testId,
             artifacts: run.artifacts.screenshots,
             error: 'Test failed during execution'
           });
           await repo.saveRootCause(insight);
         }
       }
       
       console.log(`Completed test execution processing`);
     } catch (error) {
       console.error('Worker error:', error);
       await new Promise(resolve => setTimeout(resolve, 5000));
     }
   }
 }

if (import.meta.url === `file://${process.argv[1]}`) {
   startWorker();
 }