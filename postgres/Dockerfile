FROM postgres:16-alpine3.24@sha256:0cefaabd882e42bcb2a2f3dc56d3ce4770560ba62fd7f197f1a2e008fd5731ab

# Executable, so the official entrypoint runs it rather than sourcing it.
COPY --chmod=755 exporter-role.sh /docker-entrypoint-initdb.d/exporter-role.sh
