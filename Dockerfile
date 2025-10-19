# Multi-stage build for Oniki.net platform
# Stage 1: Build Backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci && npm cache clean --force

# Copy backend source
COPY backend/ ./

# Remove test files before build
RUN find src -type f -name "*.spec.ts" -delete || true && \
    rm -rf test || true

# Build backend
RUN npm run build

# Stage 2: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci && npm cache clean --force

# Copy frontend source
COPY frontend/ ./

# Build arguments for frontend
ARG VITE_API_URL=http://localhost:3000/api
ARG VITE_WS_URL=http://localhost:3000
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_WS_URL=${VITE_WS_URL}

# Remove test files before build
RUN find src -type d -name "__tests__" -exec rm -rf {} + || true && \
    find src -type f -name "*.test.ts" -delete || true && \
    find src -type f -name "*.test.tsx" -delete || true && \
    rm -f src/setupTests.ts src/jest.config.js || true

# Build frontend (skip TypeScript check, only vite build)
RUN npx vite build

# Stage 3: Production image with both services
FROM node:20-alpine

WORKDIR /app

# Install required tools
RUN apk add --no-cache \
    dumb-init \
    wget \
    nginx \
    supervisor

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Setup Backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=backend-builder --chown=nestjs:nodejs /app/backend/dist ./dist
RUN mkdir -p uploads && chown -R nestjs:nodejs uploads

# Setup Frontend (nginx)
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/nginx.conf
RUN chown -R nestjs:nodejs /usr/share/nginx/html && \
    mkdir -p /var/cache/nginx /var/log/nginx /var/lib/nginx/logs /var/lib/nginx/tmp/client_body /run/nginx && \
    chown -R nestjs:nodejs /var/cache/nginx /var/log/nginx /var/run /var/lib/nginx /run/nginx

# Create supervisor config
RUN mkdir -p /etc/supervisor/conf.d /var/log/supervisor

COPY <<EOF /etc/supervisor/conf.d/supervisord.conf
[supervisord]
nodaemon=true
user=root
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid

[program:backend]
directory=/app/backend
command=node dist/main.js
user=nestjs
autostart=true
autorestart=true
stdout_logfile=/var/log/supervisor/backend.log
stderr_logfile=/var/log/supervisor/backend-error.log
environment=NODE_ENV="production"

[program:frontend]
command=nginx -g 'daemon off;'
user=nestjs
autostart=true
autorestart=true
stdout_logfile=/var/log/supervisor/frontend.log
stderr_logfile=/var/log/supervisor/frontend-error.log
EOF

# Switch to app directory
WORKDIR /app

# Expose ports
EXPOSE 3000 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health && \
      wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start supervisor
ENTRYPOINT ["dumb-init", "--"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

