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

The Makefile does not work yet.

1. populate the following values in `.env`. They can be anything as long as they stay the same. (in case of a problem, `docker compose down -v` will propably do the trick and also **erase all the users you may have created**.)
     + DB_USER
     + DB_PASSWORD
     + DB_NAME
2. populate the values in `backend/.env` as the ones in `backend/.env.example`.
3. run `docker compose up -d` to start the db.
4. `cd backend/ && npm install && npm run dev`
5. `cd ../frontend && npm install && npm run dev`

There is only a login form for now and no registering, so open a terminal and run this to create a user :

```
curl -i -X POST http://localhost:5003/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","displayName":"enzo le + rigolo","password":"admin"}'
```

Some error cases will be printed on the frontend, for others look the Network tab of your browser's dev tools.
