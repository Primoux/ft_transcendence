FROM node:24.19-alpine3.24@sha256:d32cdf619f63fe0471182d08996dd516c6275bb5fd31ae06e55a570bd9e1ad43 AS base

WORKDIR /app

COPY package.json package-lock.json .

RUN npm ci

COPY . .

RUN npx prisma generate
RUN chmod +x ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]


# ------ dev build ------
FROM base AS dev

CMD ["npm" ,"run", "dev"]

FROM base AS build
RUN npm run build

# ------- production build ------
FROM node:24.19-alpine3.24@sha256:d32cdf619f63fe0471182d08996dd516c6275bb5fd31ae06e55a570bd9e1ad43 AS prod
WORKDIR /app

COPY package.json package-lock.json .
RUN npm ci --omit=dev

COPY prisma /app/prisma/ 
COPY prisma.config.ts /app

COPY --from=base /app/entrypoint.sh .
RUN chmod +x ./entrypoint.sh

COPY --from=build /app/dist .

CMD ["node", "src/server.js"]
ENTRYPOINT ["./entrypoint.sh"]