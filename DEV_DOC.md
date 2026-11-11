# MagicDle developer documentation

This documentation explains the current developer workflow to make edits to MagicDle code.

## Prerequisites

+ NodeJS 24+
+ npm 11+
+ A UNIX-like environment with recent versions of `sh` and `make` installed
+ openSSL 3.6 (for generating env variables)

## First flight

If you just cloned the repository and want to see the current state of the project :

run `make dev`.
This will
+ create an environment file for you with random values
+ launch the development environment (vite dev server with hot reload + `tsx watch` for backend)

the app will be accessible through `http://localhost:5173`

## Pulling updates

after running `git pull`, run `npx prisma generate` locally to update your local prisma client.
Containers do not need it as the prisma client is generated during each build, but this will allow your editor to get the new types.

## Editing code

Any changes in the backend or frontend's `src/` folders will be synced to their corresponding dev containers if they're running.
Any new package installed (editing `package.json` or `package-lock.json`) either in frontend or backend will rebuild the corresponding dev containers to reflect the new packages.

### Installing packages

All `npm install` commands should be ran *inside your host environment*, **not in any of the containers**. The `watch` compose rules specified in `compose.dev.yml` will keep any containers in sync with your local packages.

### Editing prisma schema

If changes are made to the `backend/prisma/schema.prisma` file, they will not be taken into account by the running containers until a migration is created.
Once the migrations are created, the backend container will automatically rebuild to apply them with `prisma migrate deploy`.

Here are the steps for any edit to the prisma schema :

1. save the new `schema.prisma` file.
2. run `make prisma`. This will start the dev database if needed, then from your host ask for a migration name, create the migration and apply it to the dev database, and re-generate the prisma client to reflect the changes inside your editor.

**warning** : if you change the prisma schema, and rebuild the containers without creating the migrations first, the prisma client running inside the container will not be in sync with the actual SQL tables. This could lead to issues at runtime.

## Running a prod build

To see the state of the app in production, run `make prod`. This will :

+ Compile the `.ts` files into javascript in `dist/` folders in both backend and frontend containers
+ Run the backend with `node` instead of `tsx`
+ Run an nginx container serving the compiled static files.

The app will then be accessible through `https://localhost:8443`.

The certificate is self-signed, created in `certs/` by `make prod` when missing (or by `make certs`). Your browser will warn about it once: accept it to continue.

## Secrets handling

All secrets live in the `.env` file at the root of the repo, generated on first run by `make_env.sh` (or regenerated with `make env`):

+ `DB_PASSWORD`: Postgres password of the app's user
+ `EXPORTER_PASSWORD`: password of the read-only role the Postgres exporter uses
+ `GRAFANA_PASSWORD`: Grafana admin password, needed to log into the monitoring dashboard

`.env` is git-ignored and only readable by you. Never commit it.

### Limitations

Postgres only reads `DB_PASSWORD` and `EXPORTER_PASSWORD` when its volume is first created. After changing them in `.env`, reset the database with `make down` (prod) or `make down-dev` (dev) for them to apply.
Grafana likewise keeps the admin password it was first started with: changing `GRAFANA_PASSWORD` afterwards needs a reset of its volume, or a password change from Grafana's own UI.

## Monitoring

Grafana is available at `http://localhost:3000`.

1. Log in with `GRAFANA_USER` from the `.env` file, and the password:
   + in dev: `GRAFANA_PASSWORD` from the `.env` file.
   + in prod: the one stored in Vault (see [Secrets handling](#secrets-handling)).
2. Click `Dashboards` in the left menu.
3. Three dashboards are available: `MtgDle - Server`, `MtgDle - Game` and `PostgreSQL Database`.

If you can't log in after switching between dev and prod, the `grafana_data` volume still holds the other mode's password (it is only set when the volume is created).

### What you can see

- **Server**: HTTP traffic (requests per second by status, latency p50/p95/p99, successful and failed logins, slowest routes) and backend runtime (memory, CPU, event loop lag).
- **Game**: game and card statistics read from the database.

### Notes

- Panels based on HTTP traffic stay at "No data" until some requests have been made. Wait ~15-30 s after sending requests (Prometheus scrape interval).
- The failed-login counter resets to 0 whenever the backend restarts.
- Panels built on `http_requests_total` miss the first request of each `{route,status}` pair: a labelled series only appears on its first increment, and `rate()`/`increase()` need an earlier sample. Counts are approximate anyway, `increase()` extrapolates over the window edges.
- Panels related to `gameSessions` stay empty for now, because the matching game features are not implemented yet.

## Alerting

Grafana checks the rules below every minute and notifies a Discord channel. Everything lives in `grafana/provisioning/alerting/` (`rules.yml`, `policies.yml`, `contactpoints.yml`, `templates.yml`): edit those files, not the UI, then restart Grafana.

| Rule | Fires when | Severity |
|---|---|---|
| Backend down | backend unreachable for 1 min | critical |
| Too many 5xx errors | > 5% of requests in 5xx for 5 min (above 0.1 req/s) | critical |
| 5xx error burst | > 10 server errors in 5 min | critical |
| High p95 latency | p95 > 1 s for 5 min | warning |
| Event loop saturated | lag > 500 ms for 2 min | warning |
| Backend memory high | > 512 MiB for 10 min | warning |
| Too many failed logins | > 20 in 5 min | warning |
| Stale Scryfall Sync | last sync > 48 h ago | warning |
| Postgres unreachable | Postgres or its exporter down for 1 min | critical |
| Postgres connections near limit | > 80% of `max_connections` for 5 min | warning |
| Postgres deadlocks | any in 10 min | warning |

`critical` alerts repeat every hour, `warning` every 4 h. New rules need a `severity` label.

### Discord webhook

Optional: without it, alerts are evaluated but not sent. Create one in the channel settings (`Integrations` > `Webhooks`) and treat its URL as a secret.

Add `DISCORD_WEBHOOK_URL=...` to `.env` (dev and prod alike), then `docker compose up -d grafana`, and check with `Alerting` > `Contact points` > `discord` > `Test`.

**warning** : a mistake in any alerting file stops Grafana entirely. Find it with `docker compose logs grafana | grep 'Failed to provision'`.
