.PHONY: docker-db-up docker-db-down docker-db-destroy atlas-schema-apply atlas-migrate-apply dev-frontend dev-backend adminer-up adminer-down

include .env

docker-db-up:
	docker-compose up db -d

docker-db-down:
	docker-compose down db

docker-db-destroy:
	docker-compose down db -v

# atlas-schema-apply:
# 	atlas schema apply -c file://atlas.hcl --env local
atlas-migrate-new:
	atlas migrate new

atlas-migrate-hash:
	atlas migrate hash

atlas-migrate-apply:
	atlas migrate apply -c file://atlas.hcl --env local

dev-frontend:
	cd ./react-spa/ && npm run dev

dev-backend: docker-db-up
	cd ./python-api/ && uv run fastapi dev

adminer-up:
	docker run -d --rm -p 8081:8080 --name=adminer-tmp adminer

adminer-down:
	docker stop adminer-tmp
