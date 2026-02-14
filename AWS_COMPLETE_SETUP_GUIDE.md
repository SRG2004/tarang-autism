# Complete AWS Setup Guide - TARANG (AI for Bharat)

## 🎯 Overview

This guide walks you through setting up ALL AWS services needed for TARANG, from account creation to deployment.

**Estimated Time:** 2-3 hours  
**Cost:** ~$30-60/month (with free tier: ~$5-10/month for first year)

## 📋 Prerequisites

- [ ] AWS Account (we'll create this first)
- [ ] Credit/Debit card for AWS verification
- [ ] GitHub account with your code
- [ ] Email address for AWS notifications

---

## Part 1: AWS Account Setup (15 minutes)

### Step 1.1: Create AWS Account

1. Go to https://aws.amazon.com
2. Click **"Create an AWS Account"**
3. Fill in:
   - Email address
   - Password (strong password!)
   - AWS account name: `tarang-production`
4. Click **"Continue"**

### Step 1.2: Contact Information

1. Select **"Professional"** account type
2. Fill in:
   - Full name
   - Phone number
   - Country: India
   - Address
3. Read and accept AWS Customer Agreement
4. Click **"Create Account and Continue"**

### Step 1.3: Payment Information

1. Enter credit/debit card details
2. AWS will charge ₹2 for verification (refunded)
3. Click **"Verify and Add"**

### Step 1.4: Identity Verification

1. Choose **"Text message (SMS)"** or **"Voice call"**
2. Enter verification code
3. Click **"Continue"**

### Step 1.5: Select Support Plan

1. Choose **"Basic support - Free"**
2. Click **"Complete sign up"**

✅ **AWS Account Created!**

---

## Part 2: IAM User & Access Keys (20 minutes)

### Step 2.1: Sign in to AWS Console

1. Go to https://console.aws.amazon.com
2. Sign in with your root account email and password
3. You'll see the AWS Management Console

### Step 2.2: Create IAM User (Recommended for Security)

1. In the search bar, type **"IAM"** and click on it
2. Click **"Users"** in the left sidebar
3. Click **"Create user"**
4. User name: `tarang-admin`
5. Check **"Provide user access to the AWS Management Console"**
6. Choose **"I want to create an IAM user"**
7. Custom password: Create a strong password
8. Uncheck **"Users must create a new password at next sign-in"**
9. Click **"Next"**

### Step 2.3: Set Permissions

1. Select **"Attach policies directly"**
2. Search and check these policies:
   - ✅ `AmazonRDSFullAccess` (for database)
   - ✅ `AmazonBedrockFullAccess` (for AI)
   - ✅ `AmazonPollyFullAccess` (for text-to-speech)
   - ✅ `AmazonS3FullAccess` (for storage)
   - ✅ `AWSAppRunnerFullAccess` (for deployment)
   - ✅ `CloudWatchFullAccess` (for monitoring)
3. Click **"Next"**
4. Review and click **"Create user"**

### Step 2.4: Create Access Keys

1. Click on the user you just created (`tarang-admin`)
2. Go to **"Security credentials"** tab
3. Scroll to **"Access keys"** section
4. Click **"Create access key"**
5. Select **"Application running outside AWS"**
6. Click **"Next"**
7. Description: `TARANG Production`
8. Click **"Create access key"**

### Step 2.5: Save Access Keys (IMPORTANT!)

**⚠️ CRITICAL: Save these immediately - you can't see them again!**

```
AWS_ACCESS_KEY_ID=AKIA.....................
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

**Save to a secure location:**
- Password manager (recommended)
- Encrypted file
- AWS Secrets Manager (we'll set up later)

✅ **IAM User and Access Keys Created!**

**Environment Variables Acquired:**
```env
AWS_ACCESS_KEY_ID=AKIA.....................
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=ap-south-1
```

---

## Part 3: Amazon RDS PostgreSQL Setup (30 minutes)

### Step 3.1: Navigate to RDS

1. In AWS Console search bar, type **"RDS"**
2. Click **"RDS"** (Relational Database Service)
3. Make sure region is **"Asia Pacific (Mumbai) ap-south-1"** (top right)

### Step 3.2: Create Database

1. Click **"Create database"**
2. Choose **"Standard create"**

### Step 3.3: Engine Options

1. Engine type: **PostgreSQL**
2. Version: **PostgreSQL 15.4-R2** (or latest 15.x)
3. Templates: 
   - For free tier: **"Free tier"**
   - For production: **"Production"**

### Step 3.4: Settings

```
DB instance identifier: tarang-production-db
Master username: tarang_admin
Master password: [Create strong password - save it!]
Confirm password: [Same password]
```

**Save this password immediately:**
```
DB_PASSWORD=YourSecurePassword123!
```

### Step 3.5: Instance Configuration

**For Free Tier:**
- DB instance class: **db.t3.micro**
- Storage: 20 GB

**For Production:**
- DB instance class: **db.t3.small** (or db.t3.medium)
- Storage type: **General Purpose SSD (gp3)**
- Allocated storage: **20 GB**
- Enable storage autoscaling: ✅
- Maximum storage threshold: **100 GB**

### Step 3.6: Connectivity

1. Compute resource: **"Don't connect to an EC2 compute resource"**
2. VPC: **Default VPC**
3. DB subnet group: **default**
4. Public access: **Yes** ⚠️ (needed for App Runner)
5. VPC security group: **Create new**
6. New VPC security group name: `tarang-db-sg`
7. Availability Zone: **ap-south-1a**
8. Database port: **5432**

### Step 3.7: Database Authentication

- Database authentication: **Password authentication**

### Step 3.8: Additional Configuration

1. Initial database name: `tarang_production`
2. DB parameter group: **default.postgres15**
3. Backup:
   - Enable automated backups: ✅
   - Backup retention period: **7 days**
   - Backup window: **No preference**
4. Encryption: **Enable encryption** ✅
5. Performance Insights: **Enable** (optional, recommended)
6. Monitoring: **Enable Enhanced monitoring** (optional)

### Step 3.9: Create Database

1. Review all settings
2. Click **"Create database"**
3. Wait 5-10 minutes for creation

### Step 3.10: Get Database Endpoint

1. Go to **RDS → Databases**
2. Click on `tarang-production-db`
3. Under **"Connectivity & security"**, copy the **Endpoint**

```
Example: tarang-production-db.c9akl5qwerty.ap-south-1.rds.amazonaws.com
```

**Save this:**
```env
DB_HOST=tarang-production-db.c9akl5qwerty.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=tarang_production
DB_USER=tarang_admin
DB_PASSWORD=YourSecurePassword123!
DB_SSL=require
```

### Step 3.11: Configure Security Group

1. Click on the VPC security group link (under Connectivity)
2. Click **"Edit inbound rules"**
3. Click **"Add rule"**
4. Configure:
   - Type: **PostgreSQL**
   - Protocol: **TCP**
   - Port: **5432**
   - Source: **0.0.0.0/0** (for App Runner access)
   - Description: `App Runner access`
5. Click **"Save rules"**

✅ **RDS PostgreSQL Database Created!**

**Environment Variables Acquired:**
```env
DB_HOST=tarang-production-db.c9akl5qwerty.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=tarang_production
DB_USER=tarang_admin
DB_PASSWORD=YourSecurePassword123!
DB_SSL=require
```

---


## Part 4: Amazon Bedrock Setup (15 minutes)

### Step 4.1: Navigate to Bedrock

1. In AWS Console search bar, type **"Bedrock"**
2. Click **"Amazon Bedrock"**
3. Ensure region is **"US East (N. Virginia) us-east-1"** (Bedrock not in ap-south-1 yet)

### Step 4.2: Request Model Access

1. Click **"Model access"** in the left sidebar
2. Click **"Manage model access"** (orange button)
3. Find **"Anthropic"** section
4. Check ✅ **"Claude 3.5 Sonnet"**
5. Scroll down and click **"Request model access"**
6. Wait 2-5 minutes for approval (usually instant)

### Step 4.3: Verify Access

1. Refresh the page
2. Status should show **"Access granted"** with green checkmark
3. Model ID: `anthropic.claude-3-sonnet-20240229-v1:0`

✅ **Bedrock Access Granted!**

**Note:** Your existing AWS credentials work for Bedrock. Update region in code:

```env
# For Bedrock, use us-east-1
# Your app will handle this automatically
AWS_REGION=ap-south-1  # Keep this for RDS
```

---

## Part 5: Amazon Polly (No Setup Required!)

Amazon Polly is available by default in all regions. No additional setup needed!

✅ **Polly Ready to Use!**

**Verify access:**
```bash
aws polly describe-voices --region ap-south-1
```

---

## Part 6: Amazon S3 Bucket (10 minutes)

### Step 6.1: Navigate to S3

1. In AWS Console search bar, type **"S3"**
2. Click **"S3"**
3. Ensure region is **"Asia Pacific (Mumbai) ap-south-1"**

### Step 6.2: Create Bucket

1. Click **"Create bucket"**
2. Bucket name: `tarang-screening-data-[your-unique-id]`
   - Example: `tarang-screening-data-prod-2024`
   - Must be globally unique
   - Use lowercase, numbers, hyphens only
3. AWS Region: **Asia Pacific (Mumbai) ap-south-1**
4. Object Ownership: **ACLs disabled (recommended)**
5. Block Public Access: **Block all public access** ✅
6. Bucket Versioning: **Enable** (recommended)
7. Default encryption: **Server-side encryption with Amazon S3 managed keys (SSE-S3)**
8. Click **"Create bucket"**

✅ **S3 Bucket Created!**

**Environment Variable Acquired:**
```env
S3_BUCKET_NAME=tarang-screening-data-prod-2024
```

---

## Part 7: Redis Setup (Optional - for Celery)

### Option A: AWS ElastiCache (Recommended for Production)

#### Step 7.1: Navigate to ElastiCache

1. In AWS Console search bar, type **"ElastiCache"**
2. Click **"ElastiCache"**
3. Ensure region is **"Asia Pacific (Mumbai) ap-south-1"**

#### Step 7.2: Create Redis Cluster

1. Click **"Get started"** or **"Create"**
2. Choose **"Redis"**
3. Cluster mode: **Disabled**
4. Name: `tarang-redis`
5. Engine version: **7.0** (latest)
6. Port: **6379**
7. Node type: **cache.t3.micro** (free tier eligible)
8. Number of replicas: **0** (for development)
9. Subnet group: **Create new**
10. VPC: **Default VPC**
11. Click **"Create"**

#### Step 7.3: Get Redis Endpoint

1. Wait 5-10 minutes for creation
2. Click on your cluster
3. Copy **Primary Endpoint**

```
Example: tarang-redis.abc123.cache.amazonaws.com:6379
```

**Environment Variable:**
```env
REDIS_URL=redis://tarang-redis.abc123.cache.amazonaws.com:6379
```

### Option B: Upstash Redis (Easier, Free Tier)

1. Go to https://upstash.com
2. Sign up with GitHub
3. Click **"Create Database"**
4. Name: `tarang-redis`
5. Region: **ap-south-1** (Mumbai)
6. Type: **Regional**
7. Click **"Create"**
8. Copy **REST URL** or **Redis URL**

**Environment Variable:**
```env
REDIS_URL=rediss://default:password@endpoint.upstash.io:6379
```

✅ **Redis Setup Complete!**

---

## Part 8: Generate Security Keys (5 minutes)

### Step 8.1: Generate SECRET_KEY (32 bytes)

**Option 1: Python**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32)[:32])"
```

**Option 2: OpenSSL**
```bash
openssl rand -base64 32 | cut -c1-32
```

**Option 3: Online Generator**
- Go to https://randomkeygen.com/
- Use "Fort Knox Passwords" section
- Copy 32 characters

**Save this:**
```env
SECRET_KEY=your_generated_32_byte_key_here
```

### Step 8.2: Generate JWT_SECRET (64 characters)

**Option 1: Python**
```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

**Option 2: OpenSSL**
```bash
openssl rand -base64 64
```

**Save this:**
```env
JWT_SECRET=your_generated_64_character_jwt_secret_here_make_it_very_long_and_random
```

✅ **Security Keys Generated!**

---

## Part 9: AWS App Runner Deployment (30 minutes)

### Step 9.1: Push Code to GitHub

```bash
cd tarang-autism
git add .
git commit -m "feat: Configure for AWS deployment"
git push origin main
```

### Step 9.2: Navigate to App Runner

1. In AWS Console search bar, type **"App Runner"**
2. Click **"App Runner"**
3. Ensure region is **"Asia Pacific (Mumbai) ap-south-1"**

### Step 9.3: Create Service

1. Click **"Create service"**

### Step 9.4: Source Configuration

1. Repository type: **"Source code repository"**
2. Click **"Add new"** to connect GitHub
3. Connection name: `github-tarang`
4. Click **"Install another"**
5. Authorize AWS Connector for GitHub
6. Select your repository: `your-username/tarang-autism`
7. Click **"Next"**
8. Repository: Select `your-username/tarang-autism`
9. Branch: **main**
10. Source directory: `tarang-api`

### Step 9.5: Build Configuration

1. Configuration file: **"Configure all settings here"**
2. Runtime: **Python 3**
3. Build command:
```bash
pip install -r requirements.txt
```
4. Start command:
```bash
./start.sh
```
5. Port: **8080**

### Step 9.6: Service Settings

1. Service name: `tarang-api-production`
2. Virtual CPU: **1 vCPU** (or 2 vCPU for better performance)
3. Memory: **2 GB** (or 4 GB for ML workloads)
4. Environment variables: Click **"Add environment variable"**

**Add ALL these variables:**

```env
# Database
DB_HOST=tarang-production-db.c9akl5qwerty.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=tarang_production
DB_USER=tarang_admin
DB_PASSWORD=YourSecurePassword123!
DB_SSL=require

# Security
SECRET_KEY=your_generated_32_byte_key_here
JWT_SECRET=your_generated_64_character_jwt_secret

# AWS Services
AWS_ACCESS_KEY_ID=AKIA.....................
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=ap-south-1

# S3
S3_BUCKET_NAME=tarang-screening-data-prod-2024

# Redis (if using)
REDIS_URL=redis://your-redis-endpoint:6379

# CORS (update with your frontend URL later)
ALLOWED_ORIGINS=http://localhost:3000

# Environment
ENVIRONMENT=production
```

### Step 9.7: Auto Scaling

1. Minimum instances: **1**
2. Maximum instances: **5**

### Step 9.8: Health Check

1. Protocol: **HTTP**
2. Path: `/health`
3. Interval: **10 seconds**
4. Timeout: **5 seconds**
5. Healthy threshold: **1**
6. Unhealthy threshold: **5**

### Step 9.9: Security

1. Instance role: **Create new service role**
2. Role name: `AppRunnerECRAccessRole`

### Step 9.10: Create Service

1. Review all settings
2. Click **"Create & deploy"**
3. Wait 10-15 minutes for deployment

### Step 9.11: Get Service URL

1. Once status is **"Running"**
2. Copy the **Default domain**

```
Example: https://abc123xyz.ap-south-1.awsapprunner.com
```

### Step 9.12: Test Deployment

```bash
# Test health endpoint
curl https://abc123xyz.ap-south-1.awsapprunner.com/health

# Test API docs
open https://abc123xyz.ap-south-1.awsapprunner.com/docs
```

✅ **Backend Deployed to AWS App Runner!**

**Environment Variable for Frontend:**
```env
NEXT_PUBLIC_API_URL=https://abc123xyz.ap-south-1.awsapprunner.com
```

---

## Part 10: AWS Amplify (Frontend Deployment) (20 minutes)

### Step 10.1: Navigate to Amplify

1. In AWS Console search bar, type **"Amplify"**
2. Click **"AWS Amplify"**
3. Click **"Get started"** under "Amplify Hosting"

### Step 10.2: Connect Repository

1. Select **"GitHub"**
2. Click **"Continue"**
3. Authorize AWS Amplify
4. Repository: Select `your-username/tarang-autism`
5. Branch: **main**
6. Click **"Next"**

### Step 10.3: Build Settings

1. App name: `tarang-web`
2. Environment: **production**
3. Build settings will auto-detect Next.js
4. Edit build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd tarang-web
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: tarang-web/.next
    files:
      - '**/*'
  cache:
    paths:
      - tarang-web/node_modules/**/*
```

5. Click **"Next"**

### Step 10.4: Environment Variables

1. Click **"Advanced settings"**
2. Add environment variable:

```env
NEXT_PUBLIC_API_URL=https://abc123xyz.ap-south-1.awsapprunner.com
```

3. Click **"Next"**

### Step 10.5: Review and Deploy

1. Review all settings
2. Click **"Save and deploy"**
3. Wait 5-10 minutes for deployment

### Step 10.6: Get Frontend URL

1. Once deployment is complete
2. Copy the **Domain**

```
Example: https://main.d1a2b3c4d5e6f7.amplifyapp.com
```

### Step 10.7: Update Backend CORS

1. Go back to **App Runner**
2. Click on your service
3. Go to **"Configuration"** → **"Environment variables"**
4. Edit `ALLOWED_ORIGINS`:

```env
ALLOWED_ORIGINS=https://main.d1a2b3c4d5e6f7.amplifyapp.com
```

5. Click **"Deploy"** to restart with new settings

✅ **Frontend Deployed to AWS Amplify!**

---

## Part 11: Final Testing (10 minutes)

### Step 11.1: Test Backend

```bash
# Health check
curl https://your-app-runner-url.awsapprunner.com/health

# Should return:
{
  "status": "healthy",
  "service": "TARANG API",
  "database_type": "PostgreSQL",
  "aws_services": {
    "bedrock": "available",
    "polly": "available"
  }
}
```

### Step 11.2: Test Frontend

1. Open your Amplify URL in browser
2. Try to register a new account
3. Try to login
4. Test the screening flow

### Step 11.3: Test Database Connection

```bash
# Connect to RDS
psql -h your-rds-endpoint.rds.amazonaws.com \
     -p 5432 \
     -U tarang_admin \
     -d tarang_production

# List tables
\dt

# Should see: users, patients, screening_sessions, etc.
```

### Step 11.4: Test Polly

```bash
# Test text-to-speech
curl -X POST https://your-app-runner-url.awsapprunner.com/polly/synthesize \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello from TARANG", "language": "en-IN"}' \
  --output test.mp3

# Play the audio file
```

✅ **All Services Working!**

---

## 📝 Complete Environment Variables Summary

Save all these in a secure location:

```env
# ============================================================================
# AWS CREDENTIALS
# ============================================================================
AWS_ACCESS_KEY_ID=AKIA.....................
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=ap-south-1

# ============================================================================
# DATABASE (AWS RDS PostgreSQL)
# ============================================================================
DB_HOST=tarang-production-db.c9akl5qwerty.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=tarang_production
DB_USER=tarang_admin
DB_PASSWORD=YourSecurePassword123!
DB_SSL=require

# ============================================================================
# SECURITY KEYS
# ============================================================================
SECRET_KEY=your_generated_32_byte_key_here
JWT_SECRET=your_generated_64_character_jwt_secret_here

# ============================================================================
# AWS SERVICES
# ============================================================================
S3_BUCKET_NAME=tarang-screening-data-prod-2024
REDIS_URL=redis://your-redis-endpoint:6379

# ============================================================================
# APPLICATION
# ============================================================================
ENVIRONMENT=production
ALLOWED_ORIGINS=https://main.d1a2b3c4d5e6f7.amplifyapp.com

# ============================================================================
# FRONTEND (for tarang-web)
# ============================================================================
NEXT_PUBLIC_API_URL=https://abc123xyz.ap-south-1.awsapprunner.com
```

---

## 💰 Cost Breakdown

### Monthly Costs (ap-south-1 region)

| Service | Configuration | Cost |
|---------|--------------|------|
| **RDS PostgreSQL** | db.t3.micro (free tier) | $0 (first 12 months) |
| **RDS PostgreSQL** | db.t3.small | ~$25/month |
| **RDS Storage** | 20 GB gp3 | ~$2.50/month |
| **App Runner** | 1 vCPU, 2 GB | ~$5-10/month |
| **Amplify** | Hosting + Build | ~$0-5/month |
| **S3** | 20 GB storage | ~$0.50/month |
| **ElastiCache** | cache.t3.micro | ~$15/month |
| **Data Transfer** | 100 GB/month | Free |
| **Bedrock** | Pay per use | ~$3-10/month |
| **Polly** | Pay per use | ~$1-5/month |

**Total Estimated Cost:**
- **With Free Tier:** $5-15/month
- **Production:** $50-80/month

### Cost Optimization Tips

1. **Use Free Tier:** db.t3.micro for RDS (first 12 months)
2. **Stop Dev Instances:** Stop RDS when not testing
3. **Use Upstash Redis:** Free tier instead of ElastiCache
4. **Monitor Usage:** Set up billing alerts
5. **Right-Size:** Start small, scale up as needed

---

## 🔒 Security Checklist

- [ ] IAM user created (not using root account)
- [ ] Strong passwords for all services
- [ ] Access keys saved securely
- [ ] RDS encryption enabled
- [ ] S3 bucket not public
- [ ] SSL enabled for database (DB_SSL=require)
- [ ] Environment variables not in Git
- [ ] Security groups properly configured
- [ ] Backup retention enabled (7 days)
- [ ] CloudWatch alarms set up

---

## 🆘 Troubleshooting

### Issue: Can't connect to RDS

**Solutions:**
1. Check security group allows port 5432
2. Verify RDS is publicly accessible
3. Test with: `telnet your-rds-endpoint 5432`

### Issue: App Runner deployment fails

**Solutions:**
1. Check CloudWatch logs
2. Verify all environment variables are set
3. Test locally with Docker first

### Issue: Bedrock access denied

**Solutions:**
1. Verify model access is granted
2. Check IAM permissions include BedrockFullAccess
3. Try us-east-1 region

### Issue: Frontend can't reach backend

**Solutions:**
1. Check CORS settings in backend
2. Verify NEXT_PUBLIC_API_URL is correct
3. Check App Runner service is running

---

## 📚 Next Steps

1. **Set up monitoring:** CloudWatch dashboards
2. **Configure alerts:** Billing, errors, performance
3. **Set up CI/CD:** Automatic deployments on push
4. **Add custom domain:** Route 53 + SSL certificate
5. **Implement backups:** Automated RDS snapshots
6. **Load testing:** Test with expected traffic
7. **Documentation:** Update team docs with URLs

---

## 🎉 Congratulations!

You've successfully set up all AWS services for TARANG!

**Your Application URLs:**
- **Backend API:** https://abc123xyz.ap-south-1.awsapprunner.com
- **Frontend:** https://main.d1a2b3c4d5e6f7.amplifyapp.com
- **API Docs:** https://abc123xyz.ap-south-1.awsapprunner.com/docs

**Ready for the hackathon! 🚀**

---

## 📞 Support Resources

- **AWS Documentation:** https://docs.aws.amazon.com
- **AWS Support:** https://console.aws.amazon.com/support
- **Community:** https://repost.aws
- **Pricing Calculator:** https://calculator.aws

---

**Last Updated:** February 2024  
**For:** AWS "AI for Bharat" Hackathon - Track 5: Healthcare & Life Sciences
