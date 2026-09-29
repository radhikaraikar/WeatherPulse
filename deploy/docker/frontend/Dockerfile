# ==============================================================================
# Stage 1: Build Stage (Node.js Alpine)
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies if package.json exists
COPY package*.json ./
RUN if [ -f package.json ]; then npm ci; fi

# Copy static assets and sources
COPY . .

# If it's a Next.js / React build, run build script, else copy static files
RUN if [ -f package.json ]; then npm run build; fi

# ==============================================================================
# Stage 2: Production Serving Stage (Nginx Alpine)
# ==============================================================================
FROM nginx:1.25-alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built artifacts or static assets to Nginx html directory
COPY --from=builder /app/index.html /usr/share/nginx/html/
COPY --from=builder /app/styles.css /usr/share/nginx/html/
COPY --from=builder /app/*.js /usr/share/nginx/html/
COPY --from=builder /app/*.json /usr/share/nginx/html/

# Copy custom Nginx configuration with reverse proxy & gzip
COPY deploy/docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Security headers & non-root user setup
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
