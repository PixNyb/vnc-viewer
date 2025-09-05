FROM node:22-slim
LABEL maintainer="Roël Couwenberg <contact@roelc.me>"
LABEL org.opencontainers.image.title="VNC Viewer"
LABEL org.opencontainers.image.description="A Dockerised vnc viewer to be used with other containers."
LABEL org.opencontainers.image.url="https://roelc.me/en/resources/2024/07/29/vnc-viewer/"
LABEL org.opencontainers.image.source="https://github.com/pixnyb/vnc-viewer"

RUN apt-get update && apt-get install -y curl --no-install-recommends && rm -rf /var/lib/apt/lists/*

RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

RUN npm install --omit=dev

COPY . /app

RUN chown -R appuser:appuser /app

RUN npm run build

ENV NODE_ENV=production

CMD ["npm", "run", "start"]

HEALTHCHECK --interval=5s --timeout=5s --start-period=1s --retries=15 CMD curl -f http://localhost:3000/api/healthz || exit 1

EXPOSE 3000

USER appuser