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
	@echo "  down     - Stop the application"
	@echo "  up       - Start the application"
	@echo "  logs     - Show application logs"
	@echo "  .env     - Generate .env file"

.PHONY: all
all: .env
	docker compose up -d

restart: down up

down:
	docker compose down

up:
	docker compose up -d

logs:
	docker compose logs -f

.env:
	./make_env.sh
