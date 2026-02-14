# AWS App Runner Deployment Guide - TARANG API

## Overview

This guide covers deploying the TARANG FastAPI backend to AWS App Runner for production use in the "AI for Bharat" hackathon.

## Prerequisites

- AWS Account with appropriate permissions
- GitHub repository with the code
- AWS CLI installed and configured (optional)
- Environment variables prepared

## Architecture

```
GitHub Repository → AWS App Runner → Container Build → Deploy
                         ↓
                    Port 8080 (default)
                         ↓
                    Health Check (/health)
                         ↓
                    Auto-scaling (1-25 instances)
```

## Deployment Configuration

### 1. Port Configuration ✅

The application is configured to listen on port **8080** (AWS App Runner default):

- **Dockerfile:** `EXPOSE 8080`
- **start.sh:** `PORT="${PORT:-8080}"`
- **Gunicorn:** Binds to `0.0.0.0:8080`

### 2. Production Server ✅

Using **Gunicorn with Uvicorn workers** for production stability:

```bash
gunicorn app.main:app \
    --bind 0.0.0.0:8080 \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --timeout 120 \
    --keepalive 5
```

**Benefits:**
- Process management and worker restart on failure
- Better resource utilization
- Graceful shutdown handling
- Production-grade stability

### 3. Health Check Endpoint ✅

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "service": "TARANG API",
  "timestamp": "2024-02-14T10:30:00.000000Z",
  "database_type": "PostgreSQL",
  "is_production": true,
  "version": "1.0.0",
  "aws_services": {
    "bedrock": "available",
    "polly": "available"
  }
}
```

### 4. Dependencies ✅

Updated `requirements.txt` includes:
- `uvicorn[standard]` - ASGI server with performance extras
- `gunicorn` - Production WSGI server

## Step-by-Step Deployment

### Step 1: Prepare Environment Variables

Create a `.env` file or prepare these variables for App Runner:

```env
# Required
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
SECRET_KEY=your-32-byte-secret-key
JWT_SECRET=your-64-char-jwt-secret
AWS_REGION=ap-south-1

# AWS Credentials (for Bedrock, Polly, S3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Optional
REDIS_URL=redis://default:password@host:port
ALLOWED_ORIGINS=https://your-frontend-domain.com
ENVIRONMENT=production

# AWS Services (Optional)
HEALTHLAKE_DATASTORE_ID=your-datastore-id
S3_BUCKET_NAME=tarang-screening-data

# Server Configuration (Optional - defaults are production-ready)
WORKERS=4
CELERY_CONCURRENCY=2
TIMEOUT=120
```

### Step 2: Push to GitHub

```bash
git add .
git commit -m "chore: Configure for AWS App Runner deployment"
git push origin main
```

### Step 3: Create App Runner Service

#### Option A: AWS Console (Recommended for First Time)

1. Go to **AWS App Runner** console
2. Click **Create service**
3. **Source:**
   - Repository type: **Source code repository**
   - Connect to GitHub
   - Select repository: `your-username/tarang-autism`
   - Branch: `main`
   - Source directory: `tarang-api`

4. **Build settings:**
   - Configuration file: **Use a configuration file**
   - Or manually configure:
     - Runtime: **Python 3**
     - Build command: `pip install -r requirements.txt`
     - Start command: `./start.sh`
     - Port: **8080**

5. **Service settings:**
   - Service name: `tarang-api-production`
   - Virtual CPU: **1 vCPU** (or 2 vCPU for better performance)
   - Memory: **2 GB** (or 4 GB for ML workloads)
   - Environment variables: Add all from Step 1

6. **Auto scaling:**
   - Min instances: **1**
   - Max instances: **5** (adjust based on expected load)

7. **Health check:**
   - Protocol: **HTTP**
   - Path: `/health`
   - Interval: **10 seconds**
   - Timeout: **5 seconds**
   - Healthy threshold: **1**
   - Unhealthy threshold: **5**

8. **Security:**
   - IAM role: Create new role or use existing with:
     - `bedrock:InvokeModel`
     - `polly:SynthesizeSpeech`
     - `s3:PutObject`, `s3:GetObject`

9. Click **Create & deploy**

#### Option B: AWS CLI

Create `apprunner.yaml` in repository root:

```yaml
version: 1.0
runtime: python3
build:
  commands:
    pre-build:
      - pip install --upgrade pip
    build:
      - pip install -r tarang-api/requirements.txt
    post-build:
      - chmod +x tarang-api/start.sh
run:
  runtime-version: 3.11
  command: cd tarang-api && ./start.sh
  network:
    port: 8080
  env:
    - name: PORT
      value: "8080"
```

Deploy via CLI:

```bash
aws apprunner create-service \
  --service-name tarang-api-production \
  --source-configuration '{
    "CodeRepository": {
      "RepositoryUrl": "https://github.com/your-username/tarang-autism",
      "SourceCodeVersion": {
        "Type": "BRANCH",
        "Value": "main"
      },
      "CodeConfiguration": {
        "ConfigurationSource": "API",
        "CodeConfigurationValues": {
          "Runtime": "PYTHON_3",
          "BuildCommand": "pip install -r tarang-api/requirements.txt",
          "StartCommand": "cd tarang-api && ./start.sh",
          "Port": "8080"
        }
      }
    }
  }' \
  --instance-configuration '{
    "Cpu": "1 vCPU",
    "Memory": "2 GB"
  }' \
  --health-check-configuration '{
    "Protocol": "HTTP",
    "Path": "/health",
    "Interval": 10,
    "Timeout": 5,
    "HealthyThreshold": 1,
    "UnhealthyThreshold": 5
  }' \
  --region ap-south-1
```

### Step 4: Configure Environment Variables

After service creation, add environment variables:

```bash
aws apprunner update-service \
  --service-arn <your-service-arn> \
  --source-configuration '{
    "CodeRepository": {
      "CodeConfiguration": {
        "CodeConfigurationValues": {
          "RuntimeEnvironmentVariables": {
            "DATABASE_URL": "postgresql://...",
            "SECRET_KEY": "...",
            "JWT_SECRET": "...",
            "AWS_REGION": "ap-south-1",
            "AWS_ACCESS_KEY_ID": "...",
            "AWS_SECRET_ACCESS_KEY": "..."
          }
        }
      }
    }
  }'
```

### Step 5: Verify Deployment

1. **Check Service Status:**
   ```bash
   aws apprunner describe-service --service-arn <your-service-arn>
   ```

2. **Test Health Endpoint:**
   ```bash
   curl https://your-app-runner-url.ap-south-1.awsapprunner.com/health
   ```

3. **Test API Documentation:**
   ```bash
   curl https://your-app-runner-url.ap-south-1.awsapprunner.com/docs
   ```

4. **Test Polly Endpoint:**
   ```bash
   curl -X POST https://your-app-runner-url.ap-south-1.awsapprunner.com/polly/synthesize \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"text": "Hello from TARANG", "language": "en-IN"}' \
     --output test.mp3
   ```

## Configuration Options

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `8080` | Server port (App Runner uses 8080) |
| `HOST` | No | `0.0.0.0` | Server host |
| `WORKERS` | No | `4` | Number of Gunicorn workers |
| `WORKER_CLASS` | No | `uvicorn.workers.UvicornWorker` | Worker class |
| `TIMEOUT` | No | `120` | Request timeout in seconds |
| `CELERY_CONCURRENCY` | No | `2` | Celery worker concurrency |
| `CELERY_LOGLEVEL` | No | `warning` | Celery log level |
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `SECRET_KEY` | Yes | - | Encryption key (32 bytes) |
| `JWT_SECRET` | Yes | - | JWT signing key (64 chars) |
| `AWS_REGION` | Yes | `ap-south-1` | AWS region |
| `AWS_ACCESS_KEY_ID` | Yes | - | AWS credentials |
| `AWS_SECRET_ACCESS_KEY` | Yes | - | AWS credentials |
| `REDIS_URL` | No | - | Redis connection (for Celery) |
| `ALLOWED_ORIGINS` | No | `*` | CORS allowed origins |

### Scaling Configuration

**Recommended Settings:**

- **Development/Testing:**
  - CPU: 1 vCPU
  - Memory: 2 GB
  - Min instances: 1
  - Max instances: 2

- **Production (Hackathon):**
  - CPU: 2 vCPU
  - Memory: 4 GB
  - Min instances: 1
  - Max instances: 5

- **High Load:**
  - CPU: 4 vCPU
  - Memory: 8 GB
  - Min instances: 2
  - Max instances: 10

## Monitoring & Logging

### CloudWatch Logs

App Runner automatically sends logs to CloudWatch:

```bash
aws logs tail /aws/apprunner/tarang-api-production/service --follow
```

### Metrics to Monitor

- **Request Count:** Number of incoming requests
- **Response Time:** Average response latency
- **Error Rate:** 4xx and 5xx errors
- **CPU Utilization:** Should stay below 80%
- **Memory Utilization:** Should stay below 85%
- **Active Instances:** Number of running instances

### Health Check Monitoring

```bash
# Check health endpoint
watch -n 5 'curl -s https://your-app-runner-url/health | jq'
```

## Troubleshooting

### Issue: Service Won't Start

**Check:**
1. Dockerfile syntax
2. start.sh has execute permissions (`chmod +x`)
3. Port 8080 is exposed
4. All required environment variables are set

**Solution:**
```bash
# View logs
aws logs tail /aws/apprunner/tarang-api-production/service --follow

# Check service status
aws apprunner describe-service --service-arn <arn>
```

### Issue: Health Check Failing

**Check:**
1. `/health` endpoint returns 200 status
2. Response time is under 5 seconds
3. Database connection is working

**Solution:**
```bash
# Test locally
docker build -t tarang-api tarang-api/
docker run -p 8080:8080 --env-file .env tarang-api
curl http://localhost:8080/health
```

### Issue: AWS Services Unavailable

**Check:**
1. AWS credentials are correct
2. IAM role has required permissions
3. Region is set to `ap-south-1`

**Solution:**
```bash
# Test AWS credentials
aws sts get-caller-identity

# Test Bedrock access
aws bedrock list-foundation-models --region ap-south-1

# Test Polly access
aws polly describe-voices --region ap-south-1
```

### Issue: High Memory Usage

**Check:**
1. Number of Gunicorn workers
2. Celery concurrency
3. ML model loading

**Solution:**
```bash
# Reduce workers
WORKERS=2 CELERY_CONCURRENCY=1

# Or increase instance memory to 4 GB
```

## Cost Optimization

### Estimated Costs (ap-south-1 region)

**Compute:**
- 1 vCPU, 2 GB: ~$0.007/hour = ~$5/month (1 instance)
- 2 vCPU, 4 GB: ~$0.014/hour = ~$10/month (1 instance)

**Data Transfer:**
- First 100 GB/month: Free
- Additional: ~$0.09/GB

**Total Estimated Cost (Hackathon):**
- Development: ~$5-10/month
- Production: ~$20-50/month (with auto-scaling)

### Cost Saving Tips

1. **Use minimum instances:** Set min to 1 for development
2. **Right-size resources:** Start with 1 vCPU, 2 GB
3. **Enable auto-scaling:** Scale down during low traffic
4. **Use spot instances:** Not available for App Runner, but consider ECS Fargate Spot
5. **Monitor usage:** Set up billing alerts

## Security Best Practices

1. **Environment Variables:**
   - Never commit secrets to Git
   - Use AWS Secrets Manager for sensitive data
   - Rotate credentials regularly

2. **IAM Permissions:**
   - Use least privilege principle
   - Create dedicated IAM role for App Runner
   - Enable CloudTrail for audit logging

3. **Network Security:**
   - Use VPC connector for private resources
   - Enable WAF for DDoS protection
   - Use HTTPS only (App Runner provides SSL)

4. **Application Security:**
   - Keep dependencies updated
   - Enable rate limiting (already configured)
   - Use JWT with short expiration
   - Validate all inputs with Pydantic

## CI/CD Integration

### Automatic Deployments

App Runner automatically deploys on Git push:

```bash
git add .
git commit -m "feat: Add new feature"
git push origin main
# App Runner detects change and deploys automatically
```

### Manual Deployments

```bash
aws apprunner start-deployment --service-arn <your-service-arn>
```

### Rollback

```bash
# List deployments
aws apprunner list-operations --service-arn <arn>

# Rollback to previous version
# (Redeploy from previous commit)
git revert HEAD
git push origin main
```

## Production Checklist

- [ ] All environment variables configured
- [ ] AWS credentials with correct permissions
- [ ] Database connection tested
- [ ] Health check endpoint responding
- [ ] CORS origins configured for frontend
- [ ] SSL certificate active (automatic with App Runner)
- [ ] Monitoring and alerts set up
- [ ] Backup strategy for database
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team has access to AWS console

## Support & Resources

- **AWS App Runner Docs:** https://docs.aws.amazon.com/apprunner/
- **FastAPI Deployment:** https://fastapi.tiangolo.com/deployment/
- **Gunicorn Configuration:** https://docs.gunicorn.org/en/stable/settings.html
- **AWS Support:** https://console.aws.amazon.com/support/

## Next Steps

1. Deploy to AWS App Runner
2. Configure custom domain (optional)
3. Set up monitoring and alerts
4. Connect frontend to backend URL
5. Perform load testing
6. Document API endpoints
7. Prepare for hackathon demo

---

**Ready for Production Deployment! 🚀**

All files are configured for AWS App Runner. Simply push to GitHub and create the App Runner service.
