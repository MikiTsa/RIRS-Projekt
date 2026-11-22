FROM node:24-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/server.js"]
