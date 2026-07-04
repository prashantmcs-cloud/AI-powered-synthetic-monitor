.PHONY: build test run clean docker-up docker-down k8s-deploy

build:
	npm run build

test:
	npm test

run:
	docker-compose up -d

docker-up:
	docker-compose up -d postgres redis
	sleep 5
	docker-compose up -d api-gateway webhook-receiver web-ui

docker-down:
	docker-compose down

k8s-deploy:
	kubectl apply -f infra/k8s/secrets.yaml
	kubectl apply -f infra/k8s/postgres.yaml
	kubectl apply -f infra/k8s/redis.yaml
	kubectl wait --for=condition=ready pod -l app=postgres --timeout=60s
	kubectl wait --for=condition=ready pod -l app=redis --timeout=60s
	kubectl apply -f infra/k8s/api-gateway.yaml
	kubectl apply -f infra/k8s/web-ui.yaml
	kubectl apply -f infra/k8s/deployment-intelligence.yaml

k8s-clean:
	kubectl delete -f infra/k8s/ --ignore-not-found=true

docker-build:
	docker build -t ai-synthetic/app:latest .
	docker build -t ai-synthetic/web-ui:latest -f apps/web-ui/Dockerfile .

dev:
	npm run dev:webhook & npm run dev:api & npm run dev:ui

clean:
	rm -rf **/dist node_modules package-lock.json

format:
	npx prettier --write "**/*.{ts,tsx,js,jsx,json,md}"

lint:
	npx eslint "**/*.{ts,tsx}" --fix