"""
ML-Powered Screening Agent for TARANG
======================================
Uses a trained machine learning model on real UCI ASD screening data.
"""

import os
import math
import numpy as np

# Try to load the trained model
MODEL_AVAILABLE = False
ML_MODEL = None
FEATURE_COLS = []
MODEL_DATA = {}

try:
    import joblib
    # Get the directory where this file is located (app/agents/)
    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
    # Go up one level to app/, then into models/
    MODEL_PATH = os.path.join(CURRENT_DIR, '..', 'models', 'asd_screening_model.joblib')
    
    if os.path.exists(MODEL_PATH):
        MODEL_DATA = joblib.load(MODEL_PATH)
        ML_MODEL = MODEL_DATA['model']
        FEATURE_COLS = MODEL_DATA['feature_columns']
        MODEL_AVAILABLE = True
        print(f"✓ Loaded ML model: {MODEL_DATA['model_type']} (accuracy: {MODEL_DATA['accuracy']:.3f})")
    else:
        print(f"Model file not found at: {MODEL_PATH}")
except Exception as e:
    print(f"ML model not available: {e}")


class ScreeningAgent:
    """
    Hybrid Screening Agent combining:
    1. Trained ML model (on real UCI ASD screening data)
    2. Computer vision behavioral metrics
    3. Rule-based clinical logic
    """
    
    def __init__(self):
        self.name = "Tarang ML Screening Agent"
        self.role = "Flags early risk signals using trained ML model on real clinical data"
        self.model_available = MODEL_AVAILABLE
    
    def _prepare_ml_features(self, video_metrics: dict, questionnaire_responses: dict) -> dict:
        """
        Convert input data to ML model features.
        Maps questionnaire responses to AQ-10 format.
        """
        # AQ-10 feature mapping from questionnaire
        features = {
            'A1_Score': questionnaire_responses.get('social_situations', 0),
            'A2_Score': questionnaire_responses.get('feelings_reading', 0),
            'A3_Score': questionnaire_responses.get('conversation', 0),
            'A4_Score': questionnaire_responses.get('thinking_understanding', 0),
            'A5_Score': questionnaire_responses.get('talk_listen', 0),
            'A6_Score': questionnaire_responses.get('pattern_recognition', 0),
            'A7_Score': questionnaire_responses.get('imagination', 0),
            'A8_Score': questionnaire_responses.get('intentions', 0),
            'A9_Score': questionnaire_responses.get('social_chitchat', 0),
            'A10_Score': questionnaire_responses.get('new_people', 0),
            'age': questionnaire_responses.get('age', 5),
            'gender_encoded': 1 if questionnaire_responses.get('gender', 'm') == 'm' else 0,
            'jaundice_encoded': 1 if questionnaire_responses.get('jaundice', 'no') == 'yes' else 0,
            'family_history_encoded': 1 if questionnaire_responses.get('family_autism', 'no') == 'yes' else 0,
        }
        
        # Calculate total score
        score_cols = [f'A{i}_Score' for i in range(1, 11)]
        features['total_score'] = sum(features.get(col, 0) for col in score_cols)
        
        return features
    
    def _predict_with_ml(self, features: dict) -> tuple:
        """Run ML model prediction"""
        if not self.model_available:
            return None, None
        
        try:
            # Prepare feature vector in correct order
            feature_vector = []
            for col in FEATURE_COLS:
                feature_vector.append(features.get(col, 0))
            
            X = np.array([feature_vector])
            
            # Get prediction and probability
            prediction = ML_MODEL.predict(X)[0]
            proba = ML_MODEL.predict_proba(X)[0]
            
            risk_probability = proba[1] if len(proba) > 1 else proba[0]
            
            return prediction, risk_probability
            
        except Exception as e:
            print(f"ML prediction error: {e}")
            return None, None
    
    def analyze_signals(self, video_metrics: dict, questionnaire_score: int, 
                       questionnaire_responses: dict = None, eeg_mock: dict = None):
        """
        Calculates risk score using:
        1. Trained ML model (primary)
        2. Computer vision metrics (secondary)
        3. Rule-based fusion (fallback)
        """
        
        # Initialize questionnaire responses if not provided
        if questionnaire_responses is None:
            # Convert simple score to estimated responses
            questionnaire_responses = self._score_to_responses(questionnaire_score)
        
        # 1. ML Model Prediction (if available)
        ml_features = self._prepare_ml_features(video_metrics, questionnaire_responses)
        ml_prediction, ml_probability = self._predict_with_ml(ml_features)
        
        # 2. Computer Vision Score
        v_eye = video_metrics.get("eye_contact", 0.0)
        v_motor = video_metrics.get("motor_coordination", 0.0)
        video_score = (v_eye * 0.45) + (v_motor * 0.55)
        
        # 3. Questionnaire Normalization
        q_raw = max(0, min(20, questionnaire_score))
        q_norm = q_raw / 20.0
        
        # 4. Physiological Score (simulated)
        eeg_score = 0.0
        if eeg_mock:
            eeg_score = eeg_mock.get("alpha_theta_ratio", 0.0)
        
        # 5. HYBRID FUSION
        if ml_probability is not None:
            # ML model available - use hybrid approach
            # Weight: 50% ML, 30% Vision, 15% Questionnaire, 5% Physiological
            hybrid_weights = {
                "ml_model": 0.50,
                "video": 0.30,
                "questionnaire": 0.15,
                "physiological": 0.05
            }
            
            final_risk = (
                ml_probability * hybrid_weights["ml_model"] +
                video_score * hybrid_weights["video"] +
                q_norm * hybrid_weights["questionnaire"] +
                eeg_score * hybrid_weights["physiological"]
            )
            
            fusion_method = "ML_Hybrid_Fusion"
            
        else:
            # Fallback to rule-based (original algorithm)
            base_weights = {"video": 0.50, "questionnaire": 0.40, "physiological": 0.10}
            
            if video_score > 0.80:
                base_weights["video"] += 0.1
                base_weights["questionnaire"] -= 0.1
            
            final_risk = (
                video_score * base_weights["video"] +
                q_norm * base_weights["questionnaire"] +
                eeg_score * base_weights["physiological"]
            )
            
            fusion_method = "Rule_Based_Fusion"
        
        # 6. Confidence Analysis
        dissonance = abs(video_score - q_norm)
        
        if ml_probability is not None:
            ml_vision_diff = abs(ml_probability - video_score)
            if ml_vision_diff < 0.15 and dissonance < 0.25:
                confidence = "High (ML + Vision Aligned)"
            elif ml_vision_diff < 0.3 and dissonance < 0.4:
                confidence = "Medium (Partial Alignment)"
            else:
                confidence = "Low (Signal Dissonance)"
                final_risk = (final_risk + 0.5) / 2  # Safety dampening
        else:
            if dissonance < 0.25:
                confidence = "High (Signals Aligned)"
            elif dissonance < 0.5:
                confidence = "Medium (Partial Dissonance)"
            else:
                confidence = "Low (High Dissonance)"
                final_risk = (final_risk + 0.5) / 2
        
        # 7. Interpretation
        if final_risk > 0.7:
            interpretation = "High Risk"
        elif final_risk > 0.4:
            interpretation = "Moderate Risk"
        else:
            interpretation = "Low Risk"
        
        return {
            "risk_score": round(final_risk * 100, 2),
            "confidence": confidence,
            "dissonance_factor": round(dissonance, 3),
            "breakdown": {
                "ml_model": round((ml_probability or 0) * 100, 2),
                "behavioral": round(video_score * 100, 2),
                "questionnaire": round(q_norm * 100, 2),
                "physiological": round(eeg_score * 100, 2)
            },
            "interpretation": interpretation,
            "fusion_method": fusion_method,
            "model_info": {
                "ml_available": self.model_available,
                "model_type": MODEL_DATA.get('model_type', 'N/A') if self.model_available else 'N/A',
                "model_accuracy": MODEL_DATA.get('accuracy', 0) if self.model_available else 0,
                "dataset_source": "UCI ML Repository - ASD Screening Data"
            }
        }
    
    def _score_to_responses(self, total_score: int) -> dict:
        """Convert a total questionnaire score to estimated individual responses"""
        # Distribute score across 10 questions
        responses = {}
        remaining = min(total_score, 10)
        
        for i in range(1, 11):
            if remaining > 0:
                responses[f'A{i}_Score'] = 1
                remaining -= 1
            else:
                responses[f'A{i}_Score'] = 0
        
        # Map to named keys used by prepare_ml_features
        response_map = {
            'social_situations': responses.get('A1_Score', 0),
            'feelings_reading': responses.get('A2_Score', 0),
            'conversation': responses.get('A3_Score', 0),
            'thinking_understanding': responses.get('A4_Score', 0),
            'talk_listen': responses.get('A5_Score', 0),
            'pattern_recognition': responses.get('A6_Score', 0),
            'imagination': responses.get('A7_Score', 0),
            'intentions': responses.get('A8_Score', 0),
            'social_chitchat': responses.get('A9_Score', 0),
            'new_people': responses.get('A10_Score', 0),
            'age': 5,
            'gender': 'm',
            'jaundice': 'no',
            'family_autism': 'no'
        }
        
        return response_map
