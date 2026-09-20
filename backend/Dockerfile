FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/database.sqlite

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "src/main.js"]
