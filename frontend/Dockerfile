FROM node:24-alpine@sha256:7804c7734b3e0cf647ab8273a1d4cda776123145da5952732f3dca9e742ddca0 AS base

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
COPY . .

FROM base AS dev

CMD ["npm", "run", "dev"]


# builds the production static files
FROM base AS build
RUN npm run build


# copies the static files and serves them with nginx
FROM nginx:stable-alpine3.24-slim@sha256:dede8895648b461178c3bc604f7eed4423efe5220b2c4d839f5eb3d34ac3f8f7 AS prod

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html