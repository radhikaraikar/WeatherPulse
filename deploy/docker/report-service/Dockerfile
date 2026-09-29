# ==============================================================================
# WeatherPulse report-service (Node.js 20 REST & Spatial Engine)
# ==============================================================================

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080

COPY services/report-service/package*.json ./
RUN npm install --omit=dev || npm install express cors jsonwebtoken pg dotenv

COPY services/report-service/ ./
COPY government_verified_weather_dataset.json ./
COPY real_indian_weather_dataset.json ./

EXPOSE 8080

HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["node", "server.js"]
