from sqlalchemy import create_engine, Column, String, Float, Integer, JSON, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import os

# Read database URL from environment, fallback to SQLite for local development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tarang.db")

# SQLAlchemy 1.4+ requires "postgresql://" instead of "postgres://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Handle SQLite-specific connection args
if DATABASE_URL.startswith("sqlite"):
    print("🗄️ Using local SQLite database.")
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    print(f"🐘 Using production PostgreSQL database.")
    # PostgreSQL for production (Render/Neon)
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class ClinicCenter(Base):
    __tablename__ = "clinic_centers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    location = Column(String)
    admin_email = Column(String)

class CommunityPost(Base):
    __tablename__ = "community_posts"
    id = Column(Integer, primary_key=True, index=True)
    author = Column(String)
    content = Column(String)
    is_safe = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ScreeningSession(Base):
    __tablename__ = "screening_sessions"

    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String)
    risk_score = Column(Float)
    confidence = Column(String)
    dissonance_factor = Column(Float, nullable=True)
    interpretation = Column(String, nullable=True)
    breakdown = Column(JSON)
    clinical_recommendation = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

Base.metadata.create_all(bind=engine)
