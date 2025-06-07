FROM node:22-slim

RUN apt-get update && apt-get install -y curl --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

RUN npm install --omit=dev

COPY . /app

RUN npm run build

ENV NODE_ENV=production

CMD ["npm", "run", "start"]

HEALTHCHECK --interval=5s --timeout=5s --start-period=1s --retries=15 CMD curl -f http://localhost:3000/api/healthz || exit 1

EXPOSE 3000