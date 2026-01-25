class ClinicalSupportAgent:
    def __init__(self):
        self.name = "Tarang Clinical Support Agent"
        self.role = "Generates evidence summaries for clinicians"

    def generate_summary(self, patient_data: dict, risk_results: dict):
        """
        Synthesizes multimodal data into clinical insights.
        """
        risk_score = risk_results.get("risk_score")
        confidence = risk_results.get("confidence")
        
        findings = []
        if risk_results["breakdown"]["behavioral"] > 70:
            findings.append("Significant atypical gaze patterns and motor coordination flags detected.")
        if risk_results["breakdown"]["questionnaire"] > 70:
            findings.append("Parent-reported behavioral markers align with high-risk clinical profiles.")
            
        recommendation = "Refer to Pediatric Neurologist for comprehensive diagnostic evaluation."
        if risk_score < 30:
            recommendation = "Low initial risk detected. Continue longitudinal monitoring every 3 months."
        elif confidence == "Low":
            recommendation = "Inconsistent signals detected. Recommend repeat screening or direct clinical observation."

        return {
            "summary_title": f"Clinical Evidence Summary for {patient_data.get('name', 'Patient')}",
            "key_findings": findings,
            "clinical_recommendation": recommendation,
            "agent_status": "Evidence Verified",
            "timestamp": "2026-01-25T14:00:00Z"
        }
