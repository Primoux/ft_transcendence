#!/bin/sh
# Creates the read-only role the Postgres exporter logs in with.
# Runs only when the database is first created: a new EXPORTER_PASSWORD needs a fresh volume (`make down`).
set -eu

if [ -z "${EXPORTER_PASSWORD:-}" ]; then
    echo "exporter-role.sh: EXPORTER_PASSWORD is not set (run make env): skipping the postgres_exporter role."
    exit 0
fi

# \getenv keeps the password out of psql's command line.
# pg_monitor only grants read access to the statistics views: no access to the app's tables.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'EOSQL'
\getenv exporter_password EXPORTER_PASSWORD
CREATE ROLE postgres_exporter WITH LOGIN PASSWORD :'exporter_password';
GRANT pg_monitor TO postgres_exporter;
EOSQL
