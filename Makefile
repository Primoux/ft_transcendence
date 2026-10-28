# Skeleton for future use.
# to avoid the app stealing the shell,
# this makefile should be used only after
# the app is fully containerized.

NAME = transcendence
COMPOSE = docker compose

COMPOSE_FILE = compose.yml
COMPOSE_DEV_FILE = compose.dev.yml

.DEFAULT_GOAL=deploy

help:
	@echo "Usage: make [target]"
	@echo "Targets:"
	@echo "  ingest   - Run the card ingestion pipeline"
	@echo "  dev	  - Build and start the application in dev mode (with hot reload)"
	@echo "  prod	  - Build and start the application in production mode"
	@echo "  ingest   - Run the card ingestion pipeline"
	@echo "  ci       - Run the CI checks (lint + build) locally"
	@echo "  restart  - Restart the application"
	@echo "  down     - Stop the application and remove volumes"
	@echo "  logs     - Show application logs"
	@echo "  reset    - Stop the application and delete .env"
	@echo "  env      - Regenerate .env file"

.PHONY: deploy
deploy: .env seed
	$(MAKE) prod

.PHONY: prod
prod: .env
	$(COMPOSE) -f $(COMPOSE_FILE) up -d --build

.PHONY: dev
dev: .env
	$(COMPOSE) -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) up -d --build

.PHONY: ingest
ingest:
	docker compose run --rm card-ingestion

# Runs the same checks as .github/workflows/ci.yml, in the containers.
# Each check list lives in its own package.json, so both run the same thing.
# `--entrypoint sh` on backend skips entrypoint.sh, which would need the database.
.PHONY: ci
ci: .env
	$(COMPOSE) run --rm --no-deps frontend npm run check
	$(COMPOSE) run --rm --no-deps --entrypoint sh backend -c 'npm run check'

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
.PHONY: all
all: .env ingest
	$(MAKE) prod

.PHONY: ingest
ingest:
	docker compose run --rm card-ingestion

<<<<<<< HEAD
.PHONY: restart
restart:
	docker compose restart

.PHONY: reset
reset: down
	rm .env
=======
# Runs the same checks as .github/workflows/ci.yml, in the containers.
# Each check list lives in its own package.json, so both run the same thing.
# `--entrypoint sh` on backend skips entrypoint.sh, which would need the database.
.PHONY: ci
ci: .env
	$(COMPOSE) run --rm --no-deps frontend npm run check
	$(COMPOSE) run --rm --no-deps --entrypoint sh backend -c 'npm run check'


.PHONY: up
up: 
	@echo "please use 'make dev' or 'make prod'."

.PHONY: dev
dev: .env
	$(COMPOSE) -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) up -d --build

.PHONY: prod
prod: .env
	$(COMPOSE) -f $(COMPOSE_FILE) up -d --build

# Convenience rule : runs docker compose with the arg provided to make.
# Exemple : 'make logs' -> 'docker compose logs'

.PHONY: ps logs restart
ps logs restart: %:
	$(COMPOSE) $*

>>>>>>> 627c523 (refactor: add prod build and overhaul dev workflow)

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
	cd frontend && npm ci
	cd backend && npm ci

# Internal. Should not be used.
# Used only on first startup to automatically create the env file.
# If you messed up your .env, use `make env` instead.
.env:
	./make_env.sh