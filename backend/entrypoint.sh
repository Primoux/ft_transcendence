#!/bin/sh

set -e
# Rendered by Vault Agent in production. Dev gets its variables from .env instead.
if [ -n "$SECRETS_FILE" ]; then
    . "$SECRETS_FILE"
fi
npx prisma migrate deploy
exec "$@"
