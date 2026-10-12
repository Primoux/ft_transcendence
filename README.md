*This project has been created as part of the 42 curriculum by alpayet, cviel, enchevri, kbarru, mlouis.*

# ft_transcendence

## Description

For now : a small GameDLe-like game.
Will be upgraded into a full Dle-game maker if time allows it.

## Tech Stack

**Backend** : Node.js environment with the Express.js framework, PostreSQL database, Prisma ORM

**Frontend** : React + Vite for dev. In production, nginx will be used as reverse proxy.

With time, the whole app will be containerized with Docker and Docker-compose. For now, only the db runs containerized.

## Instructions

## Prerequisites :

+ NodeJS 24+
+ npm 11+
+ A UNIX-like environment with recent versions of `sh` and `make` installed
+ openSSL 3.6 (for generating env variables)

## Starting

Clone the project, then run `make`.
a .env file will be created with random values, then every service will be launched.

If you rather use custom values, create and populate a `.env` file at the root of the repo,
using the `.env.example` file as reference, then run `docker compose up -d` to start the backend, frontend, and db.

## Resources

+ [ExpressJS docs](https://expressjs.com/en/5x/starter/hello-world/)
+ [Prisma docs](https://www.prisma.io/docs/v7/prisma-orm/quickstart/prisma-postgres)
+ [Backend Full Course | NodeJS ExpressJS PostgreSQL Prisma & Dockee](https://www.youtube.com/watch?v=9BD9eK9VqXA&t=11807s)

### AI Usage

Artificial intelligence was used at lengths to provide explanations on key concepts in web development such as **async programming**
It was a great help to have a artificial mentor for transitionning from C/C++ programming into designing a full-stack web application.
As helpful as it was in teching concepts and warning of common pitfalls, AI was instructed to not provide heavy code snippets.