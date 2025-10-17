# Getting Started - Oniki.net Development

## Project Setup Completed ✅

The project infrastructure has been successfully set up with:
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + PWA
- **Backend**: NestJS + PostgreSQL + Redis + TypeORM
- **State Management**: Zustand
- **Routing**: React Router v6
- **Real-time**: Socket.io ready
- **Authentication**: JWT + OAuth structure ready

## Prerequisites

Before running the project, ensure you have:
- Node.js 18+ (20+ recommended for Vite 7)
- PostgreSQL 14+
- Redis 6+
- npm or yarn

## Environment Setup

### 1. Database Setup

Create a PostgreSQL database:
```bash
createdb oniki_net
```

Or using psql:
```sql
CREATE DATABASE oniki_net;
```

### 2. Redis Setup

Make sure Redis is running:
```bash
# macOS with Homebrew
brew services start redis

# Or run manually
redis-server
```

### 3. Environment Variables

#### Backend (.env)
Create `/Users/sarperhorata/12net/backend/.env`:
```env
NODE_ENV=development
PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_postgres_password
DATABASE_NAME=oniki_net

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# OAuth (optional for MVP)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# OpenAI (for AI matching - to be implemented)
OPENAI_API_KEY=your-openai-api-key
```

#### Frontend (.env)
Create `/Users/sarperhorata/12net/frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

## Running the Project

### 1. Start Backend

```bash
cd /Users/sarperhorata/12net/backend
npm run start:dev
```

Backend will run on: http://localhost:3000
- Health check: http://localhost:3000/api/health
- API endpoints: http://localhost:3000/api/*

### 2. Start Frontend

In a new terminal:
```bash
cd /Users/sarperhorata/12net/frontend
npm run dev
```

Frontend will run on: http://localhost:5173

## Project Structure

```
12net/
├── frontend/                    # React PWA
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── layout/        # Layout components (Header, Footer, etc.)
│   │   │   └── ui/            # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── stores/            # Zustand stores
│   │   ├── services/          # API services
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utility functions
│   ├── public/                # Static assets
│   └── dist/                  # Build output
│
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── users/             # User management
│   │   ├── events/            # Event management
│   │   ├── matches/           # Matching algorithm
│   │   ├── messages/          # Messaging system
│   │   ├── meetings/          # Meeting scheduler
│   │   ├── analytics/         # Analytics module
│   │   ├── common/            # Shared utilities
│   │   └── database/          # Database config
│   └── dist/                  # Build output
│
└── docs/                      # Documentation (to be created)
```

## Available Routes (Frontend)

- `/` - Home page
- `/login` - Login page
- `/register` - Register page
- `/dashboard` - User dashboard (protected)
- `/events` - Events list (protected)
- `/events/:id` - Event detail (protected)
- `/profile` - User profile (protected)
- `/matches` - Matches list (protected)
- `/messages` - Messages (protected)
- `/meetings` - Meetings calendar (protected)

## Available Endpoints (Backend)

### Public
- `GET /api` - API welcome message
- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration (to be implemented)
- `POST /api/auth/login` - User login (to be implemented)
- `GET /api/auth/google` - Google OAuth (to be implemented)

### Protected (require JWT token)
- `GET /api/auth/me` - Get current user (to be implemented)
- `GET /api/users/:id` - Get user by ID (to be implemented)
- `PUT /api/users/:id` - Update user (to be implemented)
- `GET /api/events` - List events (to be implemented)
- `POST /api/events` - Create event (to be implemented)
- `GET /api/matches` - Get matches (to be implemented)
- `POST /api/matches/generate` - Generate matches (to be implemented)
- `GET /api/messages` - Get messages (to be implemented)
- `POST /api/messages` - Send message (to be implemented)
- `GET /api/meetings` - Get meetings (to be implemented)
- `POST /api/meetings` - Create meeting (to be implemented)
- `GET /api/analytics/event/:id` - Event analytics (to be implemented)

## Development Workflow

1. **Backend Development**: All modules are set up with basic structure. Next steps:
   - Implement authentication (JWT + OAuth)
   - Complete CRUD operations for each module
   - Add validation and error handling
   - Implement AI matching algorithm

2. **Frontend Development**: Basic pages and routing are ready. Next steps:
   - Implement authentication UI fully
   - Create event listing and detail pages
   - Build matching and messaging interfaces
   - Add real-time features

3. **Testing**: After core features are implemented:
   - Unit tests
   - Integration tests
   - E2E tests

## PWA Features

The frontend is configured as a PWA with:
- Service worker for offline support
- Web app manifest
- Workbox for caching strategies
- Install prompt capability

To test PWA:
1. Build the frontend: `npm run build`
2. Serve the build: `npx serve -s dist`
3. Open in browser and check PWA installation prompt

## Next Steps (MVP)

Based on the project plan, the following features will be implemented in order:

1. ✅ **Project Setup** (COMPLETED)
2. **Authentication System** (NEXT)
   - JWT token handling
   - Register/Login endpoints
   - OAuth integration (Google, LinkedIn)
   - Role-based access control
3. **User Profile Management**
4. **Event Management**
5. **AI Matching Algorithm v1**
6. **Messaging System**
7. **Meeting Scheduler**
8. **Event Experience Features**
9. **Basic Analytics**
10. **PWA Optimization**
11. **Testing & Bug Fixes**

## Troubleshooting

### Backend won't start
- Check if PostgreSQL is running: `pg_isready`
- Check if Redis is running: `redis-cli ping`
- Verify database credentials in `.env`
- Ensure port 3000 is not in use

### Frontend won't start
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check if backend is running on port 3000
- Verify VITE_API_URL in `.env`

### Database connection errors
- Check PostgreSQL is running
- Verify database exists: `psql -l | grep oniki_net`
- Check credentials in backend `.env`

## Support

For questions or issues:
- Check the project plan: `/Users/sarperhorata/12net/oniki-net-network-matchmaking.plan.md`
- Review documentation in `/Users/sarperhorata/12net/README.md`
- Contact the development team

