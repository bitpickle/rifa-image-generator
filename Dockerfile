FROM ghcr.io/puppeteer/puppeteer:latest
WORKDIR /app

USER root
RUN npm install -g bun

COPY package.json ./
COPY bun.lockb ./
COPY . .

RUN bun install
RUN bun ./node_modules/puppeteer/install.mjs
CMD ["bun", "dev"]
