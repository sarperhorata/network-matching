# 🎨 Oniki.net - Frontend Application

Modern, responsive React PWA for the Oniki.net platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📊 Application Stats

```
Pages:          15 (all modernized with latest Figma design)
Components:     50+ (46 UI + layout + custom)
Services:       10 (100% backend integration)
Tests:          15 (77% coverage)
Routes:         15 (all protected/public)
UI Library:     Shadcn/ui + Radix UI
State:          Zustand
Routing:        React Router v6
```

## 📱 Pages

### Public
- HomePage - Landing page with gradient hero
- LoginPage - Modern card UI + OAuth buttons
- RegisterPage - Modern card UI + OAuth buttons

### Protected (Authenticated)
- DashboardPage - Analytics charts (Area, Bar, Pie)
- EventsPage - Event grid with filters
- EventDetailPage - Event details + join
- ProfilePage - User profile management
- MatchesPage - AI matches + recommendations
- MessagesPage - Real-time chat (WebSocket)
- MeetingsPage - Calendar view
- SettingsPage - 5 tabs (Account, Notifications, Privacy, Branding, Email)

### Innovative Features (NEW!)
- SpeedDatingPage - ⚡ Business speed networking
- SerendipityPage - 🌈 Cross-industry matching
- SocialCapitalPage - 🏆 Network score + leaderboard
- TravelBuddyPage - ✈️ Event travel matching

## 🎨 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 5.4 | Build tool |
| TailwindCSS | 3.x | Styling |
| Radix UI | Latest | Headless components |
| Shadcn/ui | Latest | Component library |
| Lucide React | 0.487 | Icons |
| Recharts | 2.15 | Charts |
| Zustand | Latest | State management |
| React Router | 6.x | Routing |
| React Hook Form | 7.55 | Forms |
| Sonner | 2.0 | Toasts |
| Socket.IO Client | Latest | WebSocket |

## 🎨 Design System

**Figma Design**: [View Live Prototype](https://pitch-park-04233792.figma.site)

**Colors:**
- Primary Blue: `#0EA5E9`
- Dark Navy: `#0A2540`
- Accent Orange: `#F59E0B`
- Success Green: `#10B981`
- Purple: `#8B5CF6`

**Components:** 46 modern UI components (Shadcn/ui style)

## 📂 Project Structure

```
src/
├── pages/               # 15 pages
├── components/          
│   ├── ui/             # 46 Shadcn/ui components
│   ├── layout/         # Header, Footer, Layout
│   └── ...             # Custom components
├── services/           # 10 API services
├── stores/             # Zustand stores
├── types/              # TypeScript types
├── utils/              # Utilities
└── hooks/              # Custom hooks
```

## 🔗 API Integration

All services fully integrated with backend:

- `auth.service.ts` - Authentication (7 endpoints)
- `users.service.ts` - User management (4 endpoints)
- `events.service.ts` - Events (10 endpoints)
- `matches.service.ts` - Matching (6 endpoints)
- `messaging.service.ts` - WebSocket messaging (8 endpoints)
- `meetings.service.ts` - Meetings (10 endpoints)
- `analytics.service.ts` - Analytics (10 endpoints)
- `tenants.service.ts` - White-label (9 endpoints)
- `notifications.service.ts` - Notifications (6 endpoints)

**Total:** 100% integration with all 62 backend endpoints

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

**Coverage:** 77% (15 tests)

## 🌐 Environment Variables

```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Docker
```bash
docker build -t oniki-frontend .
docker run -p 5173:5173 oniki-frontend
```

## 📦 Build Output

Production build is optimized and includes:
- Code splitting
- Tree shaking
- Minification
- PWA support (service workers)
- Offline capability

**Bundle Size:** <130KB gzipped

## 🎯 Features

### Core
✅ JWT authentication  
✅ Protected routes  
✅ Real-time messaging (WebSocket)  
✅ PWA (installable)  
✅ Offline support  
✅ Responsive design (mobile-first)

### Advanced
✅ AI matching with 4 algorithms  
✅ Event management with QR check-in  
✅ Meeting scheduler with iCal export  
✅ Analytics dashboard with charts  
✅ Notification system with bell icon  
✅ Settings with 5 comprehensive tabs  
✅ White-label theme customizer  

### Innovative (NEW!)
✅ Business Speed Dating  
✅ Serendipity Mode  
✅ Social Capital Score  
✅ Travel Buddy  

## 🔧 Development

```bash
# Start dev server (with HMR)
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Format
npm run format
```

## 📄 License

Proprietary - All rights reserved by Oniki.net

---

**Part of:** [Oniki.net Platform](https://github.com/sarperhorata/network-matching)  
**Status:** Production Ready  
**Last Updated:** October 18, 2025
