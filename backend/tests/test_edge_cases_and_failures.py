import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.main import app
from app.services.policy_engine import policy_guard
from app.services.risk_engine import risk_intelligence_agent
from app.services.simulator import simulator_engine
from app.services.execution_engine import razorpay_adapter
from app.services.voice_agent import voice_agent
from app.services.audit import audit_logger
from app.core.security import security_manager
from app.core.exceptions import PolicyViolationException, RateLimitExceededException

client = TestClient(app)

# ==========================================
# 1. POLICY ENGINE BOUNDARY & FAILURE TESTS
# ==========================================

def test_policy_zero_and_negative_amounts():
    """Ensure zero or negative amounts are rejected or handled gracefully."""
    res_zero = policy_guard.evaluate_action(
        proposed_action="SEND_PAYMENT_LINK",
        transaction={"amount": 0.0},
        customer={"name": "Test"}
    )
    assert res_zero["authorized"] is False or res_zero["reason"] is not None

    res_neg = policy_guard.evaluate_action(
        proposed_action="SEND_PAYMENT_LINK",
        transaction={"amount": -1500.0},
        customer={"name": "Test"}
    )
    assert res_neg["authorized"] is False

def test_policy_exact_boundary_cap():
    """Test policy boundary at exactly ₹50,000 vs ₹50,001."""
    # Exactly 50,000 -> Allowed
    res_exact = policy_guard.evaluate_action(
        proposed_action="SEND_PAYMENT_LINK",
        transaction={"amount": 50000.0},
        customer={"name": "Test"}
    )
    assert res_exact["authorized"] is True

    # ₹50,001 -> Exceeds cap -> Escalated
    res_over = policy_guard.evaluate_action(
        proposed_action="SEND_PAYMENT_LINK",
        transaction={"amount": 50001.0},
        customer={"name": "Test"}
    )
    assert res_over["authorized"] is False
    assert "exceeds" in res_over["reason"].lower()

def test_policy_rate_limiting_boundary():
    """Test contact frequency limit (max 3 retries)."""
    # 3 retries -> Allowed
    res_3 = policy_guard.evaluate_action(
        proposed_action="SEND_PAYMENT_LINK",
        transaction={"amount": 5000.0, "retry_count": 3},
        customer={"name": "Test"}
    )
    assert res_3["authorized"] is True

    # 4 retries -> Blocked
    res_4 = policy_guard.evaluate_action(
        proposed_action="SEND_PAYMENT_LINK",
        transaction={"amount": 5000.0, "retry_count": 4},
        customer={"name": "Test"}
    )
    assert res_4["authorized"] is False

# ==========================================
# 2. RISK ENGINE EDGE CASES & MALFORMED INPUTS
# ==========================================

def test_risk_missing_error_code():
    """Handle transactions with missing or unknown failure codes."""
    profile = risk_intelligence_agent.evaluate_risk(
        transaction={"amount": 1000.0},
        customer={}
    )
    assert "risk_score" in profile
    assert profile["risk_score"] is not None

def test_risk_empty_customer_profile():
    """Handle transactions with completely empty customer objects."""
    profile = risk_intelligence_agent.evaluate_risk(
        transaction={"amount": 25000.0, "error_code": "NETWORK_ERROR"},
        customer=None
    )
    assert profile["risk_type"] is not None

# ==========================================
# 3. SIMULATOR PENALTY & BOUNDARY TESTS
# ==========================================

def test_simulator_extreme_penalties():
    """Test simulator when all options have high risk and high friction."""
    strategies = [
        {"strategy": "Aggressive Call", "expected_recovery": 1000.0, "friction": "high", "risk": "high"},
        {"strategy": "Gentle Email", "expected_recovery": 700.0, "friction": "low", "risk": "low"}
    ]
    result = simulator_engine.compare_strategies(strategies)
    # Aggressive: 1000 - 150 (friction) - 250 (risk) = 600
    # Gentle: 700 - 0 - 0 = 700
    # Gentle should win even with lower raw recovery!
    assert result["recommended_strategy"] == "Gentle Email"
    assert result["net_score"] == 700.0

# ==========================================
# 4. EXECUTION ENGINE NETWORK TIMEOUT / ERROR
# ==========================================

def test_execution_engine_razorpay_api_exception():
    """Ensure razorpay API exceptions are caught and returned safely without server crash."""
    with patch('razorpay.Client') as mock_client:
        mock_instance = MagicMock()
        mock_instance.payment_link.create.side_effect = Exception("Razorpay 503 Gateway Timeout")
        mock_client.return_value = mock_instance

        with patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test", "RAZORPAY_KEY_SECRET": "sec"}):
            adapter = razorpay_adapter
            adapter.client = mock_instance
            result = adapter.execute_payment_link(
                amount=1000.0,
                customer_name="Timeout Test",
                customer_email="t@test.com",
                customer_phone="+919999999999"
            )
            assert result["status"] == "error"
            assert "503" in result["message"]

# ==========================================
# 5. VOICE AGENT AMBIGUOUS / GIBBERISH INPUTS
# ==========================================

def test_voice_agent_gibberish_input():
    """Ensure completely irrelevant or noisy voice inputs fall back to UNKNOWN safely."""
    with patch.dict(os.environ, {"GEMINI_API_KEY": ""}):
        agent = voice_agent
        agent.client = None
        result = agent.extract_intent("xyz abc 123 random noise background sound")
        assert result["intent"] == "UNKNOWN"
        assert result["willingness_to_pay"] is False

# ==========================================
# 6. DATABASE FAILURE RESILIENCE
# ==========================================

def test_audit_logger_db_exception_fallback():
    """Ensure database connection loss does not crash the audit logger."""
    mock_db = MagicMock()
    mock_db.add.side_effect = Exception("DB Connection Lost")

    # Should log in-memory safely without raising uncaught exception
    entry = audit_logger.log_event(
        entity_type="Transaction",
        entity_id="TXN-FAIL-01",
        event_type="TEST_FAIL",
        actor="System",
        description="Testing DB disconnect",
        db=mock_db
    )
    assert entry["entity_id"] == "TXN-FAIL-01"
