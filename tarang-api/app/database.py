from sqlalchemy import create_engine, Column, String, Float, Integer, JSON, DateTime, ForeignKey, Boolean, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy_utils import EncryptedType
from sqlalchemy_utils.types.encrypted.encrypted_type import AesEngine
import datetime
import os

# Read database URL from environment, fallback to SQLite for local development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tarang.db")

# SECRET_KEY must be set in production for PII encryption
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    # Only allow fallback for local SQLite development
    if DATABASE_URL.startswith("sqlite"):
        SECRET_KEY = "dev_key_16bytes!"  # Exactly 16 bytes for local dev only
        print("⚠️ WARNING: Using development SECRET_KEY. DO NOT USE IN PRODUCTION!")
    else:
        raise ValueError("SECRET_KEY environment variable must be set for production database")

# Handle SQLite-specific connection args
if DATABASE_URL.startswith("sqlite"):
    print("🗄️ Using local SQLite database.")
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    print(f"🐘 Using production PostgreSQL database.")
    # PostgreSQL for production (Render/Neon)
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

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
    role = Column(String, default="parent")  # parent, doctor, admin
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

