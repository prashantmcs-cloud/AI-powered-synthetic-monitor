FROM node:24-alpine AS base
WORKDIR /app

FROM base AS builder
COPY package*.json ./
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY packages/database/package*.json ./packages/database/
COPY packages/message-queue/package*.json ./packages/message-queue/
COPY services/deployment-intelligence-agent/package*.json ./services/deployment-intelligence-agent/
COPY services/playwright-execution-engine/package*.json ./services/playwright-execution-engine/
COPY services/root-cause-agent/package*.json ./services/root-cause-agent/
COPY services/webhook-receiver/package*.json ./services/webhook-receiver/
COPY services/api-gateway/package*.json ./services/api-gateway/
RUN npm install

COPY packages/shared-types/ ./packages/shared-types/
COPY packages/database/ ./packages/database/
COPY packages/message-queue/ ./packages/message-queue/
COPY services/ ./services/

RUN npm run build --workspace @ai-synthetic/shared-types && \
    npm run build --workspace @ai-synthetic/database && \
    npm run build --workspace @ai-synthetic/message-queue && \
    npm run build --workspace @ai-synthetic/deployment-intelligence-agent && \
    npm run build --workspace @ai-synthetic/playwright-execution-engine && \
    npm run build --workspace @ai-synthetic/root-cause-agent && \
    npm run build --workspace @ai-synthetic/webhook-receiver && \
    npm run build --workspace @ai-synthetic/api-gateway

FROM base AS runtime
RUN apk add --no-cache dumb-init
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services ./services

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=postgresql://postgres:postgres@postgres:5432/ai_synthetic
ENV REDIS_URL=redis://redis:6379

CMD ["dumb-init", "node", "services/api-gateway/dist/index.js"]