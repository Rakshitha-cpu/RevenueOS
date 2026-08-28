import pytest
import sys
import os

# Ensure the app module can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.policy_engine import policy_guard

def test_evaluate_action_authorized():
    """Test that a compliant transaction is authorized."""
    amount = 1000.0
    customer = {"previous_retries": 1}
    policy_config = {"high_value_threshold": 50000.0, "max_retries": 3, "fraud_block_enabled": True}
    risk_profile = {"risk_score": 10}
    
    result = policy_guard.evaluate_action("payment_link", amount, customer, policy_config, risk_profile)
    
    assert result["authorized"] is True
    assert result["requires_human"] is False

def test_evaluate_action_exceeds_amount_threshold():
    """Test that transactions above the high-value threshold are blocked/escalated."""
    amount = 60000.0
    customer = {"previous_retries": 0}
    policy_config = {"high_value_threshold": 50000.0, "max_retries": 3, "fraud_block_enabled": True}
    risk_profile = {"risk_score": 10}
    
    result = policy_guard.evaluate_action("payment_link", amount, customer, policy_config, risk_profile)
    
    assert result["authorized"] is False
    assert result["requires_human"] is True
    assert "Amount (₹60000.0) exceeds" in result["reason"]

def test_evaluate_action_exceeds_retries():
    """Test that transactions hitting the retry limit are stopped."""
    amount = 1000.0
    customer = {"previous_retries": 3}
    policy_config = {"high_value_threshold": 50000.0, "max_retries": 3, "fraud_block_enabled": True}
    risk_profile = {"risk_score": 10}
    
    result = policy_guard.evaluate_action("payment_link", amount, customer, policy_config, risk_profile)
    
    assert result["authorized"] is False
    assert result["requires_human"] is True
    assert "maximum contact limit" in result["reason"]

def test_evaluate_action_fraud_blocked():
    """Test that transactions with high risk scores are blocked."""
    amount = 1000.0
    customer = {"previous_retries": 0}
    policy_config = {"high_value_threshold": 50000.0, "max_retries": 3, "fraud_block_enabled": True}
    risk_profile = {"risk_score": 90}
    
    result = policy_guard.evaluate_action("payment_link", amount, customer, policy_config, risk_profile)
    
    assert result["authorized"] is False
    assert result["requires_human"] is True
    assert "Risk score (90) exceeds" in result["reason"]

def test_evaluate_action_unauthorized_refund():
    """Test that AI cannot autonomously issue refunds."""
    amount = 500.0
    customer = {"previous_retries": 0}
    policy_config = {"high_value_threshold": 50000.0, "max_retries": 3, "fraud_block_enabled": True}
    risk_profile = {"risk_score": 10}
    
    result = policy_guard.evaluate_action("refund", amount, customer, policy_config, risk_profile)
    
    assert result["authorized"] is False
    assert result["requires_human"] is True
    assert "Unrestricted refunds" in result["reason"]
