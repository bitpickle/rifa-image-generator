FROM oven/bun:latest
WORKDIR /app

COPY package.json ./
COPY bun.lockb ./
COPY . .

RUN bun install
RUN bun ./node_modules/puppeteer/install.mjs
CMD ["bun", "dev"]
