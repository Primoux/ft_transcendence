# Skeleton for future use.
# to avoid the app stealing the shell,
# this makefile should be used only after
# the app is fully containerized.

NAME=transcendence

.DEFAULT_GOAL=deploy


.PHONY: deploy
deploy: .env seed
	docker compose up -d

.PHONY: seed
seed:
	docker compose run --rm card-updater

.PHONY: restart
restart:
	docker compose restart

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

.PHONY: status
status:
	docker compose ps

.PHONY: logs
logs:
	docker compose logs -f

.env:
	./make_env.sh
