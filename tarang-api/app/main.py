from fastapi import FastAPI, Body, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from typing import List, Dict, Optional, Any
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.agents.screening_ml import ScreeningAgent  # ML-powered agent using real UCI data
from app.agents.clinical import ClinicalSupportAgent
from app.agents.therapy import TherapyPlanningAgent
from app.agents.outcome import OutcomeAgent
from app.agents.social import SocialAgent
from app.agents.clinician import ClinicianAgent
from app.agents.sre import SREAgent
from app.agents.demo import DemoAgent
from app.reports import ReportGenerator
from app.fhir import FHIRMapper
from app.schemas import (
    ScreeningBase, CommunityPostCreate, AppointmentSchedule,
    UserCreate, UserOut, Token, TokenData, OrganizationCreate, PatientCreate,
    TherapyProgressCreate, TherapyProgressOut
)
from app.security import (
    get_current_user, get_password_hash, verify_password, create_access_token
)
from app.database import (
    SessionLocal, ScreeningSession, ClinicCenter, CommunityPost,
    User, Organization, Patient, init_db
)
from fastapi.security import OAuth2PasswordRequestForm
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.requests import Request
from starlette.responses import Response
from fastapi.responses import StreamingResponse
import uvicorn
from app.config import settings
import json
import re
import logging
import datetime

# Structured Logging Setup (JSON) - Fixes CWE-117
class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": self.sanitize(record.getMessage()),
            "module": record.module,
            "func": record.funcName
        }
        if hasattr(record, "extra"):
            log_record.update(record.extra)
        return json.dumps(log_record)

    def sanitize(self, text):
        # Neutralize newline injection and other dangerous characters
        if not isinstance(text, str):
            text = str(text)
        return re.sub(r"[\r\n\t]", " ", text).strip()

handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logging.basicConfig(level=logging.INFO, handlers=[handler])
logger = logging.getLogger("tarang-industrial")

app = FastAPI(
    title="TARANG Industrial API", 
    version="1.0.0",
    description="Enterprise-grade Autism Care Continuum API"
)

@app.on_event("startup")
def on_startup():
    init_db()

# CORS must be added FIRST so it wraps all responses (including error responses)
if isinstance(settings.ALLOWED_ORIGINS, str):
    _origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
elif isinstance(settings.ALLOWED_ORIGINS, list):
    _origins = [o.strip() for o in settings.ALLOWED_ORIGINS if o.strip()]
else:
    _origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True if _origins != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Rate Limiter Setup
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Request Size Limit Middleware (CWE-770)
MAX_REQUEST_SIZE = 1024 * 1024 * 10  # 10MB
@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_REQUEST_SIZE:
        return Response(content="Payload too large", status_code=413)
    return await call_next(request)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize Agents
screening_agent = ScreeningAgent()
clinical_agent = ClinicalSupportAgent()
therapy_agent = TherapyPlanningAgent()
outcome_agent = OutcomeAgent()
social_agent = SocialAgent()
clinician_agent = ClinicianAgent()
sre_agent = SREAgent()
demo_agent = DemoAgent()

@app.get("/health")
def health_check():
    from app.database import DATABASE_URL
    db_type = "PostgreSQL" if DATABASE_URL.startswith("postgresql") else "SQLite"
    return {
        "status": "operational", 
        "timestamp": str(datetime.datetime.now()),
        "database_type": db_type,
        "is_production": db_type == "PostgreSQL"
    }

# --- AUTH & TENANCY ROUTES ---

@app.post("/auth/demo/{role}", response_model=Token)
async def login_demo(role: str, db: Session = Depends(get_db)):
    """
    PROTOTYPE ONLY: Generates a valid token for a demo user without password check.
    Bypasses bcrypt entirely.
    """
    role = role.lower()
    email = f"demo_{role}@tarang.ai"
    
    try:
        # Find or create demo user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            # Handle Organization for Clinician/Admin - Ensure Valid Org Exists
            org_id = None
            if role in ["clinician", "doctor"]:
                # Check if default org exists, if not create it
                org = db.query(Organization).first()
                if not org:
                    org = Organization(
                        name="Demo Clinic",
                        license_key="DEMO-LICENSE-001"
                    )
                    db.add(org)
                    db.commit()
                    db.refresh(org)
                org_id = org.id
            
            # Create User
            user = User(
                email=email,
                hashed_password="demo_hash_bypass", # Dummy hash
                full_name=f"Demo {role.capitalize()}",
                role=role,
                org_id=org_id,
                profile_metadata={"demo": True}
            )
            db.add(user)
            db.commit()
            db.refresh(user)
    
        # Generate token
        access_token_expires = datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "role": user.role, "org_id": user.org_id},
            expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
        
    except Exception as e:
        print(f"DEMO LOGIN ERROR: {str(e)}") # Log to server console
        db.rollback()
        # Return the actual error message to the client for debugging
        raise HTTPException(
            status_code=500, 
            detail=f"Demo Login Failed: {str(e)}"
        )

@app.post("/auth/register", response_model=UserOut)
async def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Handle Organization linkage
    org_id = None
    if user_in.org_license:
        org = db.query(Organization).filter(Organization.license_key == user_in.org_license).first()
        if not org:
            raise HTTPException(status_code=404, detail="Invalid organization license key")
        org_id = org.id
    
    db_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        org_id=org_id,
        profile_metadata=user_in.profile_metadata
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/auth/token", response_model=Token)
@limiter.limit("5/minute")
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "org_id": user.org_id}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/organizations", response_model=OrganizationCreate)
async def create_organization(org_in: OrganizationCreate, db: Session = Depends(get_db)):
    db_org = Organization(name=org_in.name, license_key=org_in.license_key)
    db.add(db_org)
    db.commit()
    db.refresh(db_org)
    return db_org

# User Settings & Profile Endpoints
@app.put("/users/settings")
async def update_settings(
    settings: dict,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == current_user.sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.profile_metadata:
        user.profile_metadata = {}
    user.profile_metadata["settings"] = settings
    db.commit()
    return {"status": "success", "message": "Settings updated"}

@app.put("/users/profile")
async def update_profile(
    profile: dict,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == current_user.sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update profile fields
    if "phone" in profile:
        if not user.profile_metadata:
            user.profile_metadata = {}
        user.profile_metadata["phone"] = profile["phone"]
    if "address" in profile:
        if not user.profile_metadata:
            user.profile_metadata = {}
        user.profile_metadata["address"] = profile["address"]
    if "childName" in profile:
        if not user.profile_metadata:
            user.profile_metadata = {}
        user.profile_metadata["childName"] = profile["childName"]
    if "childAge" in profile:
        if not user.profile_metadata:
            user.profile_metadata = {}
        user.profile_metadata["childAge"] = profile["childAge"]
    
    db.commit()
    return {"status": "success", "message": "Profile updated"}

@app.get("/users/dashboard")
async def get_dashboard_data(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get user's screening sessions
    sessions = db.query(ScreeningSession).filter(
        ScreeningSession.patient_name == current_user.sub
    ).order_by(ScreeningSession.created_at.desc()).limit(10).all()
    
    # Calculate stats
    total_screenings = len(sessions)
    latest_risk = sessions[0].risk_score if sessions else 0
    
    # Generate chart data from sessions
    chart_data = []
    for i, session in enumerate(reversed(sessions[-6:])):
        chart_data.append({
            "name": f"W{i+1}",
            "score": int(session.risk_score) if session.risk_score else 0
        })
    
    return {
        "total_screenings": total_screenings,
        "latest_risk": latest_risk,
        "chart_data": chart_data,
        "stability_index": latest_risk if latest_risk else 0
    }

@app.get("/reports")
async def get_reports(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get user's screening sessions as reports
    sessions = db.query(ScreeningSession).filter(
        ScreeningSession.patient_name == current_user.sub
    ).order_by(ScreeningSession.created_at.desc()).all()
    
    reports = []
    for session in sessions:
        reports.append({
            "id": session.id,
            "sid": f"#TR-{session.id + 8800}",
            "date": session.created_at.strftime("%b %d, %Y"),
            "type": "Clinical Fusion" if session.risk_score > 60 else "Gaze Baseline",
            "patient": session.patient_name,
            "risk": f"{session.risk_score:.1f}%" if session.risk_score else "N/A",
            "status": "Available"
        })
    
    return reports

@app.get("/clinical/patients")
async def get_clinical_patients(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only for doctors/clinicians
    if current_user.role not in ["doctor", "clinician", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get patients from same organization
    patients = db.query(Patient).filter(
        Patient.org_id == current_user.org_id
    ).limit(20).all()
    
    result = []
    for patient in patients:
        # Get latest session for each patient
        latest_session = db.query(ScreeningSession).filter(
            ScreeningSession.patient_id == patient.id
        ).order_by(ScreeningSession.created_at.desc()).first()
        
        risk_level = "Low"
        if latest_session and latest_session.risk_score:
            if latest_session.risk_score > 70:
                risk_level = "High"
            elif latest_session.risk_score > 50:
                risk_level = "Medium"
        
        result.append({
            "id": patient.external_id,
            "name": patient.name,
            "risk": risk_level,
            "stability": f"{latest_session.risk_score:.1f}%" if latest_session and latest_session.risk_score else "N/A",
            "nextDrill": "11:30"  # Placeholder
        })
    
    return result

@app.post("/screening/process")
@app.post("/screening/process-industrial")
@limiter.limit("5/minute")
async def process_screening_industrial(
    request: Request,
    payload: ScreeningBase,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    # Industrial isolation: Parents see only their sub-scoped data, 
    # Doctors see everything in their Organization.
    org_scope = current_user.org_id
    video_metrics = payload.video_metrics
    questionnaire_score = payload.questionnaire_score
    patient_name = payload.patient_name
    """
    Optimized endpoint with enhanced multimodal fusion and clinical explainability.
    """
    try:
        # 1. Immediate Screen Result (Hybrid - Optimized Screening Agent)
        risk_results = screening_agent.analyze_signals(video_metrics, questionnaire_score)
        clinical_summary = clinical_agent.generate_summary({"name": patient_name}, risk_results)
        
        # 2. Persistence (optional - don't fail if DB is unavailable)
        session_id = None
        try:
            logger.info("Persistence attempt", extra={"patient": re.sub(r"[^\w]", "_", patient_name)})
            db_session = ScreeningSession(
                patient_name=current_user.sub,
                risk_score=risk_results["risk_score"],
                confidence=risk_results["confidence"],
                dissonance_factor=risk_results.get("dissonance_factor"),
                interpretation=risk_results.get("interpretation"),
                breakdown=risk_results["breakdown"],
                clinical_recommendation=clinical_summary["clinical_recommendation"]
            )
            db.add(db_session)
            db.commit()
            db.refresh(db_session)
            session_id = db_session.id
            logger.info("Persisted successfully", extra={"session_id": session_id})
        except Exception as db_error:
            logger.error(f"❌ DB persistence failed: {str(db_error)}")
            db.rollback()
        
        # 3. Offload Heavy AI to Worker (optional)
        async_status = "Sync mode"
        try:
            process_heavy_ai_fusion.delay(session_id or 0, "s3://vids/session_id_raw.mp4")
            async_status = "Processing Heavy AI..."
        except Exception as worker_error:
            logger.warning(f"Celery worker unavailable: {worker_error}")
        
        logger.info("Screening process complete", extra={"patient": re.sub(r"[^\w]", "_", patient_name), "session_id": session_id})
        
        return {
            "session_id": session_id,
            "risk_results": risk_results,
            "clinical_summary": clinical_summary,
            "therapy_plan": therapy_agent.create_plan(risk_results),
            "async_status": async_status,
            "report_url": f"/reports/{session_id}/download" if session_id else None
        }
    except Exception as e:
        logger.error(f"Industrial processing failure: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")


@app.post("/reports/generate")
async def generate_report_pdf(data: dict = Body(...), current_user: TokenData = Depends(get_current_user)):
    """
    Generates a PDF report on-the-fly from provided session data.
    """
    try:
        pdf_buffer = ReportGenerator.generate_clinical_pdf(data)
        return StreamingResponse(
            pdf_buffer, 
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=tarang_report_generated.pdf"}
        )
    except Exception as e:
        logger.error(f"PDF Generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Report generation failed")

@app.get("/reports/{session_id}/download")
async def download_report(session_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    """
    Downloads a persisted report for a specific session.
    """
    session = db.query(ScreeningSession).filter(ScreeningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # Security check: Ensure user owns this session or is clinician/admin
    # Note: For hackathon velocity we are skipping strict ownership check here for 'demo' flow simplicity
    # but in prod we would check session.patient_id or similar.
    
    # Reconstruct data for report generator
    report_data = {
        "patient_name": session.patient_name,
        "timestamp": str(session.created_at),
        "risk_score": session.risk_score,
        "confidence": session.confidence,
        "breakdown": session.breakdown,
        "clinical_recommendation": session.clinical_recommendation
    }
    
    pdf_buffer = ReportGenerator.generate_clinical_pdf(report_data)
    return StreamingResponse(
        pdf_buffer, 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=tarang_report_{session_id}.pdf"}
    )


@app.get("/reports/{session_id}/detail")
async def get_report_detail(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Returns detailed JSON for the XAI Dashboard.
    """
    session = db.query(ScreeningSession).filter(ScreeningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Scoping check: Doctors can see anything in their Org, Parents see only their sub-scoped ID
    # (Simplified for now: check Org linkage)
    # Note: ScreeningSession needs a patient_id or org_id for strict enforcement.
    # For now, we'll use the patient relationship if it exists.
    
    return {
        "id": session.id,
        "patient_name": session.patient_name,
        "risk_score": session.risk_score,
        "confidence": session.confidence,
        "dissonance_factor": session.dissonance_factor,
        "interpretation": session.interpretation,
        "breakdown": session.breakdown,
        "clinical_recommendation": session.clinical_recommendation,
        "created_at": session.created_at.isoformat() if session.created_at else None
    }

@app.get("/reports/{session_id}/fhir")
async def export_fhir_report(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Exports a screening session in HL7 FHIR R4 format.
    """
    session = db.query(ScreeningSession).filter(ScreeningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Security: Ensure user belongs to the same Org as the patient
    patient = db.query(Patient).filter(Patient.id == session.patient_id).first()
    if patient and patient.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    return {
        "observation": FHIRMapper.to_observation(session),
        "report": FHIRMapper.to_diagnostic_report(session)
    }

@app.get("/appointments/schedule")
async def schedule_appointment():
    return {"status": "success", "message": "Appointment scheduled"}

# --- WebRTC SIGNALING (PHASE 7) ---

class SignalingManager:
    def __init__(self):
        self.active_rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_rooms:
            self.active_rooms[room_id] = []
        self.active_rooms[room_id].append(websocket)
        logger.info(f"Peer connected to room {room_id}. Total: {len(self.active_rooms[room_id])}")

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_rooms:
            self.active_rooms[room_id].remove(websocket)
            if not self.active_rooms[room_id]:
                del self.active_rooms[room_id]
        logger.info(f"Peer disconnected from room {room_id}")

    async def broadcast(self, message: str, room_id: str, sender: WebSocket):
        if room_id in self.active_rooms:
            for connection in self.active_rooms[room_id]:
                if connection != sender:
                    await connection.send_text(message)

signaling_manager = SignalingManager()

@app.websocket("/ws/screening/{room_id}")
async def screening_signaling(websocket: WebSocket, room_id: str):
    """
    WebSocket endpoint for WebRTC signaling (SDP/ICE Exchange).
    Requires JWT token for authentication via query parameter.
    """
    # Extract token from query parameters
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008, reason="Missing authentication token")
        return
    
    # Verify token
    from app.security import decode_websocket_token
    user_data = decode_websocket_token(token)
    if not user_data:
        await websocket.close(code=1008, reason="Invalid authentication token")
        return
    
    logger.info(f"Authenticated WebSocket connection for user {user_data.username} in room {room_id}")
    
    await signaling_manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Broadcast the signal to the other peer in the room
            await signaling_manager.broadcast(data, room_id, websocket)
    except WebSocketDisconnect:
        signaling_manager.disconnect(websocket, room_id)
    except Exception as e:
        logger.error(f"Signaling error in room {room_id}: {str(e)}")
        signaling_manager.disconnect(websocket, room_id)

@app.get("/reports/{session_id}/download")
async def download_report(
    session_id: int, 
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    session = db.query(ScreeningSession).filter(ScreeningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Security: Ensure user belongs to the same Org as the patient
    patient = db.query(Patient).filter(Patient.id == session.patient_id).first()
    if patient and patient.org_id != current_user.org_id:
        logger.warning("Unauthorized access attempt to report", extra={
            "user": current_user.sub,
            "session": session_id
        })
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    session_data = {
        "patient_name": session.patient_name,
        "risk_score": session.risk_score,
        "confidence": session.confidence,
        "breakdown": session.breakdown,
        "clinical_recommendation": session.clinical_recommendation,
        "timestamp": session.created_at.strftime("%Y-%m-%d %H:%M:%S")
    }
    
    pdf_buffer = ReportGenerator.generate_clinical_pdf(session_data)
    return StreamingResponse(
        pdf_buffer, 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=tarang_report_{session_id}.pdf"}
    )

@app.post("/appointments/schedule")
async def schedule_appointment(
    payload: AppointmentSchedule,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    patient_id = payload.patient_id
    specialist_id = payload.specialist_id
    timeslot = payload.timeslot
    # Industrial scheduling logic (mocked)
    logger.info("Scheduling attempt", extra={
        "patient": re.sub(r"[^\w]", "_", patient_id),
        "specialist": re.sub(r"[^\w]", "_", specialist_id),
        "time": re.sub(r"[\r\n]", " ", timeslot)
    })
    return {"status": "Confirmed", "reservation_id": "RSV_7721", "timeslot": timeslot}

@app.get("/analytics/prediction/{patient_name}")
async def get_patient_prediction(
    patient_name: str,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    sessions = db.query(ScreeningSession).filter(ScreeningSession.patient_name == patient_name).all()
    scores = [s.risk_score for s in sessions]
    
    if not scores:
        if settings.DEMO_MODE:
            scores = [38.0, 42.5, 35.0, 55.2]
        else:
            return {"patient": patient_name, "historical_count": 0, "prediction": None, "clinical_insight": None, "history": []}
        
    prediction = outcome_agent.predict_trajectory(scores)
    alert = outcome_agent.generate_intervention_alert(prediction)
    
    return {
        "patient": patient_name,
        "historical_count": len(sessions),
        "prediction": prediction,
        "clinical_insight": alert,
        "history": scores # Return raw scores for frontend charting
    }

@app.get("/centers")
async def get_centers(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    centers = db.query(ClinicCenter).all()
    if not centers:
        if settings.DEMO_MODE:
            return [
                {"id": 1, "name": "Tarang Delhi Center", "location": "New Delhi", "patients": 142},
                {"id": 2, "name": "Tarang Mumbai Hub", "location": "Mumbai", "patients": 89}
            ]
        return []
    return centers

@app.get("/community")
async def get_community_posts(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    # Industrial: Filter posts by Organization
    posts = db.query(CommunityPost).filter(
        CommunityPost.is_safe == 1,
        (CommunityPost.org_id == current_user.org_id) | (CommunityPost.org_id == None)
    ).order_by(CommunityPost.created_at.desc()).all()
    if not posts:
        if settings.DEMO_MODE:
            return [
                {"id": 1, "author": "Sarah M.", "content": "Just finished our first 'Gaze Baseline' screening. The data visualization really helped me explain Arvid's behavior to his teacher.", "is_safe": 1},
                {"id": 2, "author": "David K.", "content": "Does anyone have tips for sensory-friendly routine apps that sync with Tarang?", "is_safe": 1}
            ]
        return []
    return posts

@app.post("/community/post")
@limiter.limit("2/minute")
async def create_post(
    request: Request,
    payload: CommunityPostCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    author = payload.author
    content = payload.content
    try:
        logger.info("Post creation attempt", extra={"author": re.sub(r"[^\w]", "_", author)})
        moderation = social_agent.moderate_content(content)
        db_post = CommunityPost(
            author=author, 
            content=content, 
            is_safe=1 if moderation["safe"] else 0,
            org_id=current_user.org_id
        )
        db.add(db_post)
        db.commit()
        db.refresh(db_post)
        logger.info("Post created successfully", extra={"id": db_post.id})
        return {"status": "Posted", "moderation": moderation, "id": db_post.id}
    except Exception as e:
        logger.error(f"❌ Failed to create community post: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Post failed: {str(e)}")

@app.post("/community/help")
async def get_ai_help(
    query: str = Body(...),
    current_user: TokenData = Depends(get_current_user)
):
    resources = social_agent.match_resources(query)
    return {"suggested_resources": resources}

@app.get("/clinical/center/{center_id}/health")
async def get_center_health(
    center_id: int,
    current_user: TokenData = Depends(get_current_user)
):
    return clinician_agent.get_center_health(center_id)

@app.post("/clinical/tele-session/{patient_id}")
async def start_tele_session(
    patient_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    return clinician_agent.prepare_tele_session(patient_id)

@app.get("/system/health")
async def get_system_health():
    return sre_agent.get_system_health()

@app.post("/demo/run")
async def run_full_demo():
    return demo_agent.run_full_cycle_demo()

# --- PHASE 8: INTELLIGENCE & PREDICTIVE OUTCOMES ---

@app.post("/patients", response_model=PatientCreate)
async def create_patient_secure(
    payload: PatientCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Securely creates a patient record with AES-256 PII encryption (Auto-handled by database.py).
    """
    db_patient = Patient(
        name=payload.name,
        external_id=payload.external_id,
        date_of_birth=payload.date_of_birth,
        phone=payload.phone,
        address=payload.address,
        org_id=current_user.org_id
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@app.get("/patients", response_model=List[PatientCreate])
async def get_patients_secure(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Returns organization-scoped patient list.
    """
    return db.query(Patient).filter(Patient.org_id == current_user.org_id).all()

@app.post("/clinical/progress", response_model=TherapyProgressOut)
async def record_therapy_progress(
    payload: TherapyProgressCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Records a longitudinal progress point for intervention analysis.
    """
    db_progress = TherapyProgress(
        patient_id=payload.patient_id,
        session_id=payload.session_id,
        social_engagement=payload.social_engagement,
        joint_attention=payload.joint_attention,
        focus_drift=payload.focus_drift,
        notes=payload.notes
    )
    db.add(db_progress)
    db.commit()
    db.refresh(db_progress)
    return db_progress

@app.get("/clinical/drift/{patient_id}")
async def get_intervention_drift(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Returns predictive drift analysis using the OutcomeAgent.
    """
    # Scoping check
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient or patient.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to patient data")

    history = db.query(TherapyProgress)\
        .filter(TherapyProgress.patient_id == patient_id)\
        .order_by(TherapyProgress.timestamp.asc()).all()

    # Convert to list of dicts for agent
    progress_data = [
        {
            "social_engagement": p.social_engagement,
            "joint_attention": p.joint_attention,
            "focus_drift": p.focus_drift
        } for p in history
    ]

    analysis = outcome_agent.analyze_intervention_efficacy(progress_data)
    
    # Also get trajectory from risk scores
    sessions = db.query(ScreeningSession).filter(ScreeningSession.patient_id == patient_id).all()
    risk_history = [s.risk_score for s in sessions]
    trajectory = outcome_agent.predict_trajectory(risk_history)

    return {
        "patient_id": patient_id,
        "history_count": len(history),
        "intervention_analysis": analysis,
        "risk_trajectory": trajectory
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
