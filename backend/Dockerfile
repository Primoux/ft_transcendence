FROM node:24-alpine@sha256:7804c7734b3e0cf647ab8273a1d4cda776123145da5952732f3dca9e742ddca0

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .
RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]

CMD ["npm" ,"run", "dev"]