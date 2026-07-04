FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
COPY services/deployment-intelligence-agent/package*.json ./services/deployment-intelligence-agent/
COPY packages/shared-types/package*.json ./packages/shared-types/
RUN npm install
COPY . .
RUN npm run build --workspace @ai-synthetic/shared-types && npm run build --workspace @ai-synthetic/deployment-intelligence-agent
CMD ["node", "services/deployment-intelligence-agent/dist/index.js"]