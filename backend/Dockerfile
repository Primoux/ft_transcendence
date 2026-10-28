FROM node:24-alpine@sha256:7804c7734b3e0cf647ab8273a1d4cda776123145da5952732f3dca9e742ddca0 AS base

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
FROM node:24-alpine@sha256:7804c7734b3e0cf647ab8273a1d4cda776123145da5952732f3dca9e742ddca0 AS prod
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