import numpy as np
from typing import List, Dict

class OutcomeAgent:
    """
    Predictive Intelligence Agent for TARANG.
    Analyzes longitudinal behavioral data using robust statistical modeling.
    """
    
    def predict_trajectory(self, historical_scores: List[float]) -> Dict:
        """
        Predicts future progress using Robust Linear Trend Analysis on Smoothed Data.
        """
        if len(historical_scores) < 3:
            return {
                "trend": "Stabilizing" if len(historical_scores) == 2 else "Initializing",
                "velocity": 0.0,
                "predicted_scores": [],
                "confidence_interval": 0.50
            }
            
        # 1. De-noising (Simple Moving Average)
        window_size = 3
        if len(historical_scores) >= window_size:
            smoothed_scores = np.convolve(historical_scores, np.ones(window_size)/window_size, mode='valid')
        else:
            smoothed_scores = np.array(historical_scores)

        # 2. Robust Linear Fit
        x = np.array(range(len(smoothed_scores)))
        y = smoothed_scores
        
        slope, intercept = np.polyfit(x, y, 1)
        
        # 3. Future Projection (4 weeks) with Dampening
        future_x = np.array(range(len(historical_scores), len(historical_scores) + 4))
        dampening = 0.9
        predictions = (slope * dampening) * (future_x - len(historical_scores) + 1) + historical_scores[-1]
        
        # 4. Trend Interpretation (Relative Change Analysis)
        mean_score = np.mean(historical_scores) + 1e-6
        relative_slope = slope / mean_score
        
        if relative_slope > 0.02: # 2% growth per week
            trend = "Improving (Accelerated)"
        elif relative_slope > 0.01: # 1% growth
            trend = "Improving (Steady)"
        elif relative_slope < -0.02: # 2% regression
            trend = "Regressing (Urgent)"
        elif relative_slope < -0.01: # 1% regression
            trend = "Regressing (Mild)"
        else:
            trend = "Plateaued"
            
        # 5. Volatility Calculation
        volatility = np.std(historical_scores) / (np.mean(historical_scores) + 1e-6)
        confidence = max(0.4, min(0.95, 1.0 - volatility))
        
        return {
            "trend": trend,
            "velocity": float(round(slope, 4)),
            "predicted_scores": [float(round(p, 2)) for p in predictions.tolist()],
            "confidence_interval": round(confidence, 2)
        }

    def generate_intervention_alert(self, prediction: Dict) -> str:
        """
        Generates clinically contextualized alerts.
        """
        trend = prediction["trend"]
        if "Regressing" in trend:
            return f"ALERT: Predicted trajectory indicates {trend}. Immediate clinical pivot or session frequency increase recommended."
        elif "Plateaued" in trend:
            return "NOTICE: Progress has plateaued. Consider adjusting the sensory complexity of current drills."
        elif "Improving" in trend:
            return f"PROGRESS: Stable trajectory detected ({trend}). Continue current intervention plan."
        return "Baseline established. Continue monitoring for 2 additional weeks."
