FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
COPY services/root-cause-agent/package*.json ./services/root-cause-agent/
COPY packages/shared-types/package*.json ./packages/shared-types/
RUN npm install
COPY . .
RUN npm run build --workspace @ai-synthetic/shared-types && npm run build --workspace @ai-synthetic/root-cause-agent
CMD ["node", "services/root-cause-agent/dist/index.js"]