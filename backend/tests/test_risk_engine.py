import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.risk_engine import RiskIntelligenceAgent

@pytest.fixture
def risk_agent():
    return RiskIntelligenceAgent()

def test_evaluate_risk_insufficient_funds(risk_agent):
    """Test that insufficient funds returns correct risk profile."""
    transaction = {"amount": 5000, "error_code": "INSUFFICIENT_FUNDS"}
    customer = {"history": "good"}
    
    profile = risk_agent.evaluate_risk(transaction, customer)
    
    assert profile["risk_score"] < 50
    assert profile["risk_type"] == "INSUFFICIENT_FUNDS"
    assert "High probability of recovery" in profile["diagnosis"]

def test_evaluate_risk_suspected_fraud(risk_agent):
    """Test that fraud signals return high risk scores."""
    transaction = {"amount": 100000, "error_code": "SUSPECTED_FRAUD"}
    customer = {"history": "new"}
    
    profile = risk_agent.evaluate_risk(transaction, customer)
    
    assert profile["risk_score"] > 80
    assert profile["risk_type"] == "FRAUD_RISK"

def test_evaluate_risk_abandoned_cart(risk_agent):
    """Test cart abandonment risk profiling."""
    transaction = {"amount": 2000, "error_code": "USER_ABANDONED"}
    customer = {"history": "repeat"}
    
    profile = risk_agent.evaluate_risk(transaction, customer)
    
    assert profile["risk_score"] < 30
    assert profile["risk_type"] == "ABANDONED"
