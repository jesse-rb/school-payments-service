.PHONY: dev-frontend dev-backend

dev-frontend:
	cd ./react-spa/ && npm run dev

dev-backend:
	docker-compose up db -d
	cd ./python-api/ && uv run fastapi dev
