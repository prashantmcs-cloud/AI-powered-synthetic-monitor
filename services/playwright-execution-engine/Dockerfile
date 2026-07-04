FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
COPY services/playwright-execution-engine/package*.json ./services/playwright-execution-engine/
COPY packages/shared-types/package*.json ./packages/shared-types/
RUN npm install
COPY . .
RUN npm run build --workspace @ai-synthetic/shared-types && npm run build --workspace @ai-synthetic/playwright-execution-engine
CMD ["node", "services/playwright-execution-engine/dist/index.js"]