## Plan: Align Event-Driven AI Synthetic Monitoring Pipeline

TL;DR: Refactor the current monolithic webhook flow into an event-driven pipeline that matches the architecture in `.github/copilot-instructions.md`. Keep existing service logic, but separate responsibilities so `webhook-receiver` only emits `commit.pushed`, `deployment-intelligence-agent` consumes and generates `tests.generated`, `worker`/`playwright-execution-engine` executes on queue messages, and `root-cause-agent` responds to `test.failed`.

Steps
1. Assess and document current gaps.
   - `services/webhook-receiver/src/server.ts` currently calls `deployment-intelligence-agent`, execution logic, and failure analysis directly.
   - The system uses `packages/message-queue/src/redis.ts` for Redis queueing, not a full pub/sub event bus.
   - Shared schemas in `packages/shared-types/src/index.ts` exist, but there is no explicit event contract type for `tests.generated`, `test.failed`, or `insight.generated`.

2. Define event contracts in shared-types.
   - Add event-specific Zod schemas and TypeScript types for `commit.pushed`, `tests.generated`, `test.completed`, `test.failed`, and `insight.generated`.
   - Keep `BaseEnvelope` and use it consistently across services.
   - Add helper creators for event envelopes if missing.

3. Refactor `webhook-receiver` to emit events only.
   - In `services/webhook-receiver/src/server.ts`, preserve GitHub push processing and HMAC/branch validation, but remove direct orchestration.
   - On `commit.pushed`, enqueue a `DEPLOYMENT_REPORT` or publish a `commit.pushed` event to Redis.
   - Do not call `analyzeDeploymentIntelligence`, `executeSpecFiles`, or root-cause analysis from this service.
   - Ensure `packages/config/src/index.ts` provides webhook secret and queue config.

4. Implement deployment intelligence event consumer.
   - Create or update a service entrypoint in `services/deployment-intelligence-agent` that consumes the new Redis queue or message channel.
   - It should fetch commit and build context, perform analysis with `analyzeDeploymentIntelligence`, write `deployment_reports` via `packages/database/src/repository.ts`, and generate spec files via `generatePlaywrightTests`.
   - Emit `tests.generated` by enqueuing a `TEST_EXECUTION` message or publishing `tests.generated` event.
   - Keep spec file generation local to the service and persist spec metadata in the DB if possible.

5. Refactor execution flow into worker + execution engine boundaries.
   - Keep `services/worker/src/index.ts` as the queue consumer and use it to call `executeSpecFiles` from `services/playwright-execution-engine/src/runner.ts`.
   - Move DB persistence of test run status and artifacts into `runner.ts` or the worker, not into the webhook receiver.
   - Ensure the worker emits or enqueues `test.completed`/`test.failed` events after each run.
   - Update `services/playwright-execution-engine/src/index.ts` so it only exports event factory helpers and runner functionality, not orchestration logic.

6. Refactor `root-cause-agent` to consume failure events.
   - Add a queue subscription to `services/root-cause-agent/src/index.ts` so it listens for `test.failed` messages.
   - Use `analyzeFailure` or a new typed analysis flow to generate insights, persist via `DatabaseRepository.saveRootCause`, and emit `insight.generated` if required.
   - Ensure the insight is linked to the original commit/test run and includes `evidenceRefs`.

7. Strengthen persistence and artifact handling.
   - Verify `packages/database/src/repository.ts` supports the fields needed for reports, runs, artifacts, and insights.
   - Add or revise artifact persistence logic so screenshots/video/trace/HAR references are stored and queryable.
   - If full object storage is not yet in place, plan a stubbed `uploadArtifacts` step with clearly identified TODO for S3/MinIO integration.

8. Update infra and service wiring.
   - Modify `infra/k8s/*.yaml` and `infra/helm/*` so each service has separate deployment entries and env vars for queue URLs, DB URL, webhook secret, and service port.
   - Ensure `services/webhook-receiver`, `deployment-intelligence-agent`, `playwright-execution-engine`/`worker`, and `root-cause-agent` are distinct deployments.
   - Keep `redis` and `postgres` as shared infrastructure and avoid secrets in manifests.

9. Add focused tests and validation.
   - Add unit tests for new event schema creators in `packages/shared-types/src/index.test.ts`.
   - Add integration-style tests for `services/webhook-receiver` to ensure only `commit.pushed` enqueues an event.
   - Add tests for `deployment-intelligence-agent` consumption and `tests.generated` emission.
   - Add tests for worker processing of `TEST_EXECUTION` and root cause event consumption if possible.

Relevant files
- `services/webhook-receiver/src/server.ts`
- `services/webhook-receiver/src/index.ts`
- `services/deployment-intelligence-agent/src/index.ts`
- `services/deployment-intelligence-agent/src/ai-analyzer.ts`
- `services/playwright-execution-engine/src/index.ts`
- `services/playwright-execution-engine/src/runner.ts`
- `services/worker/src/index.ts`
- `services/root-cause-agent/src/index.ts`
- `packages/message-queue/src/redis.ts`
- `packages/shared-types/src/index.ts`
- `packages/database/src/repository.ts`
- `infra/k8s/*.yaml`
- `infra/helm/values.yaml`
- `infra/helm/templates/services.yaml`

Verification
1. Run `npm test` and confirm existing tests still pass after refactor.
2. Add a webhook-receiver integration test that sends a master push payload and verifies a Redis queue message is created.
3. Verify deployment intelligence service consumes the queue and writes a `deployment_reports` row with generated spec names.
4. Verify worker processes a queued `TEST_EXECUTION` message and updates test run status in Postgres.
5. Verify root-cause agent processes `test.failed` messages and writes `root_cause_insights`.

Decisions
- Use current Redis queueing mechanism rather than adding Kafka now, to keep the plan aligned with existing repo patterns.
- Treat missing LLM Gateway and S3/object storage as next-phase work if the current repository scope is limited to pipeline wiring.
- Preserve current file-based spec generation but separate it from the webhook service.

Further Considerations
1. If you want full production compliance, add a separate `llm-gateway` service and change AI calls to go through it rather than direct local analysis.
2. Confirm whether `services/worker` is intended as the execution orchestrator, and whether `playwright-execution-engine` should be a pure library or a separate service runtime.
3. Decide whether `tests.generated` should be a Redis list queue message or a pub/sub event; current repo is built around list queues.
