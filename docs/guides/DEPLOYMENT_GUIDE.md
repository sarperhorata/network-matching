# 🚀 Production Deployment Guide - Oniki.net

Complete step-by-step guide for deploying Oniki.net to production.

---

## 📋 Pre-Deployment Checklist

### Required Accounts (15 minutes to setup)

- [ ] **Railway.app** - Backend + Database (Free tier: $5 credit)
- [ ] **Vercel.com** - Frontend hosting (Free tier: Unlimited)
- [ ] **Stripe.com** - Payment processing (Free to start)
- [ ] **SendGrid.com** - Email sending (Free: 100 emails/day)
- [ ] **Sentry.io** - Error tracking (Free: 5K errors/month)
- [ ] **PostHog.com** - Analytics (Free: 1M events/month)

**Total Cost (Free Tier)**: $0/month  
**Estimated Production Cost**: $50-100/month

---

## 🎯 Deployment Option 1: Railway + Vercel (Recommended)

### Step 1: Deploy Backend to Railway (10 minutes)

#### 1.1 Create Railway Account

```bash
# Go to railway.app
# Sign up with GitHub
# Verify email
```

#### 1.2 Deploy Backend

```bash
# Railway Dashboard:
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose: sarperhorata/network-matching
4. Root directory: backend
5. Click "Deploy"

# Railway will auto-detect NestJS and deploy!
```

#### 1.3 Add PostgreSQL Database

```bash
# In Railway Project:
1. Click "New" → "Database" → "PostgreSQL"
2. Database will be created automatically
3. Railway will inject DATABASE_URL automatically
```

#### 1.4 Add Redis

```bash
# In Railway Project:
1. Click "New" → "Database" → "Redis"
2. Redis will be created automatically
3. Railway will inject REDIS_URL automatically
```

#### 1.5 Configure Environment Variables

```bash
# Railway Project → Backend Service → Variables

# Add these manually:
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-change-this
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://oniki.net

# Optional (add when ready):
SENTRY_DSN=https://xxx@sentry.io/xxx
SENDGRID_API_KEY=SG.xxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx

# Railway auto-provides:
# DATABASE_URL (from PostgreSQL)
# REDIS_URL (from Redis)
# PORT (automatic)
```

#### 1.6 Get Backend URL

```bash
# Railway will provide a URL like:
https://network-matching-production.up.railway.app

# Or add custom domain:
Settings → Domains → Add Domain → api.oniki.net
```

**✅ Backend deployed!** Test at: `https://your-backend-url/api/health`

---

### Step 2: Deploy Frontend to Vercel (5 minutes)

#### 2.1 Create Vercel Account

```bash
# Go to vercel.com
# Sign up with GitHub
# Verify email
```

#### 2.2 Import Project

```bash
# Vercel Dashboard:
1. Click "Add New..." → "Project"
2. Import Git Repository: sarperhorata/network-matching
3. Configure:
   - Framework Preset: Vite
   - Root Directory: frontend
   - Build Command: npm run build
   - Output Directory: dist
4. Click "Deploy"
```

#### 2.3 Configure Environment Variables

```bash
# Vercel Project → Settings → Environment Variables

# Add these:
VITE_API_URL=https://your-backend-url/api
VITE_WS_URL=https://your-backend-url

# Optional (when ready):
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_POSTHOG_KEY=phc_xxxxx
```

#### 2.4 Add Custom Domain

```bash
# Vercel Project → Settings → Domains

1. Add domain: oniki.net
2. Configure DNS:
   - Type: A
   - Name: @
   - Value: 76.76.21.21 (Vercel IP)
   
   - Type: CNAME
   - Name: www
   - Value: cname.vercel-dns.com

3. SSL: Auto-configured by Vercel ✅
```

**✅ Frontend deployed!** Visit: `https://oniki.net`

---

### Step 3: Update CORS & URLs (2 minutes)

```bash
# Railway Backend → Environment Variables
# Update:
FRONTEND_URL=https://oniki.net

# Redeploy backend (auto-triggers on variable change)
```

---

## 🎯 Deployment Option 2: Docker Compose (Self-Hosted)

### For VPS (DigitalOcean, AWS EC2, etc.)

```bash
# 1. SSH into your server
ssh root@your-server-ip

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. Clone repository
git clone https://github.com/sarperhorata/network-matching.git
cd network-matching

# 4. Create production .env file
cat > .env << EOF
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your-secure-password
DATABASE_NAME=oniki_net
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://oniki.net
VITE_API_URL=https://api.oniki.net/api
VITE_WS_URL=https://api.oniki.net
EOF

# 5. Start services
docker-compose up -d

# 6. Check status
docker-compose ps

# 7. View logs
docker-compose logs -f

# 8. Setup nginx reverse proxy (for SSL)
# Follow nginx configuration below
```

---

## 🔒 SSL/HTTPS Setup (Required for Production)

### Option 1: Vercel/Railway (Automatic) ✅

SSL is automatically configured. No action needed!

### Option 2: Let's Encrypt (Self-Hosted)

```bash
# Install Certbot
apt-get update
apt-get install certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d oniki.net -d www.oniki.net -d api.oniki.net

# Auto-renewal
certbot renew --dry-run

# Certificate will auto-renew every 90 days
```

---

## 📊 Post-Deployment Verification

### Backend Health Checks

```bash
# 1. API Health
curl https://api.oniki.net/api/health
# Expected: {"status":"ok","timestamp":"..."}

# 2. Swagger Docs
curl https://api.oniki.net/api/docs
# Should return HTML

# 3. Test Registration
curl -X POST https://api.oniki.net/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# 4. Database Connection
# Check Railway logs for successful connection

# 5. Redis Connection
# Check Railway logs for Redis connection
```

### Frontend Health Checks

```bash
# 1. Homepage loads
curl -I https://oniki.net
# Expected: 200 OK

# 2. PWA Manifest
curl https://oniki.net/manifest.webmanifest
# Should return JSON

# 3. Service Worker
curl https://oniki.net/sw.js
# Should return JavaScript

# 4. API Connectivity
# Open https://oniki.net in browser
# Try to register/login
# Check browser console for API calls
```

---

## 🔧 Environment Variables - Complete List

### Backend (.env for Railway)

```env
# Database (Auto-provided by Railway)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Or individual vars:
DATABASE_HOST=postgres-host
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=secure-password
DATABASE_NAME=oniki_net

# Redis (Auto-provided by Railway)
REDIS_URL=redis://host:6379

# Or individual vars:
REDIS_HOST=redis-host
REDIS_PORT=6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-CHANGE-THIS
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=production

# CORS
FRONTEND_URL=https://oniki.net

# Email (Optional - add when ready)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_FROM=noreply@oniki.net
EMAIL_FROM_NAME=Oniki Network

# Payment (Optional - add when ready)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Monitoring (Optional - add when ready)
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ENVIRONMENT=production

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Jitsi (Optional - for video calls)
JITSI_DOMAIN=meet.jit.si
JITSI_APP_ID=your-app-id
JITSI_SECRET=your-secret
```

### Frontend (.env for Vercel)

```env
# API URLs (REQUIRED)
VITE_API_URL=https://api.oniki.net/api
VITE_WS_URL=https://api.oniki.net

# Analytics (Optional - add when ready)
VITE_POSTHOG_KEY=phc_xxxxxxxxxxxxx
VITE_POSTHOG_HOST=https://app.posthog.com

# Monitoring (Optional - add when ready)
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx

# Google Analytics (Optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Stripe (Optional - for frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
```

---

## 🚨 Common Deployment Issues & Fixes

### Issue 1: Database Connection Failed

```bash
# Check:
1. DATABASE_URL is correct
2. PostgreSQL service is running
3. Network connectivity

# Fix Railway:
- Check PostgreSQL plugin status
- Verify environment variables
- Check service logs

# Test connection:
psql $DATABASE_URL
```

### Issue 2: CORS Errors

```bash
# Symptom: "Access blocked by CORS policy"

# Fix:
1. Update FRONTEND_URL in backend env vars
2. Ensure exact match (no trailing slash)
3. Redeploy backend

# Verify:
curl -I https://api.oniki.net/api/health \
  -H "Origin: https://oniki.net"
```

### Issue 3: WebSocket Connection Failed

```bash
# Symptom: Messages not working in real-time

# Fix:
1. Ensure WS_URL is correct (no /api suffix)
2. Check Socket.IO namespace
3. Verify firewall rules

# Test:
# Open browser console on frontend
# Check for WebSocket connection errors
```

### Issue 4: Build Failures

```bash
# Backend build fails:
1. Check Node version (20+ required)
2. Run: npm run build locally
3. Fix TypeScript errors
4. Push fixes

# Frontend build fails:
1. Check environment variables
2. Run: npm run build locally
3. Fix missing imports
4. Push fixes
```

---

## 📦 Database Migration (Production)

### First-Time Setup

```bash
# Railway automatically runs synchronize:true
# For production, use migrations:

# 1. Generate migration locally
cd backend
npm run migration:generate -- src/migrations/InitialSchema

# 2. Commit migration files
git add src/migrations/
git commit -m "feat: Add database migrations"
git push

# 3. Railway will auto-run migrations on deploy
```

### Manual Migration (if needed)

```bash
# SSH into Railway container (if needed)
railway run npm run migration:run
```

---

## 🎯 Deployment Timeline

### Quick Deploy (Same Day)

```
Hour 1: Setup Accounts
├── Railway signup (5 min)
├── Vercel signup (5 min)
└── Configure GitHub access (5 min)

Hour 2: Backend Deploy
├── Create Railway project (5 min)
├── Add PostgreSQL (2 min)
├── Add Redis (2 min)
├── Configure env vars (10 min)
└── Deploy & verify (20 min)

Hour 3: Frontend Deploy
├── Import to Vercel (5 min)
├── Configure env vars (5 min)
├── Deploy (5 min)
└── Add custom domain (15 min)

Hour 4: Testing & Verification
├── API health checks (10 min)
├── Frontend functionality (20 min)
├── End-to-end testing (20 min)
└── Fix any issues (10 min)

TOTAL: ~4 hours to production! 🚀
```

---

## 🌐 DNS Configuration

### Domain Setup (oniki.net)

**For Vercel Frontend:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**For Railway Backend (api.oniki.net):**
```
# Railway Dashboard → Custom Domain
1. Add domain: api.oniki.net
2. Follow Railway's DNS instructions
3. SSL auto-configured ✅
```

**Verification:**
```bash
# Wait for DNS propagation (5-30 minutes)
dig oniki.net
dig api.oniki.net

# Test:
curl https://oniki.net
curl https://api.oniki.net/api/health
```

---

## 🔐 Production Security Setup

### Immediate Security Tasks

```bash
# 1. Generate strong JWT secret
openssl rand -base64 32

# 2. Set production NODE_ENV
NODE_ENV=production

# 3. Enable HTTPS only
# (Auto-enabled by Railway/Vercel)

# 4. Add rate limiting
# Already in code, just needs activation

# 5. Enable Helmet.js
cd backend
npm install helmet
# Update main.ts (instructions in SECURITY_AUDIT.md)
```

---

## 📊 Monitoring Setup (Post-Deploy)

### Sentry Error Tracking

```bash
# 1. Create Sentry projects
#    - Project 1: Oniki Backend (Node.js)
#    - Project 2: Oniki Frontend (React)

# 2. Copy DSNs

# 3. Add to Railway backend env vars:
SENTRY_DSN=https://xxx@sentry.io/backend-project-id

# 4. Add to Vercel frontend env vars:
VITE_SENTRY_DSN=https://xxx@sentry.io/frontend-project-id

# 5. Redeploy both services

# 6. Test by triggering an error
# 7. Check Sentry dashboard
```

### PostHog Analytics

```bash
# 1. Create PostHog project

# 2. Copy API key

# 3. Add to Vercel env vars:
VITE_POSTHOG_KEY=phc_xxxxxxxxxxxxxxx

# 4. Redeploy frontend

# 5. Visit site and check PostHog dashboard
```

### UptimeRobot Monitoring

```bash
# 1. Create UptimeRobot account (free)

# 2. Add monitors:
#    - https://oniki.net (every 5 min)
#    - https://api.oniki.net/api/health (every 5 min)

# 3. Add alert contacts (email, Slack)

# 4. Done! You'll get alerts if site goes down
```

---

## 🧪 Production Testing Checklist

### Smoke Tests

```bash
# Run these immediately after deployment

# 1. Backend Health
✅ curl https://api.oniki.net/api/health

# 2. Swagger Docs
✅ open https://api.oniki.net/api/docs

# 3. Frontend Loads
✅ open https://oniki.net

# 4. Registration
✅ Register new account on https://oniki.net/register

# 5. Login
✅ Login with test account

# 6. Create Profile
✅ Update profile with industries/interests

# 7. Browse Events
✅ Visit /events page

# 8. WebSocket Connection
✅ Open /messages, check browser console

# 9. PWA Install
✅ Check for install prompt

# 10. Mobile Responsive
✅ Test on mobile device
```

### Load Testing (Optional)

```bash
# Install k6
brew install k6

# Run load test
k6 run load-test.js

# Expected results:
# - p95 latency <500ms
# - Error rate <1%
# - 100 concurrent users supported
```

---

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push

**Railway** (already configured):
```bash
# Any push to main → Auto-deploys backend
git push origin main
# Wait 2-3 minutes, backend auto-updates!
```

**Vercel** (already configured):
```bash
# Any push to main → Auto-deploys frontend
git push origin main
# Wait 1-2 minutes, frontend auto-updates!
```

**GitHub Actions** (already configured):
```yaml
# On push to main:
1. Run tests ✅
2. Build application ✅
3. Deploy to production ✅
4. Create release ✅
```

---

## 🗄️ Database Backup Strategy

### Railway Auto-Backups

```bash
# Railway Pro plan includes:
- Daily automated backups
- Point-in-time recovery
- 7-day retention

# Manual backup:
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore:
psql $DATABASE_URL < backup-20251018.sql
```

### Backup Script (Cron Job)

```bash
# Create backup script
cat > /usr/local/bin/backup-oniki-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/oniki"
mkdir -p $BACKUP_DIR

# Backup database
pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/oniki-$DATE.sql.gz

# Upload to S3 (optional)
# aws s3 cp $BACKUP_DIR/oniki-$DATE.sql.gz s3://backups/oniki/

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: oniki-$DATE.sql.gz"
EOF

chmod +x /usr/local/bin/backup-oniki-db.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /usr/local/bin/backup-oniki-db.sh" | crontab -
```

---

## 🚨 Rollback Plan

### If Deployment Fails

**Railway:**
```bash
# Railway → Deployments → Select previous deployment → Rollback
# Or redeploy from specific commit:
git revert HEAD
git push origin main
```

**Vercel:**
```bash
# Vercel → Deployments → Previous deployment → Promote to Production
```

**Database Rollback:**
```bash
# Restore from backup
psql $DATABASE_URL < backup-YYYYMMDD.sql
```

---

## 📈 Scaling Considerations

### When to Scale Up?

**Metrics to Watch:**
- CPU usage >70% sustained
- Memory usage >80% sustained
- API response time >500ms
- Database connections maxed out
- >1000 concurrent users

### Railway Scaling

```bash
# Railway Pro Plan ($20/month):
- More resources
- Custom domains
- Team collaboration
- Priority support

# Horizontal Scaling (Future):
- Multiple backend instances
- Load balancer
- Database read replicas
```

---

## 🎯 Production Optimization

### After Successful Deploy

**Week 1:**
- [ ] Monitor error rates (Sentry)
- [ ] Check performance metrics
- [ ] Optimize slow queries
- [ ] Add caching where needed
- [ ] Set up alerts

**Week 2:**
- [ ] Run Lighthouse audit
- [ ] Optimize bundle size
- [ ] Add CDN for assets
- [ ] Implement Redis caching
- [ ] Database indexing

**Month 1:**
- [ ] Review security (SECURITY_AUDIT.md)
- [ ] Add Helmet.js
- [ ] Implement rate limiting
- [ ] Set up backups
- [ ] Load testing

---

## 📝 Deployment Costs

### Free Tier (0-100 users)

```
Railway:
- PostgreSQL: Free ($5 credit/month)
- Redis: Free
- Backend hosting: Free

Vercel:
- Frontend hosting: Free (unlimited)
- Bandwidth: 100GB/month
- Custom domain: Free

Total: $0/month
```

### Paid Tier (100-1000 users)

```
Railway Pro: $20/month
- Better resources
- Custom domains
- Team features

Vercel Pro: $20/month
- Analytics
- More bandwidth
- Team features

Monitoring:
- Sentry: $26/month
- PostHog: Free (still)

Total: ~$70/month
```

### Enterprise (1000+ users)

```
Railway: ~$100/month (usage-based)
Vercel: ~$100/month
Monitoring: ~$150/month
CDN: ~$50/month

Total: ~$400/month
```

---

## 🎊 Deployment Complete!

### ✅ Success Criteria

After deployment, you should have:

- ✅ Backend running at https://api.oniki.net
- ✅ Frontend running at https://oniki.net
- ✅ SSL/HTTPS enabled
- ✅ Database connected
- ✅ Redis connected
- ✅ Swagger docs accessible
- ✅ User registration working
- ✅ Login working
- ✅ Real-time messaging working
- ✅ PWA installable
- ✅ Monitoring active
- ✅ Auto-deployment configured

### 📞 Support

If you encounter issues:
1. Check Railway/Vercel logs
2. Review SECURITY_AUDIT.md
3. Check GitHub Actions runs
4. Test locally with Docker
5. Review deployment logs

---

## 🚀 Quick Deploy Script

Save this for quick reference:

```bash
#!/bin/bash
echo "🚀 Oniki.net Production Deployment"
echo "=================================="
echo ""
echo "Step 1: Deploy Backend to Railway"
echo "1. Go to railway.app"
echo "2. New Project → Deploy from GitHub"
echo "3. Select: network-matching/backend"
echo "4. Add PostgreSQL + Redis"
echo "5. Add environment variables"
echo ""
echo "Step 2: Deploy Frontend to Vercel"
echo "1. Go to vercel.com"
echo "2. Import from GitHub"
echo "3. Select: network-matching/frontend"
echo "4. Add environment variables"
echo ""
echo "Step 3: Configure Domain"
echo "1. Vercel: Add oniki.net"
echo "2. Railway: Add api.oniki.net"
echo ""
echo "Done! Visit https://oniki.net 🎉"
```

---

**Last Updated**: October 18, 2025  
**Deployment Time**: ~4 hours  
**Cost**: $0/month (free tier) to $400/month (enterprise)  
**Next**: Deploy and launch! 🚀

