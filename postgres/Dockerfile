FROM postgres:16-alpine3.24@sha256:0cefaabd882e42bcb2a2f3dc56d3ce4770560ba62fd7f197f1a2e008fd5731ab

COPY --chmod=755 entrypoint.sh /usr/local/bin/entrypoint.sh
# Executable, so the official entrypoint runs it rather than sourcing it.
COPY --chmod=755 exporter-role.sh /docker-entrypoint-initdb.d/exporter-role.sh

# Setting ENTRYPOINT clears the CMD inherited from the base image.
ENTRYPOINT ["entrypoint.sh"]
CMD ["postgres"]
