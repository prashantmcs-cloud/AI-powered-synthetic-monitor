FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/web-ui/package*.json ./apps/web-ui/
RUN npm install
COPY . .
CMD ["node", "apps/web-ui/server.mjs"]