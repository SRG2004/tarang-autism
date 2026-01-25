import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from unittest.mock import patch

@pytest.mark.anyio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "operational"

@pytest.mark.anyio
@patch('app.main.process_heavy_ai_fusion.delay')
async def test_process_screening_industrial(mock_delay):
    payload = {
        "video_metrics": {"gaze_stability": 0.8, "social_engagement": 0.6},
        "questionnaire_score": 15
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/screening/process-industrial", json=payload)

    assert response.status_code == 200
    response_data = response.json()
    assert "session_id" in response_data
    assert "immediate_risk" in response_data
    assert response_data["async_status"] == "Processing Heavy AI..."
    assert "report_url" in response_data
    mock_delay.assert_called_once()
