# AI-powered-synthetic-monitor

A production-ready, cloud-native, AI-driven Playwright synthetic monitoring platform scaffold.

## Included modules

- Deployment Intelligence Agent: analyzes commit/build changes and produces deployment intelligence reports with generated Playwright spec targets.
- Playwright Execution Engine: executes generated specs and captures screenshots, video, traces, and HAR artifacts.
- Root Cause Agent: turns failures into structured root cause insights.
- Operations Web UI: a modern local dashboard shell for monitoring the platform.

## Local development

1. Install dependencies: `npm install`
2. Run tests: `npm test`
3. Build workspaces: `npm run build`
4. Start the local UI: `npm run dev:web`

## Architecture notes

The solution follows the requested modular architecture with shared schemas in `packages/shared-types`, service-specific agents under `services/*`, and a web UI in `apps/web-ui`.
