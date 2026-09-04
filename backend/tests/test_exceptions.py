import unittest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.main import app
from app.core.exceptions import (
    PolicyViolationException, 
    BankNetworkDowntimeException,
    InvalidWebhookSignatureException,
    RateLimitExceededException,
    ResourceNotFoundException
)

def test_policy_violation_exception():
    exc = PolicyViolationException("Amount ₹75000 exceeds maximum cap of ₹50000.")
    assert exc.status_code == 403
    assert exc.error_code == "POLICY_VIOLATION"
    assert "AMOUNT_CAP_EXCEEDED" in exc.details["violation_type"]

def test_bank_downtime_exception():
    exc = BankNetworkDowntimeException("HDFC", "netbanking")
    assert exc.status_code == 503
    assert exc.error_code == "BANK_DOWNTIME"
    assert exc.details["bank"] == "HDFC"
    assert exc.details["alternative"] == "UPI_INTENT"

def test_invalid_signature_exception():
    exc = InvalidWebhookSignatureException()
    assert exc.status_code == 401
    assert exc.error_code == "INVALID_WEBHOOK_SIGNATURE"

def test_rate_limit_exception():
    exc = RateLimitExceededException("CUST-999", limit=3)
    assert exc.status_code == 429
    assert exc.error_code == "RATE_LIMIT_EXCEEDED"
    assert exc.details["max_limit_24h"] == 3

def test_resource_not_found_exception():
    exc = ResourceNotFoundException("Transaction", "TXN-404")
    assert exc.status_code == 404
    assert exc.error_code == "RESOURCE_NOT_FOUND"
