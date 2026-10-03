# Skeleton for future use.
# to avoid the app stealing the shell,
# this makefile should be used only after
# the app is fully containerized.

NAME=transcendence

.PHONY: all
all: .env
	docker compose up -d

.PHONY: restart
restart:
	docker compose restart

.PHONY: reset
reset: down
	rm .env

down:
	docker compose down -v

.PHONY: env
env: down
	./make_env.sh

# Internal. Should not be used.
# Used only on first startup to automatically create the env file.
# If you messed up your .env, use `make env` instead.

.env:
	./make_env.sh
