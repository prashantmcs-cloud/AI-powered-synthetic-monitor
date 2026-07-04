FROM node:24-alpine AS builder
WORKDIR /app
COPY apps/web-ui/package*.json ./
RUN npm install
COPY apps/web-ui/ .
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=builder /app/dist /usr/share/nginx/html
COPY apps/web-ui/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]