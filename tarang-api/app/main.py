from fastapi import FastAPI, Body, Depends, HTTPException, status
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
from app.database import SessionLocal, ScreeningSession, ClinicCenter, CommunityPost
from app.worker import process_heavy_ai_fusion
from app.reports import ReportGenerator
from fastapi.responses import StreamingResponse
import uvicorn
import logging
import datetime

# Industrial Logging Setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tarang-industrial")

app = FastAPI(
    title="TARANG Industrial API", 
    version="1.0.0",
    description="Enterprise-grade Autism Care Continuum API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Must be False when using wildcard origins
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

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
    return {"status": "operational", "timestamp": str(datetime.datetime.now())}

@app.post("/screening/process")
@app.post("/screening/process-industrial")
async def process_screening_industrial(
    video_metrics: dict = Body(...),
    questionnaire_score: int = Body(...),
    patient_name: str = Body(default="Industrial Demo"),
    db: Session = Depends(get_db)
):
    """
    Optimized endpoint with enhanced multimodal fusion and clinical explainability.
    """
    try:
        # 1. Immediate Screen Result (Hybrid - Optimized Screening Agent)
        risk_results = screening_agent.analyze_signals(video_metrics, questionnaire_score)
        clinical_summary = clinical_agent.generate_summary({"name": patient_name}, risk_results)
        
        # 2. Persistence with new metrics
        db_session = ScreeningSession(
            patient_name=patient_name,
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
        
        # 3. Offload Heavy AI to Worker (optional - gracefully handle if Redis unavailable)
        try:
            process_heavy_ai_fusion.delay(db_session.id, "s3://vids/session_id_raw.mp4")
            async_status = "Processing Heavy AI..."
        except Exception as worker_error:
            logger.warning(f"Celery worker unavailable: {worker_error}")
            async_status = "Sync mode (worker unavailable)"
        
        logger.info(f"Optimized screening processed for {patient_name}. Session ID: {db_session.id}")
        
        return {
            "session_id": db_session.id,
            "risk_results": risk_results, # Updated key name to match frontend expectation
            "clinical_summary": clinical_summary,
            "async_status": async_status,
            "report_url": f"/reports/{db_session.id}"
        }
    except Exception as e:
        logger.error(f"Industrial processing failure: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Scale Error")

@app.get("/reports/{session_id}/download")
async def download_report(session_id: int, db: Session = Depends(get_db)):
    session = db.query(ScreeningSession).filter(ScreeningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
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
    patient_id: str = Body(...),
    specialist_id: str = Body(...),
    timeslot: str = Body(...),
    db: Session = Depends(get_db)
):
    # Industrial scheduling logic (mocked)
    logger.info(f"Scheduling appointment for {patient_id} with {specialist_id} at {timeslot}")
    return {"status": "Confirmed", "reservation_id": "RSV_7721", "timeslot": timeslot}

@app.get("/analytics/prediction/{patient_name}")
async def get_patient_prediction(patient_name: str, db: Session = Depends(get_db)):
    sessions = db.query(ScreeningSession).filter(ScreeningSession.patient_name == patient_name).all()
    scores = [s.risk_score for s in sessions]
    
    if not scores:
        # Simulate historical data for demo if DB is empty
        scores = [38.0, 42.5, 35.0, 55.2]
        
    prediction = outcome_agent.predict_trajectory(scores)
    alert = outcome_agent.generate_intervention_alert(prediction)
    
    return {
        "patient": patient_name,
        "historical_count": len(sessions),
        "prediction": prediction,
        "clinical_insight": alert
    }

@app.get("/centers")
async def get_centers(db: Session = Depends(get_db)):
    centers = db.query(ClinicCenter).all()
    if not centers:
        return [
            {"id": 1, "name": "Tarang Delhi Center", "location": "New Delhi", "patients": 142},
            {"id": 2, "name": "Tarang Mumbai Hub", "location": "Mumbai", "patients": 89}
        ]
    return centers

@app.get("/community")
async def get_community_posts(db: Session = Depends(get_db)):
    posts = db.query(CommunityPost).filter(CommunityPost.is_safe == 1).order_by(CommunityPost.created_at.desc()).all()
    if not posts:
        return [
            {"id": 1, "author": "Sarah M.", "content": "Just finished our first 'Gaze Baseline' screening. The data visualization really helped me explain Arvid's behavior to his teacher.", "is_safe": 1},
            {"id": 2, "author": "David K.", "content": "Does anyone have tips for sensory-friendly routine apps that sync with Tarang?", "is_safe": 1}
        ]
    return posts

@app.post("/community/post")
async def create_post(author: str = Body(...), content: str = Body(...), db: Session = Depends(get_db)):
    moderation = social_agent.moderate_content(content)
    db_post = CommunityPost(author=author, content=content, is_safe=1 if moderation["safe"] else 0)
    db.add(db_post)
    db.commit()
    return {"status": "Posted", "moderation": moderation}

@app.post("/community/help")
async def get_ai_help(query: str = Body(...)):
    resources = social_agent.match_resources(query)
    return {"suggested_resources": resources}

@app.get("/clinical/center/{center_id}/health")
async def get_center_health(center_id: int):
    return clinician_agent.get_center_health(center_id)

@app.post("/clinical/tele-session/{patient_id}")
async def start_tele_session(patient_id: str):
    return clinician_agent.prepare_tele_session(patient_id)

@app.get("/system/health")
async def get_system_health():
    return sre_agent.get_system_health()

@app.post("/demo/run")
async def run_full_demo():
    return demo_agent.run_full_cycle_demo()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
