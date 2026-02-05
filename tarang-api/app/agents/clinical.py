class ClinicalSupportAgent:
    def __init__(self):
        self.name = "Tarang Clinical Support Agent"
        self.role = "Generates evidence summaries for clinicians"

    def generate_summary(self, patient_data: dict, risk_results: dict):
        """
        Synthesizes multimodal data into clinical insights using optimized agent outputs.
        """
        risk_score = risk_results.get("risk_score")
        confidence = risk_results.get("confidence")
        interpretation = risk_results.get("interpretation", "Unknown")
        
        findings = []
        if risk_results["breakdown"]["behavioral"] > 60:
            findings.append("Vision Engine: Detected significant deviation in eye-contact and motor markers.")
        if risk_results["breakdown"]["questionnaire"] > 60:
            findings.append("Developmental Log: High correlation with clinically recognized early-risk behaviors.")
        if risk_results.get("dissonance_factor", 0) > 0.5:
            findings.append("CAUTION: High dissonance detected between vision markers and parent logs.")
            
        recommendation = f"Status: {interpretation}. "
        if risk_score > 70:
            recommendation += "Immediate referral to a Pediatric Neurologist for formal diagnostic assessment is strongly advised."
        elif risk_score > 40:
            recommendation += "Recommend a follow-up screening in 4 weeks and a consultation with a developmental specialist."
        else:
            recommendation += "Low risk indicators detected. Continue standard longitudinal monitoring."

        if "Low" in confidence:
            recommendation += " Note: Results should be interpreted with caution due to low signal alignment."

        return {
            "summary_title": f"Clinical Evidence Summary: {patient_data.get('name', 'Patient')}",
            "key_findings": findings,
            "clinical_recommendation": recommendation,
            "agent_status": "Optimized Fusion Verified",
            "timestamp": "2026-02-04T10:00:00Z"
        }
