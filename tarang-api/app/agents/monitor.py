class ProgressMonitoringAgent:
    def __init__(self):
        self.name = "Tarang Progress Monitoring Agent"
        self.role = "Detects stagnation or regression in pediatric outcomes"

    def analyze_trend(self, history: list):
        """
        Analyzes a list of screening scores for longitudinal trends.
        """
        if len(history) < 2:
            return {"status": "Baseline", "message": "More data needed for trend analysis."}
            
        latest = history[-1]["score"]
        previous = history[-2]["score"]
        
        diff = latest - previous
        
        status = "Stable"
        if diff > 5:
            status = "Improvement Detected"
        elif diff < -5:
            status = "Regression Alert"
            
        return {
            "longitudinal_status": status,
            "variance": round(diff, 2),
            "alert_clinician": True if status == "Regression Alert" else False
        }
