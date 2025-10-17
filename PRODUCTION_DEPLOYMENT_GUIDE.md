# 🚀 Production Deployment Guide

## Overview

This guide will help you deploy the Oniki.net platform to production using:
- **Backend**: Render.com or Railway.app
- **Frontend**: Vercel or Netlify
- **Database**: PostgreSQL (managed by hosting provider)
- **Cache**: Redis (managed by hosting provider)

## 📋 Prerequisites

- [x] GitHub repository set up (✅ Done: github.com/sarperhorata/network-matching)
- [ ] Render.com account or Railway.app account
- [ ] Vercel account or Netlify account
- [ ] Environment variables prepared

---

## 🔧 Backend Deployment (Render.com - Recommended)

### Option A: Deploy with Render.com

#### Step 1: Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository: `sarperhorata/network-matching`
4. Configure:
   - **Name**: `oniki-backend`
   - **Region**: Frankfurt (Europe)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/main.js`
   - **Plan**: Starter ($7/month)

#### Step 2: Create PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `oniki-postgres`
   - **Region**: Frankfurt (same as backend)
   - **Plan**: Starter ($7/month)
3. Note the **Internal Database URL** (will be auto-connected)

#### Step 3: Create Redis Instance

1. Click **"New +"** → **"Redis"**
2. Configure:
   - **Name**: `oniki-redis`
   - **Region**: Frankfurt
   - **Plan**: Starter ($10/month)
3. Note the **Internal Redis URL**

#### Step 4: Set Environment Variables

Go to your backend service → **Environment** → Add:

```bash
NODE_ENV=production
PORT=3000

# Database (auto-populated by Render if you linked the database)
DATABASE_HOST=<from Render PostgreSQL>
DATABASE_PORT=5432
DATABASE_USER=<from Render PostgreSQL>
DATABASE_PASSWORD=<from Render PostgreSQL>
DATABASE_NAME=oniki_net

# Redis
REDIS_HOST=<from Render Redis>
REDIS_PORT=6379

# JWT Secret (generate a random 64-character string)
JWT_SECRET=<your-super-secret-jwt-key-min-32-chars>

# Frontend URL (will update after frontend deployment)
FRONTEND_URL=https://oniki.vercel.app

# SendGrid (for email)
SENDGRID_API_KEY=<your-sendgrid-key>
SENDGRID_FROM_EMAIL=noreply@oniki.net

# Stripe (for payments)
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>

# Jitsi (for video calls)
JITSI_APP_ID=<your-jitsi-app-id>
JITSI_SECRET_KEY=<your-jitsi-secret-key>

# Sentry (for error tracking)
SENTRY_DSN=<your-sentry-dsn>

# PostHog (for analytics)
POSTHOG_API_KEY=<your-posthog-key>
```

#### Step 5: Deploy!

1. Click **"Create Web Service"**
2. Wait for build to complete (~3-5 minutes)
3. Your backend will be live at: `https://oniki-backend.onrender.com`
4. Test: `https://oniki-backend.onrender.com/api/docs` (Swagger)

---

### Option B: Deploy with Railway.app

#### Step 1: Deploy Backend

1. Go to [Railway Dashboard](https://railway.app/)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select `sarperhorata/network-matching`
4. Add **PostgreSQL** and **Redis** from Railway marketplace
5. Configure environment variables (same as above)
6. Deploy!

Railway will auto-detect `railway.json` config.

---

## 🎨 Frontend Deployment (Vercel - Recommended)

### Option A: Deploy with Vercel

#### Step 1: Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import from GitHub: `sarperhorata/network-matching`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### Step 2: Set Environment Variables

Go to Project Settings → **Environment Variables**:

```bash
VITE_API_URL=https://oniki-backend.onrender.com/api
```

#### Step 3: Deploy!

1. Click **"Deploy"**
2. Wait for build (~2-3 minutes)
3. Your frontend will be live at: `https://oniki.vercel.app`

#### Step 4: Update Backend CORS

Go back to Render backend environment variables and update:

```bash
FRONTEND_URL=https://oniki.vercel.app
```

Then **redeploy** the backend service.

---

### Option B: Deploy with Netlify

#### Step 1: Import Project

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect GitHub: `sarperhorata/network-matching`
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

#### Step 2: Set Environment Variables

Go to Site settings → **Environment variables**:

```bash
VITE_API_URL=https://oniki-backend.onrender.com/api
```

#### Step 3: Deploy!

1. Click **"Deploy site"**
2. Your frontend will be live at: `https://oniki.netlify.app`

---

## 🔐 Domain Configuration (Optional)

### Custom Domain for Backend

1. Buy domain: `api.oniki.net`
2. In Render/Railway: Settings → Custom Domain → Add `api.oniki.net`
3. Update DNS records as instructed
4. SSL certificate will be auto-provisioned

### Custom Domain for Frontend

1. Buy domain: `oniki.net` or `app.oniki.net`
2. In Vercel/Netlify: Settings → Domains → Add custom domain
3. Update DNS records (CNAME to Vercel/Netlify)
4. SSL certificate will be auto-provisioned

### Update Environment Variables

After setting custom domains:

**Backend**:
```bash
FRONTEND_URL=https://oniki.net
```

**Frontend**:
```bash
VITE_API_URL=https://api.oniki.net/api
```

---

## 📊 Database Setup

### Run Migrations

After backend deployment, the database will auto-sync entities on first run (TypeORM `synchronize: true` in production is disabled).

To manually run migrations:

1. Connect to Render Shell or Railway CLI
2. Run:
```bash
npm run migration:run
```

### Seed Initial Data (Optional)

To add sample data:

```bash
# From backend shell
npm run seed
```

---

## 🧪 Testing Production Deployment

### Backend Health Checks

```bash
# API Health
curl https://oniki-backend.onrender.com/api

# Swagger Docs
https://oniki-backend.onrender.com/api/docs

# Test Auth Endpoint
curl -X POST https://oniki-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User"}'
```

### Frontend Health Checks

1. Open `https://oniki.vercel.app`
2. Test registration flow
3. Test login flow
4. Check Dashboard loads
5. Verify API calls work (Network tab in DevTools)

---

## 🔍 Monitoring & Logs

### Backend Logs

**Render**: Dashboard → Service → Logs tab
**Railway**: Dashboard → Deployment → Logs tab

### Frontend Logs

**Vercel**: Dashboard → Project → Deployments → Function Logs
**Netlify**: Dashboard → Site → Deploys → Deploy log

### Error Tracking (Sentry)

1. Create account: https://sentry.io
2. Create new project → Node.js (backend) and React (frontend)
3. Copy DSN
4. Add to environment variables
5. View errors in Sentry Dashboard

### Analytics (PostHog)

1. Create account: https://posthog.com
2. Create new project
3. Copy API key
4. Add to environment variables
5. View analytics in PostHog Dashboard

---

## 💰 Estimated Monthly Costs

| Service | Plan | Cost |
|---------|------|------|
| **Render Backend** | Starter | $7/month |
| **Render PostgreSQL** | Starter | $7/month |
| **Render Redis** | Starter | $10/month |
| **Vercel Frontend** | Hobby | Free (then $20/month) |
| **SendGrid** | Free Tier | Free (100 emails/day) |
| **Stripe** | Pay-as-you-go | 2.9% + $0.30 per transaction |
| **Sentry** | Developer | Free (5K errors/month) |
| **PostHog** | Free Tier | Free (1M events/month) |
| **Total** | | **~$24-44/month** |

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [x] Code pushed to GitHub
- [x] Environment variables documented
- [x] Database schema finalized
- [x] API documentation complete (Swagger)
- [x] Frontend build tested locally

### Backend Deployment

- [ ] Create Render/Railway account
- [ ] Deploy backend service
- [ ] Create PostgreSQL database
- [ ] Create Redis instance
- [ ] Set environment variables
- [ ] Test API endpoints
- [ ] Check Swagger docs

### Frontend Deployment

- [ ] Create Vercel/Netlify account
- [ ] Deploy frontend
- [ ] Set API URL environment variable
- [ ] Test registration & login
- [ ] Test all pages (Dashboard, Events, Matches, etc.)
- [ ] Verify API integration

### Post-Deployment

- [ ] Update backend CORS with frontend URL
- [ ] Test end-to-end user flow
- [ ] Set up custom domains (optional)
- [ ] Configure monitoring (Sentry, PostHog)
- [ ] Set up email service (SendGrid)
- [ ] Configure payment gateway (Stripe)
- [ ] Enable video calls (Jitsi)
- [ ] Document production URLs
- [ ] Share with beta testers

---

## 📚 Additional Resources

- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com/)
- [NestJS Production Best Practices](https://docs.nestjs.com/faq/deployment)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

---

## 🆘 Troubleshooting

### Backend Issues

**Error: "Cannot connect to database"**
- Check DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD
- Verify database is in same region as backend
- Check firewall rules (Render auto-handles this)

**Error: "CORS policy"**
- Update FRONTEND_URL in backend environment variables
- Redeploy backend service

### Frontend Issues

**Error: "API requests failing"**
- Check VITE_API_URL is correct
- Verify backend is running
- Check Network tab for exact error

**Build Error: "Out of memory"**
- Upgrade Vercel/Netlify plan
- Or optimize bundle size

---

**Last Updated**: October 18, 2025  
**Status**: Ready for Production  
**Maintainer**: Sarper Horata

