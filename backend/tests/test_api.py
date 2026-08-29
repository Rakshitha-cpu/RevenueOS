from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app

client = TestClient(app)

def test_health_check():
    """Test that the application health check endpoint responds correctly."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_root_endpoint():
    """Test that the root endpoint returns the welcome message."""
    response = client.get("/")
    assert response.status_code == 200
    assert "RevenueOS" in response.json().get("message", "")

def test_razorpay_webhook_invalid_json():
    """Test that the webhook endpoint rejects invalid JSON payloads."""
    response = client.post(
        "/api/v1/webhooks/razorpay", 
        data="invalid json",
        headers={"Content-Type": "application/json"}
    )
    # The signature check might run first if secret is set, or json parse if not.
    # In either case, it shouldn't return 200 OK for garbage data.
    assert response.status_code == 400
