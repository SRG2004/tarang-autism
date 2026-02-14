# Quick RDS Configuration - TARANG

## ⚡ Fast Setup

### 1. Create RDS Instance

**AWS Console → RDS → Create Database**

- Engine: PostgreSQL 15.x
- Instance: db.t3.small
- Storage: 20 GB gp3
- Region: ap-south-1 (Mumbai)
- Public access: Yes
- Database name: `tarang_production`
- Master username: `tarang_admin`
- Master password: (save securely!)

### 2. Configure Security Group

**EC2 → Security Groups → RDS Security Group**

Add inbound rule:
- Type: PostgreSQL
- Port: 5432
- Source: 0.0.0.0/0 (for App Runner)

### 3. Get Connection Details

**RDS Console → Your Instance**

Copy the **Endpoint** (e.g., `tarang-db.abc123.ap-south-1.rds.amazonaws.com`)

### 4. Set Environment Variables

**AWS App Runner → Configuration → Environment Variables**

```env
DB_HOST=tarang-db.abc123.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=tarang_production
DB_USER=tarang_admin
DB_PASSWORD=your_secure_password
DB_SSL=require
```

### 5. Test Connection

```bash
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
```

## 🔧 Configuration Options

### Option 1: Individual Variables (Recommended)

```env
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_NAME=tarang_production
DB_USER=tarang_admin
DB_PASSWORD=secure_password
DB_SSL=require
```

### Option 2: Connection String (Legacy)

```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

### Option 3: SQLite (Development)

```env
# No configuration needed - automatic fallback
```

## ✅ Verification

```bash
# Test connection
psql -h $DB_HOST -U $DB_USER -d $DB_NAME

# Check SSL
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT ssl_is_used();"

# Test from Python
python -c "from app.database import engine; print(engine.connect())"
```

## 📚 Full Documentation

- **Complete Setup:** `AWS_RDS_SETUP.md`
- **Configuration Guide:** `DATABASE_CONFIG_GUIDE.md`
- **Migration Summary:** `RDS_MIGRATION_SUMMARY.md`

## 🆘 Quick Troubleshooting

**Connection refused?**
- Check security group allows port 5432
- Verify RDS is publicly accessible

**SSL error?**
- Use `DB_SSL=require` (not verify-full)

**Authentication failed?**
- Verify username and password
- Check master credentials in RDS console

## 🚀 You're Ready!

All database configuration is production-ready for AWS RDS PostgreSQL!
