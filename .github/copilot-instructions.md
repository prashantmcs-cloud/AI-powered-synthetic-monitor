# GitHub Copilot Instructions
## Project: AI-Driven Playwright Synthetic Monitoring Platform

> Place this file at `.github/copilot-instructions.md` in the repository root.
> GitHub Copilot (Chat, Agent Mode, and Coding Agent) will automatically load this
> file as persistent context for every suggestion, chat response, and autonomous
> task in this repository. Treat every rule below as binding unless a more
> specific instruction file (`.github/instructions/*.instructions.md`) overrides
> it for a given path.

---

## 1. Mission Statement

You are assisting in building a **production-ready, enterprise-grade, AI-driven
Playwright Synthetic Monitoring Platform** intended to replace traditional
synthetic monitoring tools (e.g., Dynatrace Synthetics, Datadog Synthetics).

The platform must autonomously:

1. Detect commits pushed to the `master` branch on GitHub.
2. Trigger a **Deployment Intelligence AI Agent** that compares the latest
   commit vs. the previous commit, and the latest build vs. the previous
   build, to understand what changed and assess risk.
3. Use that analysis to **automatically author new/updated Playwright test
   specs** covering impacted user flows.
4. Automatically **execute** those generated tests via a scalable
   **Playwright Execution Engine** running on Kubernetes.
5. Capture **screenshots and videos for every test case** (pass or fail) and
   make them viewable in the dashboard.
6. On any test failure, invoke an **AI Root Cause Agent** that produces a
   **Failure Summary, Root Cause, and Suggested Fix**.
7. Present all of this through **separate, purpose-built, modern UI
   surfaces** for operations/SRE teams.

Every code change you generate must move the system toward this outcome while
strictly respecting the non-functional requirements in Section 4.

---

## 2. Non-Negotiable Engineering Principles

When writing or modifying code, always:

- **Modular** — one responsibility per service/package. No god-services. Each
  agent, engine, or layer in Section 5 is its own deployable unit with its own
  repo folder, `Dockerfile`, tests, and Kubernetes manifests/Helm chart.
- **Cloud-native** — stateless services, externalized config (env vars / K8s
  ConfigMaps / Secrets), horizontal scalability, graceful shutdown (`SIGTERM`
  handling), health/readiness/liveness endpoints on every service.
- **Kubernetes-first** — every service ships with a `Dockerfile`, a Helm chart
  (or Kustomize overlay), resource requests/limits, and an HPA/KEDA
  ScaledObject where relevant. Never hardcode hostnames, ports, or secrets.
- **AI-enabled, not AI-decorated** — LLM calls must go through the shared LLM
  Gateway (Section 5.7), never directly to a vendor SDK from a feature
  service. Every AI output must be schema-validated (Zod/Pydantic) before use.
- **Production-ready by default** — structured logging (JSON), distributed
  tracing (OpenTelemetry), metrics (Prometheus `/metrics`), retries with
  backoff + circuit breakers on all outbound calls, idempotent event
  consumers, and typed error handling. No `console.log` debugging left in
  committed code.
- **Secure by default** — no secrets in code or manifests (use
  Vault/External Secrets Operator); validate and sanitize all webhook
  payloads (verify GitHub HMAC signature); RBAC-scoped K8s service accounts;
  least-privilege IAM for cloud storage.
- **Test-covered** — unit tests for business logic, integration tests for
  service boundaries (use `testcontainers` for Postgres/Redis/Kafka in CI),
  and contract tests for event schemas. Target ≥80% coverage on new code.

---

## 3. Reference Architecture (source of truth)

The platform follows this layered architecture. Do not introduce components
outside this model without updating this file first.

```
GitHub (master) --push--> Webhook Trigger
        │
        ▼
Kubernetes Cluster (EKS/GKE/AKS)
 ├─ API Gateway / Webhook Receiver (Ingress)
 ├─ Event Bus (Kafka/RabbitMQ)  -- topic: commit.pushed
 ├─ Deployment Intelligence AI Agent
 │    ├─ Commit Diff Analyzer
 │    ├─ Build Comparator
 │    ├─ LLM Impact & Risk Engine
 │    └─ AI Test Case Generator --> writes specs to Test Repo
 ├─ Playwright Execution Engine
 │    ├─ Test Orchestrator & Scheduler
 │    ├─ Test Queue (Redis/Kafka)
 │    ├─ Distributed Runner Pods (Chromium/Firefox/WebKit, HPA/KEDA)
 │    └─ Artifact Capture Sidecar (screenshots, video, trace, HAR)
 ├─ Data & Storage Layer
 │    ├─ Object Storage (S3/MinIO) — artifacts
 │    ├─ PostgreSQL — metadata, runs, results, commit/build history
 │    ├─ Redis — queues, cache, pub/sub
 │    └─ Vector KB (pgvector/Pinecone) — embeddings for code/failures/fixes
 ├─ AI Root Cause Agent (triggered on `test.failed`)
 │    ├─ Failure Event Listener
 │    ├─ Log & Artifact Correlator
 │    ├─ Multimodal LLM Analysis Engine
 │    └─ Insight Generator --> Failure Summary / Root Cause / Suggested Fix
 ├─ Shared GenAI/LLM Layer
 │    ├─ LLM Gateway (model-agnostic)
 │    ├─ Prompt Template Registry (versioned)
 │    ├─ Model Router & Cost Guard
 │    └─ Embedding Service
 └─ Backend API & Orchestration
      ├─ API Gateway (REST/GraphQL/WebSocket)
      ├─ AuthN/AuthZ (OIDC, RBAC)
      ├─ Notification Service (Slack/Teams/Email/PagerDuty)
      └─ Workflow Orchestrator (Argo Workflows/Temporal)

Frontend (outside cluster boundary, served via CDN + API Gateway)
 ├─ Monitoring Console (real-time pass/fail, uptime, SLAs)
 ├─ Deployment Intelligence Console (diff, risk score, generated tests)
 ├─ Root Cause Console (failure summary, video/screenshot replay, fix)
 └─ AI Copilot Chat (cross-cutting, embeddable in the above)
```

Event-driven contract between components is mandatory: services communicate
by publishing/consuming events on the Event Bus, not via direct synchronous
calls, except for user-facing API Gateway requests.

---

## 4. Non-Functional Requirements Checklist

Apply these to every service you scaffold or modify:

| Concern | Requirement |
|---|---|
| Scalability | Stateless pods; horizontal scaling via HPA (CPU/mem) or KEDA (queue depth) |
| Resilience | Retries w/ exponential backoff + jitter; circuit breaker on LLM & external calls |
| Observability | OpenTelemetry traces propagated via `traceparent`; Prometheus metrics; structured JSON logs with `correlationId` |
| Security | HMAC-verified webhooks; JWT/OIDC on all APIs; secrets via K8s Secrets/Vault only |
| Config | 12-factor: all config via env vars, defaults documented in `values.yaml` |
| Data retention | Artifacts (screenshots/video) lifecycle-managed in object storage (e.g., 90-day tiering) |
| Multi-tenancy | Every DB row and event carries `orgId`/`projectId` for future tenant isolation |
| API versioning | All REST endpoints under `/api/v1/...`; breaking changes require `/v2` |

---

## 5. Component Specifications

### 5.1 Deployment Intelligence AI Agent
**Trigger:** `commit.pushed` event (from GitHub webhook via Event Bus), filtered to `ref == refs/heads/master`.

Responsibilities:
- **Commit Diff Analyzer**: fetch latest vs. previous commit via GitHub API
  (`compare` endpoint), produce a structured diff (files changed, routes/
  components touched, semantic diff via AST parsing for JS/TS).
- **Build Comparator**: compare latest build artifact/image metadata
  (bundle size, dependency lockfile delta, config/env diff) vs. previous
  successful build.
- **LLM Impact & Risk Engine**: send the structured diff + build delta to the
  LLM Gateway with a versioned prompt template; return a typed
  `RiskAssessment` object `{ riskScore, affectedFlows[], rationale }`.
  Always validate the LLM response against a strict schema before persisting.
- **AI Test Case Generator**: given `affectedFlows`, generate/update
  Playwright spec files (`*.spec.ts`) following the repo's existing Page
  Object Model conventions. Commit generated specs to the test repository
  (a dedicated git path or object store) with clear provenance metadata
  (`generatedFromCommit`, `generatedAt`, `agentVersion`).
- Emit `tests.generated` event referencing the new/updated spec files to
  trigger the Execution Engine.
- Persist a `DeploymentIntelligenceReport` row (commit SHA, build IDs, risk
  score, affected flows, generated test IDs) in PostgreSQL for the dashboard.

Do not let this agent execute tests directly — it only authors them.

### 5.2 Playwright Execution Engine
- **Test Orchestrator & Scheduler**: consumes `tests.generated` (and manual/
  scheduled triggers), creates Kubernetes `Job`s (or a queue-backed worker
  pool) per test suite/shard.
- **Test Queue**: Redis- or Kafka-backed; supports priority (new
  AI-generated tests can run at higher priority) and retry-with-backoff for
  transient infra failures (not test failures).
- **Distributed Runner Pods**: run Playwright across Chromium/Firefox/WebKit;
  shard by spec file or project; scale via KEDA on queue depth.
- **Artifact Capture**: for every test (pass or fail) capture:
  - Screenshot(s) per step (or at minimum on start/end/failure)
  - Full video recording (`playwright` built-in video capture)
  - Trace file (`playwright` trace viewer format)
  - Console + network logs (HAR)
  Upload all artifacts to Object Storage immediately after each test
  completes; store the resulting URLs/keys against the test run row in
  PostgreSQL — **artifacts for all test cases, not just failures, must be
  available to the dashboard.**
- Emit `test.completed` for every test and `test.failed` specifically for
  failures (the Root Cause Agent subscribes only to the latter).

### 5.3 AI Root Cause Agent
**Trigger:** `test.failed` event only.

- **Failure Event Listener**: consumes the event; de-duplicates known-flaky
  tests (configurable flake threshold) from genuine regressions.
- **Log & Artifact Correlator**: pulls the failing test's screenshots, video,
  trace, console/network logs, and the originating
  `DeploymentIntelligenceReport` (commit diff context) into one correlated
  bundle.
- **Multimodal LLM Analysis Engine**: sends the correlated bundle (including
  the failure screenshot(s)) to the LLM Gateway using a dedicated prompt
  template designed for multimodal root-cause reasoning.
- **Insight Generator**: produces a strictly-typed `RootCauseInsight`:
  ```ts
type RootCauseInsight = {
  testId: string;
  failureSummary: string;   // 1-3 sentences, plain language
  rootCause: string;        // technical explanation
  suggestedFix: string;     // actionable, specific
  confidence: number;       // 0-1
  relatedCommit?: string;
  evidenceRefs: string[];   // artifact URLs used as evidence
};
  ```
- Persist the insight, link it to the test run, and emit `insight.generated`
  for notification/dashboard consumption.
- Feed the insight + embeddings back into the Vector KB to improve future
  root-cause accuracy (feedback loop) — never skip this step.

### 5.4 Data & Storage Layer
- **PostgreSQL**: source of truth for commits, builds, deployment
  intelligence reports, test runs/results, insights. Use migrations (e.g.,
  Prisma/Flyway/Alembic) — never hand-edit schema in production.
- **Object Storage (S3/MinIO)**: all binary artifacts. Store only references
  (URLs/keys) in Postgres.
- **Redis**: queues, caching, pub/sub, distributed locks.
- **Vector KB**: embeddings for code diffs, historical failures, and fixes,
  used to ground both AI agents with relevant historical context
  (retrieval-augmented generation).

### 5.5 Backend API & Orchestration
- Expose a versioned REST/GraphQL API (`/api/v1`) + WebSocket channel for
  real-time dashboard updates (test run status, new insights).
- AuthN/AuthZ via OIDC; enforce RBAC roles (`admin`, `operator`, `viewer`).
- Notification Service: on `insight.generated` or deployment risk above
  threshold, notify configured channels (Slack/Teams/Email/PagerDuty) with
  deep links into the dashboard.
- Workflow Orchestrator (Argo Workflows/Temporal) coordinates any
  multi-step, long-running flows (e.g., full regression run across
  environments) — do not build ad-hoc orchestration logic inside feature
  services.

### 5.6 Frontend — Separate UI Surfaces
Build these as **distinct routed applications/modules** (can share a design
system and shell, but must be independently navigable and independently
loadable) so each operations persona gets a focused surface:

1. **Monitoring Console** (`/monitoring`) — real-time pass/fail matrix,
   uptime/latency SLAs, global synthetic-check status, trend charts.
2. **Deployment Intelligence Console** (`/deployment-intelligence`) — commit
   timeline, diff viewer, risk score, affected flows, list of AI-generated
   tests per deployment.
3. **Root Cause Console** (`/root-cause`) — failed test list, failure
   summary/root cause/suggested fix cards, inline screenshot & video replay
   (trace viewer embed), confidence indicator, "mark as flaky" action.
4. **AI Copilot Chat** — a persistent, embeddable chat surface (available
   from all consoles) for natural-language querying over test history,
   deployments, and incidents.

UI/UX requirements:
- Modern, fast, AI-native visual language: dark-mode-first, glassmorphism or
  clean neo-dashboard aesthetic, purposeful color coding (risk = amber/red,
  healthy = green, AI-generated = purple/pink accents), motion used
  sparingly for state changes (test running → passed/failed).
- Use a component library + design tokens (see `frontend-design` guidance)
  — no default/unstyled component library visuals.
- Real-time updates via WebSocket/SSE — no manual refresh required.
- Video/screenshot viewers must support scrubbing, step-by-step
  screenshot timelines, and trace-viewer deep links.
- Fully responsive; keyboard accessible; WCAG 2.1 AA color contrast minimum.
- Framework: React + Next.js (or the repo's established frontend stack) with
  TypeScript strict mode.

### 5.7 Shared GenAI/LLM Layer
- **LLM Gateway**: single internal service/library that all AI agents call
  through — never call a model vendor SDK directly from a feature service.
  Must support provider abstraction (Claude, OpenAI, etc.), request/response
  logging (redacted), and per-caller rate limiting.
- **Prompt Template Registry**: versioned, testable prompt templates (treat
  prompts as code — code review + changelog required for changes).
- **Model Router & Cost Guard**: routes requests to the appropriate model
  tier by task complexity; enforces token/cost budgets; fails safe (returns
  a typed error, never silently degrades output quality without flagging).
- **Embedding Service**: generates embeddings for code diffs, logs, and
  failure artifacts for the Vector KB.

---

## 6. Suggested Repository Layout

```
/apps
  /web-monitoring-console
  /web-deployment-intelligence-console
  /web-root-cause-console
/services
  /deployment-intelligence-agent
  /playwright-execution-engine
  /root-cause-agent
  /llm-gateway
  /api-gateway
  /notification-service
  /workflow-orchestrator
/packages
  /shared-types          # event & DTO schemas (Zod), shared across services
  /ui-design-system
  /playwright-test-utils # Page Object Model base classes, fixtures
/infra
  /helm                  # one chart per service
  /k8s                   # base manifests / kustomize overlays
  /terraform             # cloud infra (EKS/GKE/AKS, RDS, S3, MSK/Kafka)
/.github
  copilot-instructions.md
  /workflows             # CI/CD pipelines
  /instructions          # path-scoped Copilot instruction files (optional)
```

Each `/services/*` and `/apps/*` folder must contain its own `README.md`,
`Dockerfile`, tests, and `Chart.yaml`/`values.yaml`.

---

## 7. Event & Data Contracts

Define all cross-service events and DTOs as versioned schemas in
`/packages/shared-types` (Zod for TypeScript, or an equivalent shared schema
package) and import them — never duplicate type definitions across services.

Minimum event types to implement:

```ts
"commit.pushed"        // { repo, branch, commitSha, previousCommitSha, pusher, timestamp }
"tests.generated"      // { deploymentIntelligenceReportId, specFiles: string[], riskScore }
"test.completed"       // { testRunId, testId, status, artifacts: {screenshots[], video, trace, har} }
"test.failed"          // subset of test.completed where status === "failed"
"insight.generated"    // RootCauseInsight (see 5.3)
```

All events must include `eventId`, `occurredAt`, `correlationId`, and
`orgId`/`projectId` envelope fields.

---

## 8. Coding Standards

- **Language/tooling**: TypeScript (strict mode) for all services and
  frontends unless a component explicitly requires another language (e.g., a
  Python service for ML/embeddings is acceptable — document why).
- **Style**: ESLint + Prettier enforced in CI; no merge on lint failure.
- **Error handling**: never swallow errors; use typed Result/Either patterns
  or explicit typed exceptions; all API errors return a consistent shape
  `{ error: { code, message, correlationId } }`.
- **Logging**: structured JSON via a shared logger package; include
  `correlationId`, `service`, `level`, `message`, `context`.
- **Testing**: colocate unit tests; integration tests under `__tests__` or
  `tests/integration`; Playwright tests for the platform's own UI live under
  `/apps/*/e2e`.
- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`...) — CI may
  use these for changelog generation.
- **Documentation**: every new service/module ships with a `README.md`
  covering purpose, local dev setup, env vars, and how it fits into Section 3.

---

## 9. Kubernetes & Deployment Conventions

- One Helm chart per service under `/infra/helm/<service>`, parameterized
  via `values.yaml` (replicas, resources, autoscaling, env).
- Every Deployment must define `resources.requests`/`limits`,
  `readinessProbe`, `livenessProbe`, and `securityContext`
  (`runAsNonRoot: true`).
- Use `HorizontalPodAutoscaler` for CPU/memory-bound services (e.g., API
  Gateway) and **KEDA `ScaledObject`** for queue-depth-bound services (e.g.,
  Playwright Runner Pods, scaling on Redis/Kafka queue length).
- Namespace-per-domain suggested: `ingress`, `deployment-intelligence`,
  `execution-engine`, `root-cause`, `data`, `api`, `frontend`.
- All secrets via `ExternalSecret` (External Secrets Operator) backed by
  Vault/cloud secret manager — never plain `Secret` manifests with inline
  values checked into git.
- GitOps: Argo CD watches `/infra/k8s` (or rendered Helm output) per
  environment overlay (`dev`, `staging`, `prod`).

---

## 10. CI/CD Pipeline Expectations

`.github/workflows/` should implement, per service that changed (use path
filters):

1. Lint → Unit test → Build → Container image build & scan (Trivy/Grype).
2. Push image to registry (tag with commit SHA).
3. Update the relevant Helm `values.yaml`/image tag (or let Argo CD Image
   Updater handle it) to trigger GitOps sync.
4. On `master` push specifically: ensure the webhook to the platform's own
   API Gateway fires `commit.pushed` (this is the platform monitoring
   itself, if used as a dogfood deployment, or a customer's repo webhook in
   production use).

---

## 11. Definition of Done (apply to every PR/agent task)

- [ ] Follows the architecture in Section 3 — no unapproved new components.
- [ ] Meets the non-functional checklist in Section 4.
- [ ] Uses shared types/events from `/packages/shared-types` — no duplicated
      contracts.
- [ ] Has unit + integration tests; CI green.
- [ ] Includes/updates Helm chart + resource limits + probes.
- [ ] No secrets, API keys, or credentials committed.
- [ ] Structured logging + tracing instrumented.
- [ ] LLM calls go through the LLM Gateway with a schema-validated response.
- [ ] UI changes match the design system and are responsive + accessible.
- [ ] README/docs updated for the affected module.

---

## 12. What NOT to Do

- Do not call LLM provider SDKs directly from a feature service.
- Do not have the Execution Engine or Root Cause Agent write to `master` or
  push code — they only generate test specs / insights via defined outputs.
- Do not introduce synchronous service-to-service HTTP chains where an event
  should be used instead.
- Do not store binary artifacts (screenshots/videos/traces) in PostgreSQL.
- Do not hardcode environment-specific values (URLs, credentials, cluster
  names) — always source from config/secret management.
- Do not skip artifact capture for passing tests — screenshots/videos are
  required for **all** test cases, not just failures.
