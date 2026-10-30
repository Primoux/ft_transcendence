# Skeleton for future use.
# to avoid the app stealing the shell,
# this makefile should be used only after
# the app is fully containerized.

NAME=transcendence
COMPOSE = docker compose

COMPOSE_FILE = compose.yml
COMPOSE_DEV_FILE = compose.dev.yml

.DEFAULT_GOAL := help

help:
	@echo "Usage: make [target]"
	@echo "Targets:"
	@echo "  ingest   - Run the card ingestion pipeline"
	@echo "  dev	  - Build and start the application in dev mode (with hot reload)"
	@echo "  prod	  - Build and start the application in production mode"
	@echo "  ci       - Run the CI checks (lint + build) locally"
	@echo "  restart  - Restart the application"
	@echo "  down     - Stop the application and remove volumes"
	@echo "  logs     - Show application logs"
	@echo "  reset    - Stop the application and delete .env"
	@echo "  env      - Regenerate .env file"


.PHONY: ingest
ingest:
	docker compose run --rm card-ingestion

# Runs the same checks as .github/workflows/ci.yml, in the containers.
# Each check list lives in its own package.json, so both run the same thing.
# `--entrypoint sh` on backend skips entrypoint.sh, which would need the database.
.PHONY: ci
ci: .env
	$(COMPOSE) -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) run --rm --no-deps frontend npm run check
	$(COMPOSE) -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) run --rm --no-deps --entrypoint sh backend -c 'npm run check'


.PHONY: dev
dev: .env
	$(COMPOSE) -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) up --watch --build

.PHONY: prod
prod: .env
	$(COMPOSE) -f $(COMPOSE_FILE) up -d --build

# Convenience rule : runs docker compose with the arg provided to make.
# Exemple : 'make logs' -> 'docker compose logs'

.PHONY: ps logs restart
ps logs restart: %:
	$(COMPOSE) $*


.PHONY: down
down:
	$(COMPOSE) down -v

.PHONY: reset
reset: down
	rm -rf .env
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
