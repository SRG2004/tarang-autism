class ScreeningAgent:
    def __init__(self):
        self.name = "Tarang Screening Agent"
        self.role = "Flags early risk signals based on multimodal inputs"

    def analyze_signals(self, video_metrics: dict, questionnaire_score: int, eeg_mock: dict = None):
        """
        Calculates weighted risk score from multiple inputs.
        """
        # Normalized scores (0-1)
        video_score = video_metrics.get("eye_contact", 1.0) * 0.4 + \
                      video_metrics.get("motor_coordination", 1.0) * 0.6
        
        # Questionnaire score (assuming 0 is high risk, 20 is low risk for M-CHAT)
        q_norm = 1.0 - (questionnaire_score / 20.0)
        
        eeg_score = 0
        if eeg_mock:
            eeg_score = eeg_mock.get("alpha_theta_ratio", 1.0)
            
        final_risk = (video_score * 0.5) + (q_norm * 0.4) + (eeg_score * 0.1)
        
        confidence = "High" if abs(video_score - q_norm) < 0.3 else "Medium"
        if abs(video_score - q_norm) > 0.6:
            confidence = "Low"
            
        return {
            "risk_score": round(final_risk * 100, 2),
            "confidence": confidence,
            "breakdown": {
                "behavioral": round(video_score * 100, 2),
                "questionnaire": round(q_norm * 100, 2),
                "physiological": round(eeg_score * 100, 2)
            }
        }
