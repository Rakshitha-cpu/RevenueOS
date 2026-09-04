import unittest
from unittest.mock import patch, MagicMock
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.services.execution_engine import RazorpayExecutionAdapter

def test_execution_adapter_simulated_fallback():
    """Test fallback when Razorpay keys are not provided."""
    with patch.dict(os.environ, {"RAZORPAY_KEY_ID": "", "RAZORPAY_KEY_SECRET": ""}):
        adapter = RazorpayExecutionAdapter()
        result = adapter.execute_payment_link(
            amount=1500.0,
            customer_name="Test Customer",
            customer_email="customer@example.com",
            customer_phone="+919876543210",
            reference_id="TEST-REF-100"
        )
        assert result["status"] == "success"
        assert result["mocked"] is True
        assert "TEST-REF-100" in result["payment_link_id"]
        assert "https://rzp.io" in result["payment_url"]

def test_execution_adapter_live_client():
    """Test Razorpay execution with mocked client."""
    with patch('razorpay.Client') as mock_razorpay_client:
        mock_instance = MagicMock()
        mock_instance.payment_link.create.return_value = {
            "id": "plink_live_12345",
            "short_url": "https://rzp.io/l/live12345"
        }
        mock_razorpay_client.return_value = mock_instance

        with patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_key", "RAZORPAY_KEY_SECRET": "secret_key"}):
            adapter = RazorpayExecutionAdapter()
            adapter.client = mock_instance
            result = adapter.execute_payment_link(
                amount=2000.0,
                customer_name="Live Customer",
                customer_email="live@example.com",
                customer_phone="+919876543210"
            )
            assert result["status"] == "success"
            assert result["mocked"] is False
            assert result["payment_link_id"] == "plink_live_12345"
            assert result["payment_url"] == "https://rzp.io/l/live12345"
