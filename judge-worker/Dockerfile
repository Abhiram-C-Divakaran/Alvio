# Isolated Coding Judge Worker (Node 24 + Docker CLI only; runs on a dedicated judge host)
FROM node:24-alpine

RUN apk add --no-cache docker-cli

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm install --no-save tsx

COPY server/submissionRunner.ts ./server/submissionRunner.ts
COPY judge-worker ./judge-worker

ENV NODE_ENV=production
ENV JUDGE_WORKER_HOST=0.0.0.0
ENV JUDGE_WORKER_PORT=4005

EXPOSE 4005

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4005/health || exit 1

CMD ["npx", "tsx", "judge-worker/server.ts"]
