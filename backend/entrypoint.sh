#!/bin/sh

set -e
npx prisma migrate deploy
if [ "$NODE_ENV" = "prod" ]; then
  node src/scripts/seed/seed.js
else
  npx prisma db seed
fi
exec "$@"
