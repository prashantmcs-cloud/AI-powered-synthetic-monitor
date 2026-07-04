FROM node:24-alpine AS base
WORKDIR /app

FROM base AS runner
COPY --from=ai-synthetic/base:latest /app/node_modules ./node_modules
COPY --from=ai-synthetic/base:latest /app/packages ./packages
COPY --from=ai-synthetic/base:latest /app/services ./services

CMD ["node", "services/api-gateway/dist/index.js"]