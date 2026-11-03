FROM node:24.19-alpine3.24@sha256:d32cdf619f63fe0471182d08996dd516c6275bb5fd31ae06e55a570bd9e1ad43 AS base

WORKDIR /vault-init/
COPY main.ts ./

CMD ["node", "main.ts"]