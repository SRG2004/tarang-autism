import pytest
from app.agents.screening import ScreeningAgent

@pytest.fixture
def screening_agent():
    """Provides a ScreeningAgent instance for tests."""
    return ScreeningAgent()

def test_analyze_signals_calculates_risk_correctly(screening_agent):
    """
    Tests the core logic of the analyze_signals method with typical data.
    """
    video_metrics = {"eye_contact": 0.5, "motor_coordination": 0.7}
    questionnaire_score = 10  # Mid-range score

    expected_results = {
        "risk_score": 51.0,
        "confidence": "High",
        "breakdown": {
            "behavioral": 62.0,
            "questionnaire": 50.0,
            "physiological": 0.0
        }
    }

    results = screening_agent.analyze_signals(video_metrics, questionnaire_score)

    assert results["risk_score"] == expected_results["risk_score"]
    assert results["confidence"] == expected_results["confidence"]
    assert results["breakdown"] == expected_results["breakdown"]

def test_analyze_signals_handles_missing_video_metrics(screening_agent):
    """
    Tests that the method uses default values when video metrics are missing.
    """
    video_metrics = {}
    questionnaire_score = 20 # Low risk

    # video_score = (1.0 * 0.4) + (1.0 * 0.6) = 1.0
    # q_norm = 1.0 - (20 / 20.0) = 0.0
    # final_risk = (1.0 * 0.5) + (0.0 * 0.4) = 0.5
    # risk_score = 50.0

    results = screening_agent.analyze_signals(video_metrics, questionnaire_score)
    assert results["risk_score"] == 50.0
