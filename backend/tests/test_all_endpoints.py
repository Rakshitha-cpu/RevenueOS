import unittest
import sys
import os
from unittest.mock import patch
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.main import app
from app.core.auth import create_access_token

class TestAllEndpointsSuite(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.token = create_access_token({
            "sub": "admin@revenueos.com",
            "role": "admin",
            "merchant_id": "merchant_default"
        })
        self.auth_headers = {"Authorization": f"Bearer {self.token}"}

    def test_health_check_endpoint(self):
        """Test GET /api/v1/health"""
        response = self.client.get("/api/v1/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ok")

    def test_auth_token_issuance_endpoint(self):
        """Test POST /api/v1/auth/token generates valid JWT."""
        payload = {"email": "admin@revenueos.com", "password": "AdminPass123!"}
        response = self.client.post("/api/v1/auth/token", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["token_type"], "bearer")

    def test_voice_turn_endpoint(self):
        """Test POST /api/v1/voice/turn"""
        payload = {
            "message": "Yes, speaking.",
            "language": "en-IN",
            "customer_name": "Rajesh Kumar",
            "order_id": "RZP-8921",
            "sku": "Apple AirPods Pro",
            "amount": 4650.0,
            "demo_mode": True,
            "failure_code": "E_504_GATEWAY_TIMEOUT"
        }
        response = self.client.post("/api/v1/voice/turn", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("reply_text", data)
        self.assertIn("intent", data)
        self.assertIn("policy_evaluation", data)

    def test_audit_verify_endpoint(self):
        """Test GET /api/v1/audit/verify"""
        response = self.client.get("/api/v1/audit/verify")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("verified", data)
        self.assertIn("chain_status", data)
        self.assertEqual(data["chain_status"], "INTACT")

    def test_telephony_dispatch_endpoint(self):
        """Test POST /api/v1/telephony/dispatch-call"""
        payload = {
            "phone_number": "+919845012345",
            "customer_name": "Rajesh Kumar",
            "order_id": "RZP-8921",
            "cart_amount": 4650.0,
            "failure_reason": "E_504_GATEWAY_TIMEOUT",
            "language_code": "en-IN",
            "demo_mode": True
        }
        response = self.client.post("/api/v1/telephony/dispatch-call", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("status", data)
        self.assertEqual(data["status"], "INITIATED")

    def test_merchants_config_endpoint_with_auth_guards(self):
        """Test GET (public) & PUT (protected by JWT Auth Guard) /api/v1/merchants/{merchant_id}"""
        # GET default (Public info)
        get_res = self.client.get("/api/v1/merchants/merchant_default")
        self.assertEqual(get_res.status_code, 200)
        
        # PUT unauthorized (No token -> 401 Unauthorized)
        unauth_res = self.client.put("/api/v1/merchants/m_enterprise_01", json={
            "name": "Tata CliQ Luxury",
            "max_discount_percent": 7.5
        })
        self.assertEqual(unauth_res.status_code, 401)

        # PUT authorized with Bearer JWT Token -> 200 OK
        put_res = self.client.put(
            "/api/v1/merchants/m_enterprise_01",
            json={
                "name": "Tata CliQ Luxury",
                "max_discount_percent": 7.5,
                "loyalty_code": "LUXURY75",
                "high_value_threshold": 80000.0
            },
            headers=self.auth_headers
        )
        self.assertEqual(put_res.status_code, 200)
        self.assertEqual(put_res.json()["merchant_config"]["name"], "Tata CliQ Luxury")

if __name__ == '__main__':
    unittest.main()
