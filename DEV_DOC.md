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

The app will then be accessible through `https://localhost:8443` (`http://localhost:8080` redirects there).

In production, secrets come from Vault, which starts sealed every time its container restarts. On first run, `make prod` initializes and unseals it automatically. On every later start:

1. run `make prod`. It stops with `vault-init` failing, because Vault is sealed.
2. run `./unseal_vault.sh`, and enter 3 of the 5 unseal keys when prompted.
3. run `make prod` again.

## Secrets handling

Several secrets are required for MagicDle to run :

+ Postgres DB root password
+ JWT Signing key for auth
+ Grafana admin password

These secrets are generated at first run and put into vault through the `vault-init/main.ts` script. The root token and unseal keys (required for Vault handling) are then written in the `vault-init-data/vault-keys.json` file. This file needs to be read by the operators (and only them), its content saved for later use, then immediately deleted.

The postgres password and JWT key should not be needed by operators.
On the other hand, the Grafana password needs to be known by admins in order to access the monitoring dashboard. To get the grafana admin password that was generated, run :

`docker exec -e VAULT_TOKEN=<root token> vault vault kv get -field=GRAFANA_PASSWORD secret/grafana/config`

### Limitations

The secrets are only generated at startup by init scripts.
Any credential change inside Vault will not update the corresponding service, and the other way around is also true : changing grafana admin password will not update the secret inside Vault. Both need to be done in order to keep Vault's data up to date.

## Monitoring

Grafana is available at `http://localhost:3000`.

1. Log in with the credentials from the `.env` file (`GRAFANA_USER` / `GRAFANA_PASSWORD`).
2. Click `Dashboards` in the left menu.
3. Two dashboards are available: `Server` and `Game`.

### What you can see

- **Server**: HTTP traffic (requests per second by status, latency p50/p95/p99, successful and failed logins, slowest routes) and backend runtime (memory, CPU, event loop lag).
- **Game**: game and card statistics read from the database.

### Notes

- Panels based on HTTP traffic stay at "No data" until some requests have been made. Wait ~15-30 s after sending requests (Prometheus scrape interval).
- The failed-login counter resets to 0 whenever the backend restarts.
- Panels related to `gameSessions` stay empty for now, because the matching game features are not implemented yet.