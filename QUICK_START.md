# 🚀 TARANG - Quick Start Guide

## 📖 What is TARANG?

**TARANG (AI for Bharat)** is an AI-powered autism screening platform built for the AWS "AI for Bharat" hackathon. It uses Amazon Bedrock, Polly, and RDS to provide accessible, multilingual autism screening for Indian families.

---

## ⚡ 5-Minute Overview

### What You Have
✅ Production-ready FastAPI backend  
✅ Next.js 15 frontend with React 19  
✅ AWS Bedrock (Claude 3.5 Sonnet) integration  
✅ Amazon Polly text-to-speech (8+ languages)  
✅ AWS RDS PostgreSQL with SSL  
✅ Complete deployment configuration  
✅ Comprehensive documentation  

### What You Need
- AWS Account (free tier eligible)
- GitHub account
- 2-3 hours for complete setup
- Credit/debit card for AWS verification

---

## 📚 Documentation Index

### 🎯 Start Here
1. **`DEPLOYMENT_READY_SUMMARY.md`** - Overview of everything
2. **`AWS_COMPLETE_SETUP_GUIDE.md`** - Complete step-by-step setup (2-3 hours)
3. **`AWS_SETUP_CHECKLIST.md`** - Track your progress

### 🏗️ Architecture
4. **`AWS_ARCHITECTURE_DIAGRAM.md`** - Visual system architecture
5. **`README.md`** - Project overview and features

### 🗄️ Database Setup
6. **`AWS_RDS_SETUP.md`** - Complete RDS PostgreSQL setup
7. **`DATABASE_CONFIG_GUIDE.md`** - Configuration quick reference
8. **`RDS_MIGRATION_SUMMARY.md`** - Technical migration details
9. **`QUICK_RDS_CONFIG.md`** - Fast RDS setup

### 🚀 Deployment
10. **`AWS_APP_RUNNER_DEPLOYMENT.md`** - Backend deployment guide
11. **`DEPLOYMENT_SUMMARY.md`** - Deployment overview
12. **`QUICK_DEPLOY.md`** - Fast deployment reference

### 🔧 API & Features
13. **`POLLY_API_GUIDE.md`** - Text-to-speech API reference
14. **`AWS_MIGRATION_SUMMARY.md`** - AWS migration overview

---

## 🎯 Quick Setup Path

### Option 1: Complete Setup (Recommended)
**Time:** 2-3 hours  
**Follow:** `AWS_COMPLETE_SETUP_GUIDE.md`

This covers:
1. AWS account creation
2. IAM user and access keys
3. RDS PostgreSQL setup
4. Bedrock model access
5. S3 bucket creation
6. Redis setup (optional)
7. Security key generation
8. App Runner deployment
9. Amplify deployment
10. Testing

### Option 2: Quick Deploy (If you have AWS setup)
**Time:** 30 minutes  
**Follow:** `QUICK_DEPLOY.md`

This assumes you already have:
- AWS account with credentials
- RDS database created
- Environment variables ready

---

## 📋 Environment Variables Needed

### Backend (AWS App Runner)
```env
# AWS Credentials
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalr...
AWS_REGION=ap-south-1

# Database
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_NAME=tarang_production
DB_USER=tarang_admin
DB_PASSWORD=your_password
DB_SSL=require

# Security
SECRET_KEY=your_32_byte_key
JWT_SECRET=your_64_char_secret

# Services
S3_BUCKET_NAME=tarang-screening-data
REDIS_URL=redis://your-redis:6379
ALLOWED_ORIGINS=https://your-frontend.amplifyapp.com
ENVIRONMENT=production
```

### Frontend (AWS Amplify)
```env
NEXT_PUBLIC_API_URL=https://your-backend.awsapprunner.com
```

**Where to get these?** See `AWS_COMPLETE_SETUP_GUIDE.md` Part 2-8

---

## 🔑 Key AWS Services

### 1. Amazon RDS PostgreSQL
**Purpose:** Database storage  
**Setup:** `AWS_RDS_SETUP.md`  
**Cost:** $0 (free tier) or $25/month  

### 2. Amazon Bedrock
**Purpose:** AI clinical summaries (Claude 3.5 Sonnet)  
**Setup:** Automatic! Models enable on first use  
**Cost:** ~$3-10/month (pay per use)  
**Note:** First-time Anthropic users may need to submit use case details  

### 3. Amazon Polly
**Purpose:** Text-to-speech (8+ Indian languages)  
**Setup:** No setup needed (available by default)  
**Cost:** ~$1-5/month (pay per use)  

### 4. Amazon S3
**Purpose:** File storage (videos, PDFs)  
**Setup:** Create bucket in console  
**Cost:** ~$0.50/month  

### 5. AWS App Runner
**Purpose:** Backend deployment  
**Setup:** Connect GitHub, configure, deploy  
**Cost:** ~$5-10/month  

### 6. AWS Amplify
**Purpose:** Frontend deployment  
**Setup:** Connect GitHub, configure, deploy  
**Cost:** ~$0-5/month  

---

## 💰 Cost Summary

### With Free Tier (First Year)
- **Total:** $10-30/month
- RDS: $0 (free tier)
- App Runner: $5-10
- Amplify: $0-5
- S3: $0.50
- Bedrock: $3-10
- Polly: $1-5

### Production (After Free Tier)
- **Total:** $65-90/month
- RDS: $27.50
- App Runner: $10-20
- Amplify: $5
- S3: $0.50
- ElastiCache: $15
- Bedrock: $5-15
- Polly: $2-10

---

## 🎯 Deployment Steps (High Level)

### Step 1: AWS Account Setup
1. Create AWS account
2. Create IAM user with permissions
3. Generate access keys
4. Save credentials securely

### Step 2: Database Setup
1. Create RDS PostgreSQL instance
2. Configure security group
3. Get connection details
4. Test connection

### Step 3: AWS Services
1. ~~Enable Bedrock (Claude 3.5 Sonnet)~~ **Auto-enabled on first use!**
2. Create S3 bucket
3. Setup Redis (optional)
4. Generate security keys

### Step 4: Backend Deployment
1. Push code to GitHub
2. Create App Runner service
3. Add environment variables
4. Deploy and test

### Step 5: Frontend Deployment
1. Create Amplify app
2. Connect GitHub
3. Add NEXT_PUBLIC_API_URL
4. Deploy and test

### Step 6: Final Testing
1. Test health endpoint
2. Test database connection
3. Test user registration/login
4. Test screening flow
5. Test Polly text-to-speech

---

## ✅ Pre-Deployment Checklist

### Code Ready
- [ ] All code committed to GitHub
- [ ] No secrets in code
- [ ] `.env.example` updated
- [ ] Documentation reviewed

### AWS Account
- [ ] AWS account created
- [ ] IAM user created
- [ ] Access keys generated
- [ ] Billing alerts set up

### Services Configured
- [ ] RDS database created
- [ ] ~~Bedrock access granted~~ **Auto-enabled on first use!**
- [ ] S3 bucket created
- [ ] Redis setup (optional)

### Environment Variables
- [ ] All backend variables ready
- [ ] Frontend variable ready
- [ ] Security keys generated
- [ ] Passwords saved securely

### Testing
- [ ] Local testing complete
- [ ] Docker build successful
- [ ] Database connection tested
- [ ] API endpoints tested

---

## 🆘 Common Issues & Solutions

### Issue: Can't connect to RDS
**Solution:** Check security group allows port 5432 from 0.0.0.0/0

### Issue: Bedrock access denied
**Solution:** Request model access in Bedrock console (us-east-1)

### Issue: App Runner deployment fails
**Solution:** Check CloudWatch logs, verify environment variables

### Issue: Frontend can't reach backend
**Solution:** Update ALLOWED_ORIGINS in backend with frontend URL

### Issue: Database SSL error
**Solution:** Set `DB_SSL=require` (not verify-full)

---

## 📞 Getting Help

### Documentation
- **Complete Setup:** `AWS_COMPLETE_SETUP_GUIDE.md`
- **Troubleshooting:** Each guide has troubleshooting section
- **Architecture:** `AWS_ARCHITECTURE_DIAGRAM.md`

### AWS Resources
- **Console:** https://console.aws.amazon.com
- **Documentation:** https://docs.aws.amazon.com
- **Support:** https://console.aws.amazon.com/support

### Project Resources
- **GitHub:** Your repository
- **API Docs:** https://your-backend.awsapprunner.com/docs

---

## 🎉 Success Criteria

You're ready when:
- ✅ Backend health check returns 200
- ✅ Frontend loads without errors
- ✅ User can register and login
- ✅ Screening flow works end-to-end
- ✅ "Read Aloud" button works
- ✅ Database queries execute
- ✅ All tests passing

---

## 🏆 Hackathon Submission

**Track:** AWS "AI for Bharat" - Track 5: Healthcare & Life Sciences

**Key Features to Highlight:**
1. Amazon Bedrock (Claude 3.5 Sonnet) - not GPT
2. Amazon Polly - 8+ Indian languages
3. India-first architecture (ap-south-1)
4. Data sovereignty compliance
5. Production-ready deployment

**Demo Checklist:**
- [ ] Show user registration
- [ ] Show screening flow
- [ ] Demonstrate "Read Aloud" (Polly)
- [ ] Show AI-generated clinical summary (Bedrock)
- [ ] Show multilingual support
- [ ] Explain India-first architecture
- [ ] Highlight cost optimization

---

## 📖 Recommended Reading Order

### First Time Setup
1. Read this file (QUICK_START.md)
2. Review `DEPLOYMENT_READY_SUMMARY.md`
3. Follow `AWS_COMPLETE_SETUP_GUIDE.md`
4. Use `AWS_SETUP_CHECKLIST.md` to track progress

### Database Focus
1. `AWS_RDS_SETUP.md` - Complete setup
2. `DATABASE_CONFIG_GUIDE.md` - Configuration
3. `QUICK_RDS_CONFIG.md` - Quick reference

### Deployment Focus
1. `AWS_APP_RUNNER_DEPLOYMENT.md` - Backend
2. `DEPLOYMENT_SUMMARY.md` - Overview
3. `QUICK_DEPLOY.md` - Quick reference

### Architecture Understanding
1. `AWS_ARCHITECTURE_DIAGRAM.md` - Visual diagrams
2. `README.md` - Project overview
3. `AWS_MIGRATION_SUMMARY.md` - Technical details

---

## 🚀 Next Steps

1. **Read** `DEPLOYMENT_READY_SUMMARY.md` for complete overview
2. **Follow** `AWS_COMPLETE_SETUP_GUIDE.md` for step-by-step setup
3. **Track** progress with `AWS_SETUP_CHECKLIST.md`
4. **Deploy** to AWS App Runner and Amplify
5. **Test** all functionality
6. **Prepare** hackathon demo

---

## 💡 Pro Tips

1. **Start with free tier** - Use db.t3.micro for RDS
2. **Use Upstash Redis** - Free tier instead of ElastiCache
3. **Set billing alerts** - Avoid surprise charges
4. **Test locally first** - Use Docker to test before deploying
5. **Save credentials** - Use password manager for all keys
6. **Monitor costs** - Check AWS Cost Explorer daily
7. **Enable backups** - 7-day retention for RDS
8. **Use CloudWatch** - Monitor logs and metrics

---

## ✨ What Makes TARANG Special

1. **Amazon Bedrock** - Claude 3.5 Sonnet (not GPT)
2. **True Vernacular** - Amazon Polly for actual speech
3. **India-First** - All services in ap-south-1 (Mumbai)
4. **Clinical Rigor** - Evidence-based with confidence scores
5. **Production-Ready** - Auto-scaling, monitoring, backups
6. **Cost-Optimized** - Free tier eligible, ~$10-30/month
7. **Accessible** - Works on ₹8,000 smartphones with 2G
8. **Zero-Cost for Parents** - Free screening from home

---

**Ready to deploy! 🚀**

**For detailed instructions, see:** `AWS_COMPLETE_SETUP_GUIDE.md`

**Track 5: AI for Healthcare & Life Sciences**  
**Built with ❤️ for better autism care accessibility in India**
