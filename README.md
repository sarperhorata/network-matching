# Oniki.net - Network Matchmaking Platform

AI-powered, data-driven network matchmaking platform for business events. Connect professionals before, during, and after events with intelligent matching algorithms.

## Features

### MVP Phase
- **User Management**: Registration, authentication (email + OAuth), profile management
- **Event Management**: Create, manage, and join events with QR code check-in
- **AI Matching**: Rule-based intelligent matching by industry, interests, and networking goals
- **Networking**: 1-1 messaging, meeting scheduler, connection management
- **Event Experience**: Pre-event networking, live event feed, post-event follow-ups
- **Analytics**: Basic insights for organizers, sponsors, and participants
- **PWA**: Progressive Web App with offline support and push notifications

### Future Phases
- Advanced ML-based matching with behavioral analysis
- White-label solution for enterprise clients
- React Native mobile apps
- Video meeting integration
- Gamification and community features

## Tech Stack

### Frontend
- React 18+ with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Zustand for state management
- React Router for navigation
- TanStack Query for data fetching
- Socket.io for real-time features
- Vite PWA plugin for Progressive Web App

### Backend
- NestJS (Node.js framework)
- PostgreSQL for primary database
- Redis for caching and sessions
- TypeORM for database ORM
- JWT + OAuth 2.0 for authentication
- Socket.io for WebSocket support
- OpenAI API for AI matching

## Getting Started

### Prerequisites
- Node.js 18+ (20+ recommended)
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd 12net
```

2. Install dependencies:
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Setup database:
```bash
# Create PostgreSQL database
createdb oniki_net

# Run migrations (after backend setup)
cd backend
npm run migration:run
```

5. Start development servers:
```bash
# Backend (Terminal 1)
cd backend
npm run start:dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

Visit `http://localhost:5173` for the frontend and `http://localhost:3000` for the backend API.

## Project Structure

```
12net/
├── frontend/                 # React PWA application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── stores/         # Zustand stores
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── backend/                 # NestJS API application
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── events/         # Event management
│   │   ├── matches/        # Matching algorithm
│   │   ├── messages/       # Messaging system
│   │   ├── meetings/       # Meeting scheduler
│   │   ├── analytics/      # Analytics module
│   │   └── common/         # Shared utilities
│   └── test/               # Test files
└── docs/                   # Documentation

```

## Development Roadmap

- [x] Project setup and infrastructure
- [ ] Authentication system
- [ ] User profile management
- [ ] Event management
- [ ] AI matching algorithm v1
- [ ] Messaging system
- [ ] Meeting scheduler
- [ ] Event experience features
- [ ] Basic analytics
- [ ] PWA optimization
- [ ] Testing and bug fixes
- [ ] Beta launch
- [ ] Advanced AI/ML features
- [ ] White-label solution
- [ ] React Native apps

## Contributing

This is a private project. For team members, please follow the Git workflow:
1. Create feature branch from `develop`
2. Make changes and commit
3. Create pull request to `develop`
4. After review, merge to `develop`
5. Periodically merge `develop` to `main` for releases

## License

Proprietary - All rights reserved by Oniki.net

## Team

- Product Manager / Tech Lead: Burak
- Development Team: TBD

## Contact

For questions or support, contact the development team.

