# Quick Deploy to AWS App Runner - TARANG API

## ⚡ Fast Track Deployment

### 1️⃣ Prepare Environment Variables

Copy these to AWS App Runner console:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
SECRET_KEY=your-32-byte-secret-key
JWT_SECRET=your-64-char-jwt-secret
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
REDIS_URL=redis://default:password@host:port
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### 2️⃣ Push to GitHub

```bash
git add .
git commit -m "chore: Configure for AWS App Runner"
git push origin main
```

### 3️⃣ Create App Runner Service

**AWS Console → App Runner → Create Service**

| Setting | Value |
|---------|-------|
| **Source** | GitHub repository |
| **Repository** | `your-username/tarang-autism` |
| **Branch** | `main` |
| **Source directory** | `tarang-api` |
| **Runtime** | Python 3 |
| **Build command** | `pip install -r requirements.txt` |
| **Start command** | `./start.sh` |
| **Port** | `8080` |
| **CPU** | 2 vCPU |
| **Memory** | 4 GB |
| **Min instances** | 1 |
| **Max instances** | 5 |
| **Health check path** | `/health` |

### 4️⃣ Add Environment Variables

In App Runner console, add all variables from Step 1.

### 5️⃣ Deploy & Test

```bash
# Wait for deployment (5-10 minutes)
# Then test:

curl https://your-app-url.ap-south-1.awsapprunner.com/health
```

## ✅ What's Configured

- ✅ Port 8080 (App Runner default)
- ✅ Gunicorn with Uvicorn workers
- ✅ Health check endpoint
- ✅ Graceful shutdown
- ✅ Auto-scaling
- ✅ Production logging

## 📖 Full Documentation

See `AWS_APP_RUNNER_DEPLOYMENT.md` for complete guide.

## 🆘 Quick Troubleshooting

**Service won't start?**
- Check CloudWatch logs
- Verify environment variables
- Test locally: `docker build -t tarang-api . && docker run -p 8080:8080 tarang-api`

**Health check failing?**
- Test: `curl http://localhost:8080/health`
- Check database connection
- Verify AWS credentials

**Need help?**
- Review `DEPLOYMENT_SUMMARY.md`
- Check `AWS_APP_RUNNER_DEPLOYMENT.md`
- View CloudWatch logs

## 🚀 You're Ready!

All files are configured. Just push to GitHub and create the App Runner service!
