import unittest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.main import app

client = TestClient(app)

def test_metrics_endpoint():
    response = client.get("/api/v1/observability/metrics")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert "uptime_seconds" in data["system"]
    assert data["recovery_engine"]["policy_guard_status"] == "ACTIVE"
    assert data["recovery_engine"]["batch_recovery_uplift_pct"] == 31.4
