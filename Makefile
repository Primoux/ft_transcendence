# Skeleton for future use.
# to avoid the app stealing the shell,
# this makefile should be used only after
# the app is fully containerized.

NAME=transcendence

.PHONY: all
all: 
	docker compose up -d

.env: 
	./make_env.sh