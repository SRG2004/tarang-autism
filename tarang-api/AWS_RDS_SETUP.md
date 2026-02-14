# AWS RDS PostgreSQL Setup Guide - TARANG

## Overview

This guide covers setting up Amazon RDS PostgreSQL for TARANG's production database with SSL encryption and proper security configuration.

## Database Configuration Architecture

### Priority Order

The application checks for database configuration in this order:

1. **Individual DB_* variables** (Recommended for AWS)
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL`
   
2. **DATABASE_URL string** (Legacy support)
   - Single connection string format
   
3. **SQLite fallback** (Local development only)
   - Automatic fallback if no configuration found

### Why Individual Variables?

Individual environment variables are easier to configure in:
- AWS App Runner console
- AWS Systems Manager Parameter Store
- AWS Secrets Manager
- Environment variable management UIs

## AWS RDS Setup

### Step 1: Create RDS PostgreSQL Instance

#### Option A: AWS Console

1. Go to **RDS Console** → **Create database**

2. **Engine options:**
   - Engine type: **PostgreSQL**
   - Version: **PostgreSQL 15.x** (or latest)
   - Templates: **Production** (or Dev/Test for lower cost)

3. **Settings:**
   - DB instance identifier: `tarang-production-db`
   - Master username: `tarang_admin`
   - Master password: Generate strong password (save securely!)

4. **Instance configuration:**
   - DB instance class: 
     - Development: `db.t3.micro` (free tier eligible)
     - Production: `db.t3.small` or `db.t3.medium`
   - Storage type: **General Purpose SSD (gp3)**
   - Allocated storage: **20 GB** (auto-scaling enabled)

5. **Connectivity:**
   - VPC: Default VPC (or custom VPC)
   - Public access: **Yes** (for App Runner access)
   - VPC security group: Create new or use existing
   - Availability Zone: **ap-south-1a** (Mumbai)

6. **Database authentication:**
   - Password authentication (default)

7. **Additional configuration:**
   - Initial database name: `tarang_production`
   - Backup retention: **7 days** (recommended)
   - Enable encryption: **Yes**
   - Enable Enhanced Monitoring: **Yes** (optional)
   - Enable Performance Insights: **Yes** (optional)

8. Click **Create database**

#### Option B: AWS CLI

```bash
aws rds create-db-instance \
  --db-instance-identifier tarang-production-db \
  --db-instance-class db.t3.small \
  --engine postgres \
  --engine-version 15.4 \
  --master-username tarang_admin \
  --master-user-password 'YourSecurePassword123!' \
  --allocated-storage 20 \
  --storage-type gp3 \
  --storage-encrypted \
  --db-name tarang_production \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --publicly-accessible \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00" \
  --region ap-south-1 \
  --tags Key=Project,Value=TARANG Key=Environment,Value=Production
```

### Step 2: Configure Security Group

1. Go to **EC2 Console** → **Security Groups**
2. Find the security group attached to your RDS instance
3. **Edit inbound rules:**
   - Type: **PostgreSQL**
   - Protocol: **TCP**
   - Port: **5432**
   - Source: 
     - For App Runner: `0.0.0.0/0` (App Runner uses dynamic IPs)
     - For VPC: Your VPC CIDR block
     - For specific IPs: Your office/home IP for testing

**Security Note:** For production, consider using AWS PrivateLink or VPC peering for more secure connectivity.

### Step 3: Get Connection Details

After RDS instance is created (5-10 minutes):

1. Go to **RDS Console** → **Databases** → Select your instance
2. Copy the **Endpoint** (e.g., `tarang-production-db.abc123.ap-south-1.rds.amazonaws.com`)
3. Note the **Port** (default: 5432)

### Step 4: Test Connection

```bash
# Install PostgreSQL client (if not already installed)
# Ubuntu/Debian:
sudo apt-get install postgresql-client

# macOS:
brew install postgresql

# Test connection
psql -h tarang-production-db.abc123.ap-south-1.rds.amazonaws.com \
     -p 5432 \
     -U tarang_admin \
     -d tarang_production

# Enter password when prompted
# If successful, you'll see: tarang_production=>
```

## Environment Configuration

### For AWS App Runner

Configure these environment variables in App Runner console:

```env
# Database Configuration (Individual Variables - Recommended)
DB_HOST=tarang-production-db.abc123.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=tarang_production
DB_USER=tarang_admin
DB_PASSWORD=YourSecurePassword123!
DB_SSL=require

# Security
SECRET_KEY=your-32-byte-encryption-key
JWT_SECRET=your-64-char-jwt-secret

# AWS Services
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### Alternative: Using DATABASE_URL

If you prefer a single connection string:

```env
DATABASE_URL=postgresql://tarang_admin:YourSecurePassword123!@tarang-production-db.abc123.ap-south-1.rds.amazonaws.com:5432/tarang_production?sslmode=require
```

**Note:** Individual `DB_*` variables take priority if both are set.

## SSL Configuration

### SSL Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `disable` | No SSL | Local development only |
| `require` | SSL required, no certificate verification | AWS RDS (recommended) |
| `verify-ca` | SSL with CA certificate verification | High security |
| `verify-full` | SSL with full certificate verification | Maximum security |

### AWS RDS SSL

AWS RDS PostgreSQL supports SSL by default. Set:

```env
DB_SSL=require
```

This ensures encrypted connections without requiring certificate files.

### Download RDS Certificate (Optional)

For `verify-ca` or `verify-full` modes:

```bash
# Download AWS RDS CA certificate
wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

# Set in environment
DB_SSL=verify-full
DB_SSL_CERT=/path/to/global-bundle.pem
```

## Database Initialization

### Automatic Initialization

The application automatically creates tables on first run:

```python
# In database.py
def init_db():
    """Explicitly create tables + migrate missing columns for production."""
    Base.metadata.create_all(bind=engine)
```

### Manual Initialization

If you need to initialize manually:

```bash
# Connect to your app container or run locally
python -c "from app.database import init_db; init_db()"
```

### Database Migrations

For schema changes, the application includes automatic column migration:

```python
def _migrate_missing_columns():
    """Add columns that exist in the ORM but not in the live database."""
    # Automatically adds missing columns
```

## Connection Pooling

The application uses SQLAlchemy connection pooling for optimal performance:

```python
engine = create_engine(
    database_url,
    pool_pre_ping=True,      # Verify connections before using
    pool_size=10,            # Connection pool size
    max_overflow=20,         # Max connections beyond pool_size
    pool_recycle=3600,       # Recycle connections after 1 hour
)
```

### Pool Configuration

Adjust based on your workload:

- **Low traffic:** `pool_size=5, max_overflow=10`
- **Medium traffic:** `pool_size=10, max_overflow=20` (default)
- **High traffic:** `pool_size=20, max_overflow=40`

## Monitoring & Maintenance

### CloudWatch Metrics

Monitor these RDS metrics:

- **CPUUtilization:** Should stay below 80%
- **DatabaseConnections:** Monitor connection pool usage
- **FreeableMemory:** Ensure sufficient memory
- **ReadLatency / WriteLatency:** Database performance
- **FreeStorageSpace:** Monitor disk usage

### Performance Insights

Enable Performance Insights for detailed query analysis:

1. RDS Console → Your instance → **Configuration**
2. Enable **Performance Insights**
3. View slow queries and optimize

### Automated Backups

AWS RDS automatically backs up your database:

- **Backup window:** Configured during setup
- **Retention:** 7 days (recommended)
- **Point-in-time recovery:** Available within retention period

### Manual Snapshots

Create manual snapshots before major changes:

```bash
aws rds create-db-snapshot \
  --db-instance-identifier tarang-production-db \
  --db-snapshot-identifier tarang-backup-$(date +%Y%m%d) \
  --region ap-south-1
```

## Security Best Practices

### 1. Use AWS Secrets Manager

Store database credentials securely:

```bash
# Create secret
aws secretsmanager create-secret \
  --name tarang/database/credentials \
  --secret-string '{
    "username":"tarang_admin",
    "password":"YourSecurePassword123!",
    "host":"tarang-production-db.abc123.ap-south-1.rds.amazonaws.com",
    "port":"5432",
    "dbname":"tarang_production"
  }' \
  --region ap-south-1

# Retrieve in application
aws secretsmanager get-secret-value \
  --secret-id tarang/database/credentials \
  --region ap-south-1
```

### 2. Enable Encryption

- **At-rest encryption:** Enabled during RDS creation
- **In-transit encryption:** Use `DB_SSL=require`
- **PII encryption:** Application-level with `SECRET_KEY`

### 3. Regular Password Rotation

Rotate database passwords every 90 days:

```bash
aws rds modify-db-instance \
  --db-instance-identifier tarang-production-db \
  --master-user-password 'NewSecurePassword456!' \
  --apply-immediately
```

### 4. Restrict Network Access

- Use security groups to limit access
- Consider VPC peering for App Runner
- Enable VPC Flow Logs for audit

### 5. Enable Audit Logging

Enable PostgreSQL audit logging:

```sql
-- Connect to database
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_connections = 'on';
ALTER SYSTEM SET log_disconnections = 'on';
```

## Troubleshooting

### Connection Refused

**Symptoms:** `could not connect to server: Connection refused`

**Solutions:**
1. Check security group allows port 5432
2. Verify RDS instance is publicly accessible
3. Confirm endpoint and port are correct
4. Check VPC and subnet configuration

```bash
# Test network connectivity
telnet tarang-production-db.abc123.ap-south-1.rds.amazonaws.com 5432
```

### SSL Connection Error

**Symptoms:** `SSL connection has been closed unexpectedly`

**Solutions:**
1. Set `DB_SSL=require` (not `verify-full`)
2. Ensure RDS instance supports SSL
3. Check PostgreSQL version compatibility

### Authentication Failed

**Symptoms:** `password authentication failed for user`

**Solutions:**
1. Verify username and password
2. Check master user credentials in RDS console
3. Ensure no special characters causing issues
4. Try resetting password

### Too Many Connections

**Symptoms:** `FATAL: remaining connection slots are reserved`

**Solutions:**
1. Increase `max_connections` parameter
2. Reduce connection pool size
3. Check for connection leaks in application
4. Upgrade RDS instance class

```bash
# Check current connections
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT count(*) FROM pg_stat_activity;"
```

### Slow Queries

**Solutions:**
1. Enable Performance Insights
2. Add database indexes
3. Optimize SQLAlchemy queries
4. Increase RDS instance size

```sql
-- Find slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## Cost Optimization

### Estimated Costs (ap-south-1)

**RDS Instance:**
- db.t3.micro (free tier): $0/month (first 12 months)
- db.t3.small: ~$25/month
- db.t3.medium: ~$50/month

**Storage:**
- 20 GB gp3: ~$2.50/month
- Backup storage: First 20 GB free

**Data Transfer:**
- Within same AZ: Free
- Between AZs: $0.01/GB

**Total Estimated Cost:**
- Development: $0-5/month (free tier)
- Production: $30-60/month

### Cost Saving Tips

1. **Use free tier:** db.t3.micro for first 12 months
2. **Right-size instance:** Start small, scale up as needed
3. **Delete old snapshots:** Keep only necessary backups
4. **Use Reserved Instances:** Save up to 60% for 1-3 year commitment
5. **Stop dev instances:** Stop non-production instances when not in use

## Migration from SQLite

### Export SQLite Data

```bash
# Dump SQLite data
sqlite3 tarang.db .dump > tarang_dump.sql
```

### Import to PostgreSQL

```bash
# Clean up SQLite-specific syntax
sed -i 's/AUTOINCREMENT/SERIAL/g' tarang_dump.sql

# Import to PostgreSQL
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f tarang_dump.sql
```

### Verify Migration

```sql
-- Check table counts
SELECT schemaname, tablename, n_tup_ins as row_count
FROM pg_stat_user_tables
ORDER BY tablename;
```

## Production Checklist

- [ ] RDS instance created in ap-south-1
- [ ] Security group configured for port 5432
- [ ] SSL enabled (`DB_SSL=require`)
- [ ] Strong master password set
- [ ] Automated backups enabled (7 days)
- [ ] Encryption at rest enabled
- [ ] Performance Insights enabled
- [ ] CloudWatch alarms configured
- [ ] Database credentials stored in Secrets Manager
- [ ] Connection tested from App Runner
- [ ] Tables initialized successfully
- [ ] Sample data inserted and verified
- [ ] Monitoring dashboard created
- [ ] Backup/restore procedure tested

## Next Steps

1. **Configure environment variables** in AWS App Runner
2. **Test database connection** from application
3. **Initialize database tables** on first deployment
4. **Set up monitoring** with CloudWatch
5. **Configure automated backups**
6. **Document connection details** securely
7. **Test failover** and recovery procedures

---

**Your AWS RDS PostgreSQL database is now production-ready! 🎉**

All database connection logic has been refactored to support:
- ✅ Individual DB_* environment variables
- ✅ SSL encryption for AWS RDS
- ✅ Connection pooling for performance
- ✅ Automatic table initialization
- ✅ SQLite fallback for development
- ✅ Comprehensive error handling
