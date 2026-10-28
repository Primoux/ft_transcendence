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
2. run `make prisma`. This will create migrations inside the container, and re-generate the prisma client to reflect the changes inside your editor.

**warning** : if you change the prisma schema, and rebuild the containers without creating the migrations first, the prisma client running inside the container will not be in sync with the actual SQL tables. This could lead to issues at runtime.

## Running a prod build

To see the state of the app in production, run `make prod`. This will :

+ Compile the `.ts` files into javascript in `dist/` folders in both backend and frontend containers
+ Run the backend with `node` instead of `tsx`
+ Run an nginx container serving the compiled static files.

The app will then be accessible through `http://localhost:80`.