# Skeleton for future use.
# to avoid the app stealing the shell,
# this makefile should be used only after
# the app is fully containerized.

NAME=transcendence

.PHONY: all
all: backend frontend

.PHONY: db
db:
	docker compose up -d

.PHONY: backend
backend:
	@echo "Starting backend"

.PHONY: frontend
frontend:
	@echo "Starting frontend"