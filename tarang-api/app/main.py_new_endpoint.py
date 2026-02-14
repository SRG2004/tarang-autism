
@app.get("/reports")
async def get_reports(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Returns list of screening reports for the current user.
    """
    # Filter by user's email (stored in patient_name currently)
    sessions = db.query(ScreeningSession).filter(
        ScreeningSession.patient_name == current_user.sub
    ).order_by(ScreeningSession.created_at.desc()).all()
    
    result = []
    for s in sessions:
        # Robust parsing of breakdown (handle str or dict or None)
        breakdown = s.breakdown or {}
        if isinstance(breakdown, str):
            try:
                import json as _json
                breakdown = _json.loads(breakdown)
            except Exception:
                breakdown = {}
        
        # Determine modality type from weights
        modality = "Hybrid Fusion"
        b_score = 0
        q_score = 0
        if isinstance(breakdown, dict):
            b_score = breakdown.get("behavioral", 0)
            q_score = breakdown.get("questionnaire", 0)
            
        if b_score > q_score and b_score > 0:
            modality = "Vision Stream"
        elif q_score > b_score and q_score > 0:
            modality = "Dev. Log"

        result.append({
            "id": s.id,
            "sid": f"RPT-{s.id:04d}",
            "date": s.created_at.strftime("%b %d, %Y"),
            "type": modality,
            "risk": f"{int(s.risk_score)}%" if s.risk_score is not None else "N/A",
            "status": "Available" if s.clinical_recommendation else "Processing"
        })
    return result
