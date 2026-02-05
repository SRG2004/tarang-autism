import math

class ScreeningAgent:
    def __init__(self):
        self.name = "Tarang Screening Agent"
        self.role = "Flags early risk signals based on multimodal inputs"

    def analyze_signals(self, video_metrics: dict, questionnaire_score: int, eeg_mock: dict = None):
        """
        Calculates weighted risk score using an optimized non-linear fusion algorithm.
        Standardized: High score = High Risk (1.0).
        """
        # 1. Component Scoring (Normalized 0-1, where 1.0 is higher risk)
        v_eye = video_metrics.get("eye_contact", 0.0)
        v_motor = video_metrics.get("motor_coordination", 0.0)
        
        # Weighted behavioral sub-score
        video_score = (v_eye * 0.45) + (v_motor * 0.55)
        
        # 2. Questionnaire Normalization (Standardized: High Score = High Risk)
        q_raw = max(0, min(20, questionnaire_score))
        q_norm = q_raw / 20.0 # 20 is high risk, 0 is low risk
        
        # Apply sensitivity boost for moderate-risk zone (early detection window)
        if 0.4 < q_norm < 0.8:
            q_norm = min(1.0, q_norm * 1.1)

        # 3. Physiological Fusion (Simulated EEG)
        eeg_score = 0.0
        if eeg_mock:
            eeg_score = eeg_mock.get("alpha_theta_ratio", 0.0)
            
        # 4. Optimized Multi-Agent Fusion
        # Use dynamic weighting based on metric extremity
        base_weights = {"video": 0.50, "questionnaire": 0.40, "physiological": 0.10}
        
        if video_score > 0.80: 
            base_weights["video"] += 0.1
            base_weights["questionnaire"] -= 0.1
        
        final_risk = (video_score * base_weights["video"]) + \
                     (q_norm * base_weights["questionnaire"]) + \
                     (eeg_score * base_weights["physiological"])
        
        # 5. Dissonance & Confidence Analysis
        dissonance = abs(video_score - q_norm)
        
        if dissonance < 0.25:
            confidence = "High (Signals Aligned)"
        elif dissonance < 0.5:
            confidence = "Medium (Partial Dissonance)"
        else:
            confidence = "Low (High Dissonance)"
            # Safety damping: revert towards population mean if signals are extremely contradictory
            final_risk = (final_risk + 0.5) / 2
            
        return {
            "risk_score": round(final_risk * 100, 2),
            "confidence": confidence,
            "dissonance_factor": round(dissonance, 3),
            "breakdown": {
                "behavioral": round(video_score * 100, 2),
                "questionnaire": round(q_norm * 100, 2),
                "physiological": round(eeg_score * 100, 2)
            },
            "interpretation": "High Risk" if final_risk > 0.7 else "Moderate Risk" if final_risk > 0.4 else "Low Risk"
        }
