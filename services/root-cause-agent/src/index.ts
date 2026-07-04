import type { RootCauseInsight } from '@ai-synthetic/shared-types';
import { DatabaseRepository } from '@ai-synthetic/database';
import { dequeue, QUEUE_NAMES } from '@ai-synthetic/message-queue';

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
     testRunId: context.testRunId,
     failureSummary: `Test ${context.testId} failed during execution`,
     rootCause,
     suggestedFix,
     confidence,
     relatedCommit: context.relatedCommit,
     evidenceRefs: context.artifacts
   };
 }

interface TestFailedPayload {
   testRunId: string;
   testId: string;
   error?: string;
   artifacts?: { screenshots: string[]; video?: string; trace?: string; har?: string };
   relatedCommit?: string;
}

export async function startRootCauseAgent() {
   console.log('Root cause agent started');
   const repo = new DatabaseRepository();

   while (true) {
     try {
       const message = await dequeue(QUEUE_NAMES.ROOT_CAUSE);
       if (!message) {
         await new Promise(resolve => setTimeout(resolve, 1000));
         continue;
       }

       console.log('Processing test failure:', message.id);

       const payload = message.payload as TestFailedPayload;
       const insight = analyzeFailure({
         testRunId: payload.testRunId,
         testId: payload.testId,
         artifacts: payload.artifacts?.screenshots ?? [],
         error: payload.error,
         relatedCommit: payload.relatedCommit
       });

       await repo.saveRootCause({
         testRunId: insight.testRunId,
         failureSummary: insight.failureSummary,
         rootCause: insight.rootCause,
         suggestedFix: insight.suggestedFix,
         confidence: insight.confidence,
         evidenceRefs: insight.evidenceRefs,
         relatedCommit: insight.relatedCommit
       });

       console.log(JSON.stringify({ event: 'insight.generated', testRunId: insight.testRunId }, null, 2));
     } catch (error) {
       console.error('Root cause agent error:', error);
       await new Promise(resolve => setTimeout(resolve, 5000));
     }
   }
 }

if (import.meta.url === `file://${process.argv[1]}`) {
   startRootCauseAgent();
}