# 🚀 TARANG DEPLOYMENT GUIDE

## Quick Deploy (Production Ready)

### Prerequisites
- GitHub account with the repository
- [Neon](https://neon.tech) account (PostgreSQL)
- [Upstash](https://upstash.com) account (Redis)
- [Vercel](https://vercel.com) account (Frontend)
- [Render](https://render.com) account (Backend)

---

## Step 1: Generate Secrets

```bash
# Generate JWT secret (64 characters)
python -c "import secrets; print('JWT_SECRET=' + secrets.token_urlsafe(64))"

# Generate encryption key (exactly 32 bytes for AES-256)
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32)[:32])"
```

**Save these securely - you'll need them for deployment!**

---

## Step 2: Set Up Database (Neon)

1. Go to [Neon.tech](https://neon.tech) → Sign up (free)
2. Create new project: `tarang-production`
3. Region: Choose closest to your users
4. Copy the connection string (starts with `postgresql://`)
5. Save as `DATABASE_URL`

---

## Step 3: Set Up Redis (Upstash)

1. Go to [Upstash.com](https://upstash.com) → Sign up (free)
2. Create database: `tarang-cache`
3. Region: Same as your Neon database
4. Copy the Redis URL (starts with `redis://` or `rediss://`)
5. Save as `REDIS_URL`

---

## Step 4: Deploy Backend (Render)

1. Go to [Render.com](https://render.com) → Sign up
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Settings:
   - **Name:** `tarang-api`
   - **Root Directory:** `tarang-api`
   - **Environment:** `Docker`
   - **Dockerfile Path:** `Dockerfile`
   - **Plan:** Free

5. **Environment Variables** (click "Add Environment Variable"):
   ```
   ENVIRONMENT=production
   SECRET_KEY=<your-32-byte-key>
   JWT_SECRET=<your-64-char-key>
   DATABASE_URL=<your-neon-connection-string>
   REDIS_URL=<your-upstash-redis-url>
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```

6. Click **Create Web Service**
7. Wait for deployment (5-10 minutes)
8. Copy the URL (e.g., `https://tarang-api.onrender.com`)

---

## Step 5: Deploy Frontend (Vercel)

1. Go to [Vercel.com](https://vercel.com) → Sign up
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `tarang-web`
   - **Build Command:** `npm run build`
   - **Output Directory:** Leave empty (auto-detected)

5. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://tarang-api.onrender.com
   ```
   *(Use your Render backend URL from Step 4)*

6. Click **Deploy**
7. Wait for deployment (2-3 minutes)
8. Your app is live! 🎉

---

## Step 6: Update Backend CORS

1. Go back to Render dashboard
2. Click on your `tarang-api` service
3. Go to **Environment** tab
4. Update `ALLOWED_ORIGINS` with your Vercel URL:
   ```
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```
5. Click **Save Changes** (auto-redeploys)

---

## Step 7: Test Your Deployment

1. Visit your Vercel URL
2. Test registration: Create a new account
3. Test login: Sign in with your account
4. Test screening: Run a screening session
5. Test reports: View generated reports

### Health Check
Visit: `https://your-api.onrender.com/health`

Should return:
```json
{
  "status": "healthy",
  "database_type": "PostgreSQL",
  "is_production": true
}
```

---

## Step 8: Keep It Running (Optional but Recommended)

Render free tier sleeps after 15 minutes of inactivity. To keep it awake:

1. Go to [Cron-job.org](https://cron-job.org) (free)
2. Create account → Add new cron job
3. **URL:** `https://your-api.onrender.com/health`
4. **Schedule:** Every 10 minutes
5. Save

This pings your backend every 10 minutes to keep it active.

---

## 🎯 Final Checklist

Before sharing your app:

- [ ] Backend is accessible at `/health` endpoint
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] Login/logout works
- [ ] Screening session completes
- [ ] Reports are generated
- [ ] WebSocket connections work (live screening)
- [ ] No console errors in browser
- [ ] Mobile responsive design works

---

## 🔒 Security Notes

### What's Protected:
✅ JWT authentication on all endpoints  
✅ Rate limiting on login (5 req/min)  
✅ SSL/TLS encryption (HTTPS)  
✅ PII encrypted in database (AES-256)  
✅ Environment variables never committed  
✅ Secrets properly separated  
✅ CORS properly configured  

### Important:
- Never commit `.env` files
- Rotate secrets every 90 days
- Monitor logs for suspicious activity
- Keep dependencies updated
- Use strong passwords for all accounts

---

## 📊 Monitoring

### Logs
**Backend:** Render dashboard → Logs tab  
**Frontend:** Vercel dashboard → Deployments → View Function Logs

### Uptime Monitoring
Set up on [UptimeRobot](https://uptimerobot.com) or [Cron-job.org](https://cron-job.org)

---

## 🆘 Troubleshooting

### Backend won't start
- Check environment variables are set correctly
- Verify DATABASE_URL format: `postgresql://user:pass@host/db?sslmode=require`
- Check Render logs for error messages

### Frontend can't reach backend
- Verify `NEXT_PUBLIC_API_URL` matches your Render URL
- Check CORS settings in backend `ALLOWED_ORIGINS`
- Ensure no trailing slashes in URLs

### Database connection fails
- Verify Neon database is active
- Check connection string includes `?sslmode=require`
- Ensure database isn't in sleep mode (Neon free tier)

### Redis connection fails
- Verify Upstash Redis is active
- Check if using `redis://` or `rediss://` (SSL)
- Ensure connection string format is correct

---

## 📈 Scaling Up

When you outgrow free tiers:

### Backend (Render)
- Upgrade to Starter ($7/month) for:
  - No sleep time
  - Better performance
  - More concurrent connections

### Database (Neon)
- Pro plan ($19/month) for:
  - More storage
  - Better performance
  - Branch management

### Frontend (Vercel)
- Pro plan ($20/month) for:
  - Better analytics
  - Team collaboration
  - Advanced features

---

## 🎓 Local Development

To run locally:

```bash
# 1. Clone repository
git clone https://github.com/SRG2004/tarang-autism.git
cd tarang-autism

# 2. Set up environment files
cp .env.example .env
# Edit .env with your local settings

# 3. Start with Docker Compose
docker-compose up --build
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🎉 You're Live!

Your TARANG platform is now deployed and accessible worldwide! 

**Share your app:**
- Frontend URL: `https://your-app.vercel.app`
- API Docs: `https://your-api.onrender.com/docs`

Good luck! 🚀