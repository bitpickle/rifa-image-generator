FROM oven/bun:latest

COPY package.json ./
COPY bun.lockb ./
COPY . .

RUN bun install
CMD ["bun", "dev"]
