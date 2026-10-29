FROM node:24.19-alpine3.24@sha256:d32cdf619f63fe0471182d08996dd516c6275bb5fd31ae06e55a570bd9e1ad43 AS base

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
