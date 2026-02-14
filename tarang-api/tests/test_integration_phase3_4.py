import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app, get_db
from datetime import datetime
from app.database import Base, User, Patient, ScreeningSession, Organization, ClinicCenter
from app.config import settings

# Use SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Mock Auth
from app.security import get_current_user
from app.schemas import TokenData

def override_get_current_user():
    return TokenData(sub="test@test.com", role="parent", org_id=1)

app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_db():
    Base.metadata.create_all(bind=engine)
    print(f"Created tables: {Base.metadata.tables.keys()}")
    db = TestingSessionLocal()
    
    # Create Test Data
    org = Organization(name="Test Org", license_key="TEST-123")
    db.add(org)
    db.commit()
    
    parent = User(email="parent@test.com", hashed_password="pw", full_name="Parent User", role="parent", org_id=org.id)
    db.add(parent)
    db.commit()
    
    child = Patient(name="Test Child", external_id="C-123", date_of_birth=datetime.now(), parent_user_id=parent.id, org_id=org.id)
    db.add(child)
    db.commit()
    
    yield db
    Base.metadata.drop_all(bind=engine)

def test_demo_mode_analytics():
    # Simulate DEMO_MODE=True
    original_demo_mode = settings.DEMO_MODE
    settings.DEMO_MODE = True
    
    # Direct Analytics call (no auth for simplicity if mocked, but here we need valid token)
    # Mock Token: we can override get_current_user dependent too or use a valid token via login/register
    # For now, let's verify public/unprotected endpoints behave correctly with Toggle
    
    # Use Analytics Prediction endpoint
    # With DEMO_MODE=True, it should return synthetic scores even without DB data
    # Provide patient_name to avoid potential NoneType issues in response construction
    response = client.get("/analytics/prediction?patient_id=0&patient_name=TestDemo") 
    assert response.status_code == 200
    data = response.json()
    # Check for synthetic scores (e.g. risk_score present or specific values)
    # The endpoint returns a dict with 'prediction', 'history' etc.
    # In demo mode, it returns specific hardcoded values.
    # But wait, get_patient_prediction returns dict with keys.
    # Let's check if it returns non-empty result.
    assert data.get('prediction') is not None
    assert len(data.get('history', [])) > 0
    
    settings.DEMO_MODE = False
    response = client.get("/analytics/prediction?patient_id=0")
    assert response.status_code == 200
    # Should be empty/null in clean state
    data = response.json()
    assert data.get('prediction') is None
    assert len(data.get('history', [])) == 0
    
    settings.DEMO_MODE = original_demo_mode

def test_center_analytics_endpoint():
    # Test GET /analytics/center (Protected, Doctor role)
    # Re-use the mocked auth which is role='parent'. 
    # Wait, the endpoint requires role='doctor' or 'admin'.
    # We need to override the override_get_current_user for this specific test
    # or just Mock it globally to be 'doctor' for a second.
    
    from app.security import get_current_user
    from app.schemas import TokenData
    
    def mock_doctor_user():
        return TokenData(sub="doctor@hospital.com", role="doctor", org_id=1)
        
    app.dependency_overrides[get_current_user] = mock_doctor_user
    
    original_demo_mode = settings.DEMO_MODE
    settings.DEMO_MODE = True
    
    response = client.get("/analytics/center")
    assert response.status_code == 200
    data = response.json()
    assert data["org_id"] == 1
    assert data["total_patients"] > 0
    assert "weekly_activity" in data
    
    settings.DEMO_MODE = original_demo_mode

def test_screening_persistence_with_id():
    # Login as Parent
    # POST /screening/process with patient_id
    # Verify DB entry via direct query
    pass
