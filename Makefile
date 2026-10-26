# Skeleton for future use.
# to avoid the app stealing the shell,
# this makefile should be used only after
# the app is fully containerized.

NAME=transcendence

DEFAULT_GOAL := help

PRISMA_SCHEMA=backend/prisma/schema.prisma
PRISMA_CLIENT=backend/node_modules/.prisma/client/index.js

help:
	@echo "Usage: make [target]"
	@echo "Targets:"
	@echo "  all      - Build and start the application"
	@echo "  ingest   - Run the card ingestion pipeline"
	@echo "  ci       - Run the CI checks (lint + build) locally"
	@echo "  restart  - Restart the application"
	@echo "  down     - Stop the application and remove volumes"
	@echo "  up       - Start the application"
	@echo "  logs     - Show application logs"
	@echo "  reset    - Stop the application and delete .env"
	@echo "  env      - Regenerate .env file"
	@echo "  .env     - Generate .env file"
	@echo "  prisma   - Generate Prisma client"

.PHONY: all
all: .env ingest
	docker compose up -d

.PHONY: ingest
ingest:
	docker compose run --rm card-ingestion

# Runs the same checks as .github/workflows/ci.yml, in the containers.
# Each check list lives in its own package.json, so both run the same thing.
# Deps come from the images: after changing a package.json, docker compose build.
# `--entrypoint sh` on backend skips entrypoint.sh, which would need the database.
.PHONY: ci
ci: .env
	docker compose run --rm --no-deps frontend npm run check
	docker compose run --rm --no-deps --entrypoint sh backend -c 'npm run check'

.PHONY: restart
restart:
	docker compose restart

.PHONY: prisma
prisma: $(PRISMA_CLIENT)
$(PRISMA_CLIENT): $(PRISMA_SCHEMA)
	cd backend && npx prisma generate

.PHONY: up
up:
	docker compose up -d

.PHONY: ps
ps:
	docker compose ps

.PHONY: logs
logs:
	docker compose logs -f

.PHONY: reset
reset: down
	rm .env

.PHONY: down
down:
	docker compose down -v

.PHONY: env
env: down
	./make_env.sh

.PHONY: npm_install
npm_install:
	cd frontend && npm install
	cd backend && npm install

# Internal. Should not be used.
# Used only on first startup to automatically create the env file.
# If you messed up your .env, use `make env` instead.
.env:
	./make_env.sh
