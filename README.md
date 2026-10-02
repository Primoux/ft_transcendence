# ft_transcendence

## Presentation

For now : a small GameDLe-like game.
Will be upgraded into a full Dle-game maker if time allows it.

## Tech Stack

**Backend** : Node.js environment with the Express.js framework, PostreSQL database, Prisma ORM

**Frontend** : React + Vite

**Reverse proxy** : nginx (not yet added)

With time, the whole app will be containerized with Docker and Docker-compose. For now, only the db runs containerized.

## Usage

You can just run `make`.
a .env file will be created with random values, then every service will be launched.

If you rather use custom values, follow the `.env.example` file.

1. populate the values in `backend/.env` as the ones in `backend/.env.example`.
2. run `docker compose up -d` to start the backend, frontend, and db.

There is only a login form for now and no registering, so open a terminal and run this to create a user :

```
curl -i -X POST http://localhost:5003/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","displayName":"enzo le + rigolo","password":"admin123456"}'
```