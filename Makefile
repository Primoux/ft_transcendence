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
	@echo "  down     - Stop the application and remove volumes (the dev database is kept)"
	@echo "  down-dev - Stop the application and remove the dev database"
	@echo "  logs     - Show application logs"
	@echo "  reset    - Stop the application and delete .env"
	@echo "  env      - Regenerate .env file"
	@echo "  certs    - Create the self-signed HTTPS certificate if missing (done by prod)"
	@echo "  prisma   - Create a migration from schema.prisma and regenerate the Prisma client"


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
prod: .env certs
	$(COMPOSE) -f $(COMPOSE_FILE) up -d --build

# Self-signed certificate for the prod frontend, created only when missing: browsers warn about it once.
# The key is readable by all, as nginx reads it as its own user (uid 101) from the bind mount.
.PHONY: certs
certs: certs/cert.pem
certs/cert.pem:
	mkdir -p certs
	openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
		-keyout certs/key.pem -out certs/cert.pem \
		-subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
	chmod 644 certs/key.pem

# Convenience rule : runs docker compose with the arg provided to make.
# Exemple : 'make logs' -> 'docker compose logs'

.PHONY: ps logs restart
ps logs restart: %:
	$(COMPOSE) $*


.PHONY: down
down:
	$(COMPOSE) down -v

# Only the dev database is removed: `down -v` with the dev file would also take prod's volumes.
.PHONY: down-dev
down-dev:
	$(COMPOSE) -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) down
	docker volume rm -f transcendance_postgres_dev_data

.PHONY: reset
reset: down
	rm -rf .env
.PHONY: env
env: down
	./make_env.sh

# Runs on the host, against the dev database published on localhost:5432: prisma needs
# a live database to diff the schema against, so the postgres container is started first.
.PHONY: prisma
prisma: .env
	$(COMPOSE) -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) up -d --wait postgres
	cd backend && npx prisma migrate dev && npx prisma generate

.PHONY: npm_install
npm_install:
	cd frontend && npm install
	cd backend && npm install

# Internal. Should not be used.
# Used only on first startup to automatically create the env file.
# If you messed up your .env, use `make env` instead.
.env:
	./make_env.sh
