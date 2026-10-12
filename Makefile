# Skeleton for future use.
# to avoid the app stealing the shell,
# this makefile should be used only after
# the app is fully containerized.

NAME=transcendence

DEFAULT_GOAL := help

help:
	@echo "Usage: make [target]"
	@echo "Targets:"
	@echo "  all      - Build and start the application"
	@echo "  restart  - Restart the application"
	@echo "  down     - Stop the application and remove volumes"
	@echo "  up       - Start the application"
	@echo "  logs     - Show application logs"
	@echo "  reset    - Stop the application and delete .env"
	@echo "  env      - Regenerate .env file"
	@echo "  .env     - Generate .env file"

.PHONY: all
all: .env
	docker compose up -d

.PHONY: restart
restart:
	docker compose restart

.PHONY: up
up:
	docker compose up -d

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

# Internal. Should not be used.
# Used only on first startup to automatically create the env file.
# If you messed up your .env, use `make env` instead.
.PHONY: npm_install
npm_install:
	cd frontend && npm install
	cd backend && npm install

.env:
	./make_env.sh
