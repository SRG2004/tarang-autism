import numpy as np
from typing import List, Dict

class OutcomeAgent:
    """
    Predictive Intelligence Agent for TARANG.
    Analyzes longitudinal behavioral data to predict developmental trajectories.
    """
    
    def predict_trajectory(self, historical_scores: List[float]) -> Dict:
        """
        Uses linear regression simulation to predict the next 4 weeks of progress.
        """
        if len(historical_scores) < 2:
            return {"trend": "Insufficient Data", "prediction": []}
            
        x = np.array(range(len(historical_scores)))
        y = np.array(historical_scores)
        
        # Simple linear fit for industrial demonstration
        slope, intercept = np.polyfit(x, y, 1)
        
        future_x = np.array(range(len(historical_scores), len(historical_scores) + 4))
        predictions = slope * future_x + intercept
        
        trend = "Improving" if slope > 0 else "Stagnating" if abs(slope) < 0.1 else "Regressing"
        
        return {
            "trend": trend,
            "velocity": float(slope),
            "predicted_scores": predictions.tolist(),
            "confidence_interval": 0.85 # Industrial confidence heuristic
        }

    def generate_intervention_alert(self, prediction: Dict) -> str:
        if prediction["trend"] == "Regressing":
            return "ALert: Predicted regression detected. Immediate clinical review of therapy intensity recommended."
        elif prediction["trend"] == "Stagnating":
            return "Note: Progress has plateaued. Consider adjusting 'Skill Lab' difficulty levels."
        return "Insight: Positive developmental trajectory maintained. Continue current intervention plan."
