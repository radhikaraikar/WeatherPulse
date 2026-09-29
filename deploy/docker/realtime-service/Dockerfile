# ==============================================================================
# WeatherPulse realtime-service (Node.js 20 Alpine + WebSockets + Redis PubSub)
# ==============================================================================

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production \
    PORT=4000

COPY services/realtime-service/package*.json ./
RUN npm install --omit=dev || npm install express ws ioredis dotenv

COPY services/realtime-service/ ./

EXPOSE 4000

HEALTHCHECK --interval=20s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["node", "server.js"]
