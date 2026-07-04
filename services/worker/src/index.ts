import { dequeue, enqueue, QUEUE_NAMES } from '@ai-synthetic/message-queue';
import { executeSpecFiles } from '@ai-synthetic/playwright-execution-engine';
import { DatabaseRepository } from '@ai-synthetic/database';

interface TestExecutionPayload {
   reportId: string;
   specFiles: string[];
   riskScore: number;
   commitSha: string;
}

export async function startWorker() {
   console.log('Test execution worker started');
   const repo = new DatabaseRepository();

   while (true) {
     try {
       const message = await dequeue(QUEUE_NAMES.TEST_EXECUTION);
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
         const createdAt = run.createdAt ?? new Date().toISOString();
         const durationMs = run.durationMs ?? (Date.now() - new Date(createdAt).getTime());
         await repo.updateTestRunStatus(run.id ?? '', run.status, durationMs);

         if (run.status === 'failed') {
           await enqueue(QUEUE_NAMES.ROOT_CAUSE, {
             testRunId: run.id ?? '',
             testId: run.testId,
             artifacts: run.artifacts,
             relatedCommit: payload.commitSha
           });
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