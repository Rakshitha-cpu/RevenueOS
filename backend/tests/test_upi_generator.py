import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.services.upi_generator import UPIDeepLinkGenerator

@pytest.fixture
def upi_gen():
    return UPIDeepLinkGenerator(default_vpa="merchant@razorpay", merchant_name="RevenueOS Store")

def test_generate_upi_intent_uri(upi_gen):
    result = upi_gen.generate_intent(
        amount=1499.0,
        transaction_ref="TXN-UPI-999"
    )
    assert result["status"] == "success"
    assert result["amount"] == 1499.0
    assert "upi://pay?" in result["upi_intent_uri"]
    assert "pa=merchant%40razorpay" in result["upi_intent_uri"] or "pa=merchant@razorpay" in result["upi_intent_uri"]
    assert "am=1499.00" in result["upi_intent_uri"]
    assert "gpay" in result["app_deep_links"]
    assert "phonepe" in result["app_deep_links"]
    assert "paytm" in result["app_deep_links"]
