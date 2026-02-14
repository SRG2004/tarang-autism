# Database Configuration Quick Reference - TARANG

## Configuration Methods

### Method 1: Individual Variables (Recommended for AWS)

```env
DB_HOST=your-rds-instance.abc123.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=tarang_production
DB_USER=tarang_admin
DB_PASSWORD=your_secure_password
DB_SSL=require
```

**Advantages:**
- ✅ Easy to configure in AWS Console
- ✅ Works with AWS Secrets Manager
- ✅ Clear separation of concerns
- ✅ Easy to update individual values

### Method 2: Connection String (Legacy)

```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

**Advantages:**
- ✅ Single variable
- ✅ Compatible with Heroku/Railway
- ✅ Easy to copy/paste

### Method 3: SQLite (Development Only)

```env
# No configuration needed - automatic fallback
# Or explicitly set:
DATABASE_URL=sqlite:///./tarang.db
```

## Priority Order

1. **DB_HOST + DB_NAME + DB_USER + DB_PASSWORD** (highest priority)
2. **DATABASE_URL** (if DB_* not set)
3. **SQLite fallback** (if nothing configured)

## SSL Configuration

### AWS RDS (Recommended)

```env
DB_SSL=require
```

### No SSL (Development Only)

```env
DB_SSL=false
# or omit DB_SSL variable
```

### Advanced SSL Options

```env
# Verify CA certificate
DB_SSL=verify-ca

# Full certificate verification
DB_SSL=verify-full
```

## Quick Setup Examples

### AWS RDS PostgreSQL

```env
# Required
DB_HOST=tarang-db.abc123.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=tarang_production
DB_USER=tarang_admin
DB_PASSWORD=SecurePass123!
DB_SSL=require

# Security
SECRET_KEY=your-32-byte-encryption-key
JWT_SECRET=your-64-char-jwt-secret
```

### Local Development

```env
# Option 1: SQLite (automatic)
# No configuration needed

# Option 2: Local PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tarang_dev
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false

# Security (dev keys)
SECRET_KEY=dev_key_16bytes!
JWT_SECRET=dev_jwt_secret_change_in_production
```

### Heroku/Railway (Legacy)

```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
SECRET_KEY=your-32-byte-key
JWT_SECRET=your-64-char-secret
```

## Testing Connection

### Python Script

```python
import os
from app.database import engine, DATABASE_URL

print(f"Database URL: {DATABASE_URL}")
print(f"Testing connection...")

try:
    with engine.connect() as conn:
        result = conn.execute("SELECT version();")
        version = result.fetchone()[0]
        print(f"✅ Connected successfully!")
        print(f"PostgreSQL version: {version}")
except Exception as e:
    print(f"❌ Connection failed: {e}")
```

### Command Line

```bash
# PostgreSQL
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME

# Or with DATABASE_URL
psql $DATABASE_URL
```

## Common Issues

### Issue: Connection Refused

**Check:**
- Security group allows port 5432
- RDS instance is publicly accessible
- Correct host and port

**Solution:**
```bash
telnet $DB_HOST $DB_PORT
```

### Issue: SSL Error

**Check:**
- `DB_SSL=require` (not verify-full)
- RDS supports SSL

**Solution:**
```env
DB_SSL=require
```

### Issue: Authentication Failed

**Check:**
- Correct username and password
- No special characters causing issues

**Solution:**
```bash
# Test credentials
psql -h $DB_HOST -U $DB_USER -d $DB_NAME
```

### Issue: Wrong Database

**Check:**
- Database name exists
- User has access to database

**Solution:**
```sql
-- List databases
\l

-- Create database if needed
CREATE DATABASE tarang_production;
```

## Environment-Specific Configs

### Development

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tarang_dev
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false
ENVIRONMENT=development
```

### Staging

```env
DB_HOST=tarang-staging.abc123.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=tarang_staging
DB_USER=tarang_admin
DB_PASSWORD=staging_password
DB_SSL=require
ENVIRONMENT=staging
```

### Production

```env
DB_HOST=tarang-prod.abc123.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=tarang_production
DB_USER=tarang_admin
DB_PASSWORD=production_password
DB_SSL=require
ENVIRONMENT=production
```

## Security Best Practices

1. **Never commit credentials** to Git
2. **Use strong passwords** (min 16 chars, mixed case, numbers, symbols)
3. **Enable SSL** for production (`DB_SSL=require`)
4. **Rotate passwords** every 90 days
5. **Use AWS Secrets Manager** for production
6. **Restrict network access** with security groups
7. **Enable encryption at rest** in RDS
8. **Monitor connections** with CloudWatch

## Verification Checklist

- [ ] Database connection successful
- [ ] SSL enabled for production
- [ ] Tables created automatically
- [ ] Sample data can be inserted
- [ ] Queries execute successfully
- [ ] Connection pool working
- [ ] No connection leaks
- [ ] Monitoring configured

## Support

- **Full Setup Guide:** See `AWS_RDS_SETUP.md`
- **Deployment Guide:** See `AWS_APP_RUNNER_DEPLOYMENT.md`
- **Troubleshooting:** See `AWS_RDS_SETUP.md` → Troubleshooting section

---

**Database configuration is now production-ready for AWS RDS! 🚀**
