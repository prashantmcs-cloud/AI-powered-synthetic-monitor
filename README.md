# AI-Powered Synthetic Monitor

A production-ready, cloud-native, AI-driven Playwright synthetic monitoring platform that automatically generates and executes tests on every deployment.

## Architecture

```
┌─────────────────────┐    ┌──────────────────────────┐    ┌──────────────────────────┐
│   GitHub Webhook    │───▶│  Deployment Intelligence │───▶│  Playwright Execution    │
│   (master commits)  │    │        Agent             │    │        Engine            │
└─────────────────────┘    └──────────────────────────┘    └──────────────────────────┘
                                   │                              │
                                   ▼                              ▼
                       ┌──────────────────────────┐    ┌──────────────────────────┐
                       │  Database (PostgreSQL)   │    │  Message Queue (Redis)   │
                       └──────────────────────────┘    └──────────────────────────┘
                                   │                              │
                                   ▼                              ▼
                       ┌──────────────────────────┐    ┌──────────────────────────┐
                       │  Root Cause Agent        │◀───│  Worker Service          │
                       └──────────────────────────┘    └──────────────────────────┘
                                   │
                                   ▼
                       ┌──────────────────────────┐
                       │    Web UI (React)        │
                       └──────────────────────────┘
```

## Modules

### Deployment Intelligence Agent
- Compares latest commit vs previous commit on master branch
- Analyzes file changes to identify affected flows
- Generates Playwright test specs using AI logic
- Calculates risk scores based on change impact

### Playwright Execution Engine
- Executes generated test specs in real browsers
- Captures screenshots, videos, traces, and HAR files
- Reports test status and artifacts to database

### Root Cause Agent
- Analyzes failed test executions
- Provides actionable insights with confidence scores
- Links failures to specific commits

### API Gateway
- REST API for dashboard queries
- WebSocket for real-time updates
- CORS support for cross-origin requests

### Web UI
- Modern React dashboard with Radix UI
- Real-time monitoring via WebSockets
- Separate tabs for deployments, executions, artifacts, and root cause

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Start services (requires PostgreSQL and Redis)
npm run dev:webhook

npm run dev:api
npm run dev:ui
```

### Docker Compose

```bash
docker-compose up -d
```

### Kubernetes

```bash
# Apply database and redis
kubectl apply -f infra/k8s/postgres.yaml
kubectl apply -f infra/k8s/redis.yaml

# Apply application services
kubectl apply -f infra/k8s/

# Or use Helm
helm install ai-synthetic-monitor ./infra/helm
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GITHUB_TOKEN` | GitHub API token | - |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/ai_synthetic` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `PORT` | Server port | `8080` |
| `PLAYWRIGHT_HEADLESS` | Run browsers headless | `true` |

## API Endpoints

- `GET /api/reports` - List deployment reports
- `GET /api/reports/:id` - Get test runs for a report
- `GET /api/test-runs/:id/artifacts` - Get artifacts for a test run
- `GET /api/test-runs/:id/root-cause` - Get root cause analysis
- `POST /api/trigger-test` - Manually trigger test execution
- `GET /health` - Health check endpoint

## Directory Structure

```
├── packages/
│   ├── shared-types/     # Zod schemas and types
│   ├── database/         # PostgreSQL repository
│   ├── message-queue/    # Redis-based message queue
│   └── config/          # Platform configuration
├── services/
│   ├── api-gateway/      # REST API + WebSocket
│   ├── webhook-receiver/ # GitHub webhook handler
│   ├── deployment-intelligence-agent/  # AI test generator
│   ├── playwright-execution-engine/    # Browser automation
│   ├── root-cause-agent/             # Failure analyzer
│   └── worker/                       # Async test processor
└── apps/
    └── web-ui/          # React dashboard
```