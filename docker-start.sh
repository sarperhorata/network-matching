#!/bin/bash

echo "🐳 Starting Oniki.net Platform with Docker..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file with default values..."
    cat > .env << 'EOF'
# Database
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=oniki_net

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=development-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Application
PORT=3000
NODE_ENV=production
FRONTEND_URL=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
EOF
    echo "✅ .env file created!"
    echo ""
fi

# Stop and remove existing containers
echo "🛑 Stopping existing containers..."
docker-compose down -v

# Build and start containers
echo "🏗️  Building containers..."
docker-compose build --no-cache

echo ""
echo "🚀 Starting containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check container status
echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "✅ Docker containers started!"
echo ""
echo "📍 Access points:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:3000/api"
echo "   - Swagger Docs: http://localhost:3000/api/docs"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo ""
echo "📝 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop: docker-compose down"
echo "   - Restart: docker-compose restart"
echo ""
echo "🎉 Platform is ready!"

