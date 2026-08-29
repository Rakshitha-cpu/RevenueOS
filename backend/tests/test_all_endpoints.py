import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.main import app

client = TestClient(app)

def test_risk_evaluation_endpoint():
    """Test POST /api/v1/risk/evaluate"""
    payload = {
        "transaction": {"amount": 2500.0, "failure_code": "INSUFFICIENT_FUNDS"},
        "customer": {"name": "Priya Sharma", "segment": "VIP"}
    }
    response = client.post("/api/v1/risk/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "risk_score" in data
    assert "risk_type" in data

def test_ai_recommend_endpoint():
    """Test POST /api/v1/ai/recommend"""
    payload = {
        "risk_id": "RR-101",
        "transaction": {"amount": 3500.0, "failure_code": "CARD_DECLINED"},
        "customer": {"name": "Rohan Gupta", "segment": "Standard"}
    }
    response = client.post("/api/v1/ai/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "recommended_strategy" in data
    assert "strategies" in data

def test_policy_authorization_endpoint():
    """Test POST /api/v1/authorization/check"""
    # Allowed action
    payload_allowed = {
        "action": "SEND_PAYMENT_LINK",
        "amount": 15000.0,
        "retry_count": 1
    }
    res_allowed = client.post("/api/v1/authorization/check", json=payload_allowed)
    assert res_allowed.status_code == 200
    assert res_allowed.json()["decision"] == "ALLOWED"

    # Blocked action (Refund)
    payload_refund = {
        "action": "REFUND",
        "amount": 500.0,
        "retry_count": 0
    }
    res_refund = client.post("/api/v1/authorization/check", json=payload_refund)
    assert res_refund.status_code == 200
    assert res_refund.json()["decision"] == "BLOCKED"

def test_simulator_endpoint():
    """Test POST /api/v1/simulator/compare"""
    payload = {
        "risk_id": "SIM-01",
        "strategies": [
            {"strategy": "WhatsApp Link", "expected_recovery": 5000.0, "friction": "Low", "risk": "Low"},
            {"strategy": "Auto Retry", "expected_recovery": 5000.0, "friction": "High", "risk": "High"}
        ]
    }
    response = client.post("/api/v1/simulator/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["recommended_strategy"] == "WhatsApp Link"

def test_voice_intent_endpoint():
    """Test POST /api/v1/voice/intent"""
    payload = {
        "customer_id": "CUST-10",
        "transcript": "Kal subah payment kar dunga"
    }
    response = client.post("/api/v1/voice/intent", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "PROMISE_TO_PAY"

def test_audit_logs_endpoint():
    """Test GET /api/v1/audit/logs"""
    response = client.get("/api/v1/audit/logs")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
