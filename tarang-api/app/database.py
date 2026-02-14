from sqlalchemy import create_engine, Column, String, Float, Integer, JSON, DateTime, ForeignKey, Boolean, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy_utils import EncryptedType
from sqlalchemy_utils.types.encrypted.encrypted_type import AesEngine
import datetime
import os
import logging

logger = logging.getLogger(__name__)

# =============================================================================
# DATABASE CONNECTION CONFIGURATION
# =============================================================================

def construct_database_url():
    """
    Constructs database URL from environment variables.
    Priority:
    1. Individual DB_* variables (AWS RDS recommended)
    2. DATABASE_URL string (legacy support)
    3. SQLite fallback (local development only)
    """
    
    # Option 1: Individual environment variables (AWS RDS recommended)
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_NAME")
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    
    if all([db_host, db_name, db_user, db_password]):
        # Construct PostgreSQL URL from components
        database_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        logger.info(f"🐘 Using AWS RDS PostgreSQL: {db_host}:{db_port}/{db_name}")
        return database_url, True  # is_postgres=True
    
    # Option 2: Legacy DATABASE_URL string
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        if database_url.startswith("postgres://"):
            # Fix Heroku/Railway postgres:// to postgresql://
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        
        if database_url.startswith("postgresql"):
            logger.info("🐘 Using PostgreSQL from DATABASE_URL")
            return database_url, True
        elif database_url.startswith("sqlite"):
            logger.info("🗄️ Using SQLite from DATABASE_URL")
            return database_url, False
    
    # Option 3: SQLite fallback for local development
    logger.warning("⚠️ No database configuration found. Using SQLite fallback for development.")
    logger.warning("⚠️ For production, set DB_HOST, DB_NAME, DB_USER, DB_PASSWORD")
    return "sqlite:///./tarang.db", False


def get_database_engine():
    """
    Creates SQLAlchemy engine with appropriate configuration for the database type.
    Supports SSL for AWS RDS PostgreSQL.
    """
    database_url, is_postgres = construct_database_url()
    
    if is_postgres:
        # PostgreSQL configuration for AWS RDS
        connect_args = {}
        
        # SSL Configuration for AWS RDS
        db_ssl = os.getenv("DB_SSL", "false").lower()
        if db_ssl in ["true", "require", "verify-full", "verify-ca"]:
            ssl_mode = db_ssl if db_ssl != "true" else "require"
            connect_args["sslmode"] = ssl_mode
            logger.info(f"🔒 PostgreSQL SSL enabled: sslmode={ssl_mode}")
        
        # Connection pool configuration for production
        engine = create_engine(
            database_url,
            connect_args=connect_args,
            pool_pre_ping=True,          # Verify connections before using
            pool_size=10,                 # Connection pool size
            max_overflow=20,              # Max connections beyond pool_size
            pool_recycle=3600,            # Recycle connections after 1 hour
            echo=False                    # Set to True for SQL query logging
        )
        logger.info("✅ PostgreSQL engine created with connection pooling")
        return engine, database_url
    
    else:
        # SQLite configuration for local development
        engine = create_engine(
            database_url,
            connect_args={"check_same_thread": False}
        )
        logger.info("✅ SQLite engine created for local development")
        return engine, database_url


# Initialize database engine
engine, DATABASE_URL = get_database_engine()

# SECRET_KEY must be set in production for PII encryption
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    # Only allow fallback for local SQLite development
    if DATABASE_URL.startswith("sqlite"):
        SECRET_KEY = "dev_key_16bytes!"  # Exactly 16 bytes for local dev only
        logger.warning("⚠️ WARNING: Using development SECRET_KEY. DO NOT USE IN PRODUCTION!")
    else:
        raise ValueError("SECRET_KEY environment variable must be set for production database")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    license_key = Column(String, unique=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    users = relationship("User", back_populates="organization")
    patients = relationship("Patient", back_populates="organization")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(EncryptedType(String, SECRET_KEY, AesEngine, 'pkcs5'))
    role = Column(String, default="parent")  # parent, clinician, admin
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    profile_metadata = Column(JSON, nullable=True)
    
    organization = relationship("Organization", back_populates="users")

class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String, unique=True, index=True) # Hospital PID
    name = Column(EncryptedType(String, SECRET_KEY, AesEngine, 'pkcs5'))
    date_of_birth = Column(DateTime)
    phone = Column(EncryptedType(String, SECRET_KEY, AesEngine, 'pkcs5'), nullable=True)
    address = Column(EncryptedType(String, SECRET_KEY, AesEngine, 'pkcs5'), nullable=True)
    org_id = Column(Integer, ForeignKey("organizations.id"))
    
    # Phase 2: Links to Parent and Clinician
    parent_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    clinician_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    organization = relationship("Organization", back_populates="patients")
    parent_user = relationship("User", foreign_keys=[parent_user_id], backref="children")
    clinician = relationship("User", foreign_keys=[clinician_id], backref="assigned_patients")
    
    sessions = relationship("ScreeningSession", back_populates="patient")
    progress = relationship("TherapyProgress", back_populates="patient")

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    clinician_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    status = Column(String, default="requested") # requested, confirmed, completed, cancelled
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", backref="appointments")
    clinician = relationship("User", foreign_keys=[clinician_id], backref="appointments")

class ClinicCenter(Base):
    __tablename__ = "clinic_centers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    location = Column(String)
    admin_email = Column(String)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)

class CommunityPost(Base):
    __tablename__ = "community_posts"
    id = Column(Integer, primary_key=True, index=True)
    author = Column(String)
    content = Column(String)
    is_safe = Column(Integer, default=1)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class TherapyProgress(Base):
    """
    Longitudinal intervention tracking for Phase 8 Predictive AI.
    """
    __tablename__ = "therapy_progress"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    session_id = Column(Integer, ForeignKey("screening_sessions.id"), nullable=True)
    
    # KPIs for longitudinal drift
    social_engagement = Column(Float) # 0-1
    joint_attention = Column(Float)   # 0-1
    focus_drift = Column(Float)       # 0-1
    
    notes = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    patient = relationship("Patient", back_populates="progress")

class ScreeningSession(Base):
    __tablename__ = "screening_sessions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    patient_name = Column(String) # For legacy/fallback
    risk_score = Column(Float)
    confidence = Column(String)
    dissonance_factor = Column(Float, nullable=True)
    interpretation = Column(String, nullable=True)
    breakdown = Column(JSON)
    clinical_recommendation = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    patient = relationship("Patient", back_populates="sessions")


def init_db():
    """Explicitly create tables + migrate missing columns for production."""
    Base.metadata.create_all(bind=engine)
    
    # Migrate missing columns on existing tables (create_all won't ALTER)
    if not DATABASE_URL.startswith("sqlite"):
        _migrate_missing_columns()


def _migrate_missing_columns():
    """Add columns that exist in the ORM but not in the live database."""
    migrations = [
        ("screening_sessions", "patient_id", "INTEGER"),
        ("screening_sessions", "dissonance_factor", "FLOAT"),
        ("screening_sessions", "interpretation", "VARCHAR"),
        ("patients", "parent_user_id", "INTEGER"),
        ("patients", "clinician_id", "INTEGER"),
    ]
    
    db = SessionLocal()
    try:
        for table, column, col_type in migrations:
            try:
                db.execute(
                    text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {column} {col_type}")
                )
            except Exception:
                pass  # Column already exists or DB doesn't support IF NOT EXISTS
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()


# Auto-init for development convenience (SQLite only)
if DATABASE_URL.startswith("sqlite"):
    init_db()

