# AWS Setup Checklist - TARANG

Use this checklist to track your AWS setup progress.

## ✅ Part 1: AWS Account (15 min)

- [ ] Created AWS account
- [ ] Verified email
- [ ] Added payment method
- [ ] Completed identity verification
- [ ] Selected Basic support plan

## ✅ Part 2: IAM User & Access Keys (20 min)

- [ ] Created IAM user: `tarang-admin`
- [ ] Attached required policies:
  - [ ] AmazonRDSFullAccess
  - [ ] AmazonBedrockFullAccess
  - [ ] AmazonPollyFullAccess
  - [ ] AmazonS3FullAccess
  - [ ] AWSAppRunnerFullAccess
  - [ ] CloudWatchFullAccess
- [ ] Created access keys
- [ ] Saved access keys securely:
  - [ ] AWS_ACCESS_KEY_ID
  - [ ] AWS_SECRET_ACCESS_KEY

## ✅ Part 3: Amazon RDS PostgreSQL (30 min)

- [ ] Created RDS instance: `tarang-production-db`
- [ ] Configured settings:
  - [ ] Engine: PostgreSQL 15.x
  - [ ] Instance: db.t3.micro or db.t3.small
  - [ ] Storage: 20 GB
  - [ ] Region: ap-south-1
- [ ] Set master credentials
- [ ] Enabled public access
- [ ] Created security group
- [ ] Configured inbound rule (port 5432)
- [ ] Saved database credentials:
  - [ ] DB_HOST
  - [ ] DB_PORT
  - [ ] DB_NAME
  - [ ] DB_USER
  - [ ] DB_PASSWORD
  - [ ] DB_SSL=require
- [ ] Tested connection with psql

## ✅ Part 4: Amazon Bedrock (5 min)

- [ ] Navigated to Bedrock (us-east-1)
- [ ] **CRITICAL: Verified payment method is valid**
  - [ ] Go to AWS Billing → Payment methods
  - [ ] Check card shows "Valid" status
  - [ ] Card is set as "Default"
  - [ ] No warning icons or errors
- [ ] Verified model catalog access
- [ ] Noted: Models auto-enable on first use
- [ ] (Optional) Tested Claude 3.5 Sonnet in Playground
- [ ] Ready for first-time use case submission (if prompted)
- [ ] **If getting INVALID_PAYMENT_INSTRUMENT error:**
  - [ ] See `PAYMENT_METHOD_TROUBLESHOOTING.md`
  - [ ] Update payment method
  - [ ] Wait 5-10 minutes
  - [ ] Retry Bedrock access

## ✅ Part 5: Amazon Polly (No setup needed)

- [ ] Verified Polly is available (default)

## ✅ Part 6: Amazon S3 (10 min)

- [ ] Created S3 bucket
- [ ] Bucket name: `tarang-screening-data-[unique-id]`
- [ ] Region: ap-south-1
- [ ] Enabled encryption
- [ ] Blocked public access
- [ ] Saved bucket name:
  - [ ] S3_BUCKET_NAME

## ✅ Part 7: Redis (Optional, 15 min)

Choose one:

### Option A: AWS ElastiCache
- [ ] Created Redis cluster
- [ ] Instance: cache.t3.micro
- [ ] Saved endpoint:
  - [ ] REDIS_URL

### Option B: Upstash Redis
- [ ] Created Upstash account
- [ ] Created Redis database
- [ ] Saved connection URL:
  - [ ] REDIS_URL

## ✅ Part 8: Security Keys (5 min)

- [ ] Generated SECRET_KEY (32 bytes)
- [ ] Generated JWT_SECRET (64 chars)
- [ ] Saved both securely

## ✅ Part 9: AWS App Runner (30 min)

- [ ] Pushed code to GitHub
- [ ] Connected GitHub to App Runner
- [ ] Created service: `tarang-api-production`
- [ ] Configured build settings:
  - [ ] Runtime: Python 3
  - [ ] Build command: `pip install -r requirements.txt`
  - [ ] Start command: `./start.sh`
  - [ ] Port: 8080
- [ ] Added ALL environment variables:
  - [ ] DB_HOST
  - [ ] DB_PORT
  - [ ] DB_NAME
  - [ ] DB_USER
  - [ ] DB_PASSWORD
  - [ ] DB_SSL
  - [ ] SECRET_KEY
  - [ ] JWT_SECRET
  - [ ] AWS_ACCESS_KEY_ID
  - [ ] AWS_SECRET_ACCESS_KEY
  - [ ] AWS_REGION
  - [ ] S3_BUCKET_NAME
  - [ ] REDIS_URL (if using)
  - [ ] ALLOWED_ORIGINS
  - [ ] ENVIRONMENT=production
- [ ] Configured auto-scaling (1-5 instances)
- [ ] Set health check path: `/health`
- [ ] Deployed successfully
- [ ] Saved service URL:
  - [ ] Backend URL: https://________.awsapprunner.com
- [ ] Tested health endpoint
- [ ] Tested API docs

## ✅ Part 10: AWS Amplify (20 min)

- [ ] Connected GitHub repository
- [ ] Configured build settings
- [ ] Added environment variable:
  - [ ] NEXT_PUBLIC_API_URL
- [ ] Deployed successfully
- [ ] Saved frontend URL:
  - [ ] Frontend URL: https://________.amplifyapp.com
- [ ] Updated backend CORS with frontend URL
- [ ] Tested frontend in browser

## ✅ Part 11: Final Testing (10 min)

- [ ] Backend health check works
- [ ] Database connection successful
- [ ] Frontend loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Polly text-to-speech works
- [ ] Bedrock AI responses work

## 📝 All Environment Variables Collected

```env
# AWS Credentials
AWS_ACCESS_KEY_ID=________________
AWS_SECRET_ACCESS_KEY=________________
AWS_REGION=ap-south-1

# Database
DB_HOST=________________
DB_PORT=5432
DB_NAME=tarang_production
DB_USER=tarang_admin
DB_PASSWORD=________________
DB_SSL=require

# Security
SECRET_KEY=________________
JWT_SECRET=________________

# AWS Services
S3_BUCKET_NAME=________________
REDIS_URL=________________

# Application
ENVIRONMENT=production
ALLOWED_ORIGINS=________________

# Frontend
NEXT_PUBLIC_API_URL=________________
```

## 🔒 Security Checklist

- [ ] All passwords are strong (16+ chars)
- [ ] Access keys saved in password manager
- [ ] No credentials committed to Git
- [ ] RDS encryption enabled
- [ ] S3 bucket not public
- [ ] SSL enabled for database
- [ ] Security groups properly configured
- [ ] Backup retention enabled

## 💰 Cost Monitoring

- [ ] Set up billing alerts
- [ ] Reviewed cost estimates
- [ ] Enabled free tier (if eligible)
- [ ] Configured auto-scaling limits

## 📚 Documentation

- [ ] Saved all URLs and credentials
- [ ] Documented architecture
- [ ] Created runbook for team
- [ ] Set up monitoring dashboard

## 🎉 Ready for Hackathon!

- [ ] All services deployed
- [ ] All tests passing
- [ ] Demo prepared
- [ ] Presentation ready

---

**Estimated Total Time:** 2-3 hours  
**Estimated Monthly Cost:** $5-15 (with free tier) or $50-80 (production)

**Need Help?** See `AWS_COMPLETE_SETUP_GUIDE.md` for detailed instructions.
