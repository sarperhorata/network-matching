# 🐳 Docker Deployment Guide

Complete guide for running Oniki.net platform with Docker.

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.0+
- At least 4GB RAM available
- Ports available: 3000, 5173, 5432, 6379

## 🚀 Quick Start

### Option 1: Using the Start Script (Recommended)

```bash
# Make script executable
chmod +x docker-start.sh

# Run the script
./docker-start.sh
```

This script will:
- ✅ Create `.env` file automatically
- ✅ Stop existing containers
- ✅ Build fresh images
- ✅ Start all services
- ✅ Show service status

### Option 2: Manual Start

```bash
# 1. Create .env file (if not exists)
cp backend/.env.example .env

# Or create manually with these values:
cat > .env << 'EOF'
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=oniki_net
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=production
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
EOF

# 2. Build containers
docker-compose build

# 3. Start services
docker-compose up -d

# 4. Check status
docker-compose ps
```

## 🌐 Access Points

Once containers are running:

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 📦 Services

### 1. PostgreSQL Database
- Image: `postgres:14-alpine`
- Port: `5432`
- Database: `oniki_net`
- User/Password: `postgres/postgres`

### 2. Redis Cache
- Image: `redis:6-alpine`
- Port: `6379`
- Persistence: Volume mounted

### 3. Oniki Platform (Single Container)
- Container Name: `oniki`
- Built from root `Dockerfile`
- Runs 2 processes via Supervisor:
  - **Backend (NestJS)**: Port `3000`
  - **Frontend (Nginx)**: Port `80`
- Dependencies: PostgreSQL, Redis
- Health check: Both `/api/health` and `/`

**Why Single Container?**
- Simplified deployment
- Easier resource management
- Both processes visible in single container
- Better for small to medium deployments

## 🔧 Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Oniki container (backend + frontend)
docker-compose logs -f oniki

# Only backend logs
docker exec oniki tail -f /var/log/supervisor/backend.log

# Only frontend logs
docker exec oniki tail -f /var/log/supervisor/frontend.log

# Database logs
docker-compose logs -f postgres

# View processes inside oniki container
docker exec oniki ps aux
docker exec oniki supervisorctl status
```

### Stop Services
```bash
# Stop all
docker-compose down

# Stop and remove volumes (⚠️ deletes database!)
docker-compose down -v
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart oniki container (both backend + frontend)
docker-compose restart oniki

# Restart only backend process inside container
docker exec oniki supervisorctl restart backend

# Restart only frontend process inside container
docker exec oniki supervisorctl restart frontend
```

### Rebuild After Code Changes
```bash
# Rebuild and restart
docker-compose up -d --build

# Force rebuild (no cache)
docker-compose build --no-cache
docker-compose up -d
```

### Execute Commands in Container
```bash
# Enter oniki container
docker exec -it oniki sh

# Run backend commands
docker exec -it oniki sh -c "cd backend && npm run migration:run"
docker exec -it oniki sh -c "cd backend && npm run seed"

# View running processes
docker exec oniki supervisorctl status

# View backend logs
docker exec oniki supervisorctl tail backend

# View frontend logs
docker exec oniki supervisorctl tail frontend
```

### Check Container Status
```bash
# List containers
docker-compose ps

# View resource usage
docker stats

# Inspect specific service
docker-compose exec backend node -v
```

## 🐛 Troubleshooting

### Problem: Containers won't start

**Solution 1**: Check if ports are available
```bash
# Check if ports are in use
lsof -i :3000
lsof -i :5173
lsof -i :5432
lsof -i :6379

# Kill processes if needed
kill -9 <PID>
```

**Solution 2**: Remove old containers and volumes
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d
```

### Problem: Backend fails health check

**Symptoms**: Backend container keeps restarting

**Solutions**:
```bash
# 1. Check logs
docker-compose logs backend

# 2. Increase startup time
# Edit docker-compose.yml:
#   start_period: 120s  # Give more time

# 3. Check database connection
docker-compose exec backend wget -O- http://localhost:3000/api/health
```

### Problem: Frontend shows blank page

**Solutions**:
```bash
# 1. Check environment variables
docker-compose exec frontend cat /usr/share/nginx/html/index.html

# 2. Rebuild frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend

# 3. Check nginx logs
docker-compose logs frontend
```

### Problem: Database connection errors

**Solutions**:
```bash
# 1. Wait for PostgreSQL to be ready
docker-compose logs postgres

# 2. Check database credentials
docker-compose exec postgres psql -U postgres -c "\l"

# 3. Restart backend after PostgreSQL is ready
docker-compose restart backend
```

### Problem: Out of disk space

```bash
# Clean up Docker resources
docker system prune -a --volumes

# Remove unused images
docker image prune -a

# Remove stopped containers
docker container prune
```

## 🔒 Production Deployment

For production, modify these settings:

### 1. Update Environment Variables

```bash
# Change these in .env:
JWT_SECRET=<strong-random-secret-64-chars>
DATABASE_PASSWORD=<strong-password>
NODE_ENV=production
```

### 2. Enable Nginx Reverse Proxy

```bash
# Start with nginx profile
docker-compose --profile production up -d
```

### 3. Add SSL Certificates

```bash
# Place certificates in ./ssl/ directory
# Update docker-compose.yml nginx volumes
```

### 4. Use External Database (Recommended)

Instead of containerized PostgreSQL, use managed database:
```yaml
# Update backend service in docker-compose.yml:
environment:
  DATABASE_HOST: your-managed-db.example.com
  DATABASE_PORT: 5432
  DATABASE_USER: prod_user
  DATABASE_PASSWORD: ${DB_PASSWORD}
```

## 📊 Performance Optimization

### Resource Limits

Add to docker-compose.yml:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Build Optimization

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker-compose build

# Multi-stage build caching
docker-compose build --build-arg BUILDKIT_INLINE_CACHE=1
```

## 📝 Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_HOST` | postgres | PostgreSQL hostname |
| `DATABASE_PORT` | 5432 | PostgreSQL port |
| `DATABASE_USER` | postgres | Database username |
| `DATABASE_PASSWORD` | postgres | Database password |
| `DATABASE_NAME` | oniki_net | Database name |
| `REDIS_HOST` | redis | Redis hostname |
| `REDIS_PORT` | 6379 | Redis port |
| `JWT_SECRET` | change-me | JWT signing secret |
| `JWT_EXPIRES_IN` | 7d | JWT expiration time |
| `PORT` | 3000 | Backend port |
| `NODE_ENV` | production | Environment mode |
| `FRONTEND_URL` | http://localhost:5173 | Frontend URL for CORS |
| `VITE_API_URL` | http://localhost:3000/api | API URL for frontend |
| `VITE_WS_URL` | http://localhost:3000 | WebSocket URL |

## 🎯 Health Checks

All services include health checks:

- **PostgreSQL**: `pg_isready` check every 10s
- **Redis**: `redis-cli ping` check every 10s
- **Backend**: HTTP check to `/api/health` every 30s
- **Frontend**: HTTP check to `/` every 30s

## 🔄 Backup & Restore

### Backup Database
```bash
docker-compose exec postgres pg_dump -U postgres oniki_net > backup.sql
```

### Restore Database
```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres oniki_net
```

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/recipes/docker)
- [Vite Docker Guide](https://vitejs.dev/guide/backend-integration.html)

## 🆘 Support

If you encounter issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables: Check `.env` file
3. Restart services: `docker-compose restart`
4. Full reset: `docker-compose down -v && ./docker-start.sh`

---

**Last Updated**: October 2025  
**Docker Compose Version**: 3.8

