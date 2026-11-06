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


# copies the static files and serves them with nginx, behind ModSecurity and the OWASP CRS.
# Configured through environment variables: see default.conf.template and compose.yml.
FROM owasp/modsecurity-crs:nginx-alpine@sha256:873ce68a658d2e3b61484a8a24d215f7d15456e7ce5aec5e7114bf000d743365 AS prod

COPY default.conf.template /etc/nginx/templates/conf.d/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
