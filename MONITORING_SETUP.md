# 📊 Monitoring & Logging Setup Guide

Complete guide for setting up monitoring, error tracking, and analytics for Oniki.net.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Sentry Error Tracking](#sentry-error-tracking)
- [PostHog Analytics](#posthog-analytics)
- [Uptime Monitoring](#uptime-monitoring)
- [Log Aggregation](#log-aggregation)
- [Performance Monitoring](#performance-monitoring)
- [Alerts & Notifications](#alerts--notifications)

---

## 🎯 Overview

### Monitoring Stack

| Service | Purpose | Cost | Priority |
|---------|---------|------|----------|
| **Sentry** | Error tracking | Free (5K errors/mo) | Critical |
| **PostHog** | Product analytics | Free (1M events/mo) | High |
| **UptimeRobot** | Uptime monitoring | Free (50 monitors) | Critical |
| **BetterStack** | Log aggregation | Free (1GB/mo) | Medium |
| **Vercel Analytics** | Web vitals | Free | High |

**Total Cost (Free Tier)**: $0/month  
**Paid Upgrade Cost**: ~$50-100/month (when needed)

---

## 🔴 Sentry Error Tracking

### 1. Setup Sentry Account

```bash
# 1. Create account at sentry.io
# 2. Create new project: "Oniki Backend" (Node.js/NestJS)
# 3. Create another project: "Oniki Frontend" (React)
# 4. Copy DSN from each project
```

### 2. Install Sentry (Backend)

```bash
cd backend
npm install @sentry/node @sentry/profiling-node
```

**Update main.ts:**
```typescript
import { initializeSentry } from './common/config/sentry.config';

// At the top of bootstrap()
initializeSentry();
```

**Environment Variables (.env):**
```env
# Sentry
SENTRY_DSN=https://xxx@o123456.ingest.sentry.io/123456
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=1.0.0
```

### 3. Install Sentry (Frontend)

```bash
cd frontend
npm install @sentry/react @sentry/tracing
```

**Create: frontend/src/config/sentry.ts**
```typescript
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export function initSentry() {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.log('Sentry not configured');
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
  });
}
```

**Update main.tsx:**
```typescript
import { initSentry } from './config/sentry';

initSentry();
```

### 4. Test Sentry

```typescript
// Trigger test error
throw new Error('Test Sentry integration');

// Should appear in Sentry dashboard within seconds
```

---

## 📈 PostHog Analytics

### 1. Setup PostHog

```bash
# 1. Create account at posthog.com (or self-host)
# 2. Create new project
# 3. Copy API key
```

### 2. Install PostHog (Frontend)

```bash
cd frontend
npm install posthog-js
```

**Create: frontend/src/config/analytics.ts**
```typescript
import posthog from 'posthog-js';

export function initAnalytics() {
  if (!import.meta.env.VITE_POSTHOG_KEY) {
    console.log('Analytics not configured');
    return;
  }

  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    disable_session_recording: false,
  });
}

export function trackEvent(event: string, properties?: Record<string, any>) {
  posthog.capture(event, properties);
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
  posthog.identify(userId, traits);
}
```

**Track Events:**
```typescript
// In your components
import { trackEvent } from './config/analytics';

// Track user actions
trackEvent('event_joined', {
  eventId: event.id,
  eventTitle: event.title,
});

trackEvent('match_accepted', {
  matchId: match.id,
  score: match.score,
});

trackEvent('message_sent', {
  conversationId: conversation.id,
});
```

**Environment Variables:**
```env
VITE_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxx
VITE_POSTHOG_HOST=https://app.posthog.com
```

---

## 🟢 Uptime Monitoring

### Option 1: UptimeRobot (Recommended - Free)

```bash
# 1. Create account at uptimerobot.com
# 2. Add monitors:

Monitors to create:
- Frontend: https://oniki.net (Check every 5 min)
- Backend API: https://api.oniki.net/api/health (Check every 5 min)
- Swagger Docs: https://api.oniki.net/api/docs (Check every 30 min)

Alert Channels:
- Email: your-email@example.com
- Slack: (Optional) #alerts channel
- SMS: (Optional) For critical alerts

Response Time Tracking: Enabled
SSL Certificate Monitoring: Enabled
```

### Option 2: Better Uptime

```bash
# 1. Create account at betteruptime.com
# 2. More advanced features (incident management, status pages)
# 3. Free tier: 10 monitors
```

### Option 3: Healthchecks.io

```bash
# For cron job monitoring
# 1. Create account at healthchecks.io
# 2. Add cron jobs:
  - Daily match generation
  - Weekly email digest
  - Data cleanup jobs
```

---

## 📝 Log Aggregation

### Option 1: BetterStack (Recommended)

```bash
# 1. Create account at betterstack.com
# 2. Create log source: "Oniki Backend"
# 3. Get ingestion token

# Install winston for structured logging
cd backend
npm install winston winston-transport
```

**Create: backend/src/common/config/logging.config.ts**
```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'oniki-backend' },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    
    // File output (production)
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error' 
          }),
          new winston.transports.File({ 
            filename: 'logs/combined.log' 
          }),
        ]
      : []),
  ],
});
```

### Option 2: Datadog

```bash
# Enterprise option
# Better for large scale
# Cost: ~$15/host/month
```

---

## ⚡ Performance Monitoring

### 1. Web Vitals (Frontend)

```bash
cd frontend
npm install web-vitals
```

**Create: frontend/src/utils/reportWebVitals.ts**
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function reportWebVitals(onPerfEntry?: (metric: any) => void) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
}

// Send to analytics
function sendToAnalytics(metric: any) {
  // Send to PostHog
  posthog.capture('web_vitals', {
    metric_name: metric.name,
    value: metric.value,
    rating: metric.rating,
  });
  
  // Send to Google Analytics (if using)
  // gtag('event', metric.name, {
  //   value: Math.round(metric.value),
  //   metric_id: metric.id,
  //   metric_delta: metric.delta,
  // });
}

// Use in main.tsx
reportWebVitals(sendToAnalytics);
```

### 2. Backend Performance

**Add APM (Application Performance Monitoring):**

```bash
# Option 1: New Relic (Free tier available)
cd backend
npm install newrelic

# Option 2: Datadog APM
# Option 3: Elastic APM
```

---

## 🔔 Alerts & Notifications

### Slack Integration

```bash
# 1. Create Slack webhook
# 2. Add to GitHub Secrets: SLACK_WEBHOOK_URL

# 3. Add to GitHub Actions:
```

```yaml
- name: Notify Slack on Failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Build failed! Check GitHub Actions.'
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Email Alerts

**Configured in:**
- Sentry: Error alerts
- UptimeRobot: Downtime alerts
- GitHub: Deployment notifications

---

## 📊 Monitoring Dashboard

### Recommended Stack

**Free Tier:**
```
Sentry.io          → Error tracking & performance
PostHog            → Product analytics & session replay  
UptimeRobot        → Uptime & SSL monitoring
Vercel Analytics   → Frontend web vitals
GitHub Actions     → CI/CD monitoring
```

**Paid Tier (Later):**
```
Datadog ($15/mo)   → All-in-one monitoring
New Relic          → APM & infrastructure
PagerDuty          → On-call management
```

---

## 🛠️ Implementation Checklist

### Phase 1: Basic Monitoring (Week 1)
- [x] Custom Logger Service ✅
- [x] Sentry configuration file ✅
- [ ] Install Sentry packages
- [ ] Configure Sentry DSN
- [ ] Test error reporting
- [ ] Setup UptimeRobot
- [ ] Configure alert emails

### Phase 2: Analytics (Week 2)
- [ ] Install PostHog
- [ ] Track key events
- [ ] Setup user identification
- [ ] Create analytics dashboard
- [ ] Track conversion funnels

### Phase 3: Performance (Week 3)
- [ ] Web vitals tracking
- [ ] Backend APM setup
- [ ] Database query monitoring
- [ ] API response time tracking
- [ ] Bundle size monitoring

### Phase 4: Logs & Alerts (Week 4)
- [ ] Log aggregation service
- [ ] Slack notifications
- [ ] Alert rules configuration
- [ ] On-call rotation (if needed)

---

## 🔍 Key Metrics to Track

### Technical Metrics

**Backend:**
- API response time (target: <200ms)
- Error rate (target: <0.1%)
- Database query time
- Memory usage
- CPU usage
- Request throughput

**Frontend:**
- Largest Contentful Paint (LCP < 2.5s)
- First Input Delay (FID < 100ms)
- Cumulative Layout Shift (CLS < 0.1)
- Time to Interactive (TTI < 3.8s)
- Bundle size (target: <150KB gzipped)

### Business Metrics

**User Engagement:**
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- DAU/MAU ratio (target: >20%)
- Session duration
- Pages per session

**Feature Usage:**
- Events created/joined
- Matches generated/accepted
- Messages sent
- Meetings scheduled
- Profile completeness

**Conversion Metrics:**
- Signup conversion rate
- Email verification rate
- Profile completion rate
- Event join rate
- Match acceptance rate
- Free to paid conversion

---

## 📧 Environment Variables

Add to your .env files:

**Backend (.env):**
```env
# Sentry
SENTRY_DSN=https://xxx@o123456.ingest.sentry.io/123456
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=1.0.0

# New Relic (optional)
NEW_RELIC_LICENSE_KEY=your-key
NEW_RELIC_APP_NAME=Oniki-Backend

# Log Level
LOG_LEVEL=info
```

**Frontend (.env):**
```env
# Sentry
VITE_SENTRY_DSN=https://xxx@o123456.ingest.sentry.io/654321
VITE_SENTRY_ENVIRONMENT=production

# PostHog
VITE_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxx
VITE_POSTHOG_HOST=https://app.posthog.com

# Google Analytics (optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

---

## 🚨 Alert Configuration

### Critical Alerts (Immediate Action)

- Backend down (>2 min)
- Database connection failed
- Error rate >1%
- API response time >5s

**Action**: SMS + Email + Slack

### High Priority (15 min response)

- Error rate >0.5%
- High memory usage (>80%)
- Slow API responses (>1s)
- SSL certificate expiring (<7 days)

**Action**: Email + Slack

### Medium Priority (1 hour response)

- Warning logs increasing
- Disk space low (<20%)
- Cache hit rate low (<50%)

**Action**: Slack only

---

## 📊 Monitoring Dashboards

### Sentry Dashboard

**Views to create:**
1. Real-time errors
2. Error trends (7 days)
3. Most common errors
4. Performance issues
5. Release tracking

### PostHog Dashboard

**Insights to track:**
1. User journey funnel
2. Feature adoption
3. Retention cohorts
4. Session recordings
5. A/B test results

### UptimeRobot Dashboard

**Monitors:**
1. Frontend uptime (target: 99.9%)
2. Backend API uptime (target: 99.9%)
3. Database connectivity
4. WebSocket connection
5. SSL certificate validity

---

## 🔧 Quick Setup Commands

```bash
# 1. Install monitoring packages
cd backend
npm install @sentry/node @sentry/profiling-node winston

cd ../frontend
npm install @sentry/react posthog-js web-vitals

# 2. Configure environment variables
echo "SENTRY_DSN=your-dsn-here" >> backend/.env
echo "VITE_SENTRY_DSN=your-dsn-here" >> frontend/.env
echo "VITE_POSTHOG_KEY=your-key-here" >> frontend/.env

# 3. Uncomment integration code in:
# - backend/src/common/config/sentry.config.ts
# - backend/src/main.ts
# - frontend/src/main.tsx

# 4. Deploy and test
npm run build
# Check Sentry & PostHog dashboards
```

---

## 📱 Mobile App Monitoring

When React Native app is built:

```bash
npm install @sentry/react-native
npx @sentry/wizard -i reactNative

# PostHog for React Native
npm install posthog-react-native
```

---

## 🎯 Success Criteria

### Week 1
- [ ] Sentry catching errors
- [ ] Uptime monitoring active
- [ ] Basic alerts configured

### Week 2
- [ ] PostHog tracking events
- [ ] User identification working
- [ ] Custom dashboards created

### Week 3
- [ ] Performance monitoring live
- [ ] Log aggregation working
- [ ] Alert rules refined

### Week 4
- [ ] All metrics baseline established
- [ ] Team trained on dashboards
- [ ] On-call rotation (if needed)

---

## 💰 Cost Breakdown

### Free Tier (0-1000 users)
- Sentry: Free (5K errors/mo)
- PostHog: Free (1M events/mo)
- UptimeRobot: Free (50 monitors)
- Vercel Analytics: Free
- **Total**: $0/month

### Paid Tier (1000-10K users)
- Sentry Team: $26/month
- PostHog Scale: $0/month (still free)
- Better Uptime: $20/month
- New Relic: $99/month
- **Total**: ~$145/month

### Enterprise (10K+ users)
- Sentry Business: $80/month
- PostHog Enterprise: Custom
- Datadog: $15/host/month
- PagerDuty: $19/user/month
- **Total**: ~$500-1000/month

---

## 📞 Support & Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [PostHog Documentation](https://posthog.com/docs)
- [UptimeRobot](https://uptimerobot.com/)
- [BetterStack](https://betterstack.com/)
- [Web Vitals](https://web.dev/vitals/)

---

**Last Updated**: October 18, 2025  
**Status**: Configuration files ready, awaiting service signup  
**Next**: Create accounts and configure DSNs

