#!/bin/sh
# Read as root: the official entrypoint switches to the postgres user, which loses group 1000,
# before running the init scripts. Kept in the environment like POSTGRES_PASSWORD_FILE's value.
if [ -r /exporter-secrets/password ]; then
    export EXPORTER_PASSWORD="$(cat /exporter-secrets/password)"
fi
exec docker-entrypoint.sh "$@"
