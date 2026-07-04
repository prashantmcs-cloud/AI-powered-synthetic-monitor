import { enqueue, dequeue, QUEUE_NAMES } from '@ai-synthetic/message-queue';
import { executeSpecFiles } from '@ai-synthetic/playwright-execution-engine/src/runner.js';
import { DatabaseRepository } from '@ai-synthetic/database';

export async function startWorker() {
  console.log('Test execution worker started');
  
  while (true) {
    try {
      const message = await dequeue('TEST_EXECUTION');
      if (!message) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      console.log('Processing test execution:', message.id);
      
      const runs = await executeSpecFiles({
        reportId: message.payload.reportId,
        specFiles: message.payload.specFiles,
        riskScore: message.payload.riskScore
      });
      
      for (const run of runs) {
        await DatabaseRepository.updateTestRunStatus(run.id, run.status, run.durationMs);
        
        if (run.status === 'failed') {
          const insight = {
            testRunId: run.id,
            testId: run.testId,
            artifacts: run.artifacts.screenshots,
            error: `Test failed during execution`
          };
          await DatabaseRepository.saveRootCause(insight);
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