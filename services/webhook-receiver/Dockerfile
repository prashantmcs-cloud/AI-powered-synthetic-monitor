FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
COPY services/webhook-receiver/package*.json ./services/webhook-receiver/
COPY packages/shared-types/package*.json ./packages/shared-types/
RUN npm install
COPY . .
RUN npm run build --workspace @ai-synthetic/shared-types && npm run build --workspace @ai-synthetic/webhook-receiver
CMD ["node", "services/webhook-receiver/dist/index.js"]