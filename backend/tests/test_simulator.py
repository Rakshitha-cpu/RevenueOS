import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.simulator import ImpactSimulator

@pytest.fixture
def simulator():
    return ImpactSimulator()

def test_compare_strategies_empty(simulator):
    result = simulator.compare_strategies([])
    assert result["recommended_strategy"] is None
    assert result["expected_recovery"] == 0.0
    assert result["net_score"] == 0.0
    assert result["ranked_options"] == []

def test_compare_strategies_ranking(simulator):
    strategies = [
        {"strategy": "Email Link", "expected_recovery": 1000.0, "friction": "Low", "risk": "Low"},
        {"strategy": "Aggressive Retry", "expected_recovery": 1000.0, "friction": "High", "risk": "High"},
        {"strategy": "SMS Link", "expected_recovery": 1000.0, "friction": "Medium", "risk": "Low"}
    ]
    result = simulator.compare_strategies(strategies)
    
    assert result["recommended_strategy"] == "Email Link"
    # Email has 0 penalties
    assert result["net_score"] == 1000.0
    
    # Aggressive retry should be ranked last due to high friction (15%) and high risk (25%)
    assert result["ranked_options"][-1]["strategy"] == "Aggressive Retry"
    assert result["ranked_options"][-1]["net_score"] == 1000.0 - 150.0 - 250.0

def test_compare_strategies_penalties(simulator):
    strategies = [
        {"strategy": "Medium Risk", "expected_recovery": 100.0, "friction": "Low", "risk": "Medium"},
    ]
    result = simulator.compare_strategies(strategies)
    # Medium risk = 10% penalty
    assert result["net_score"] == 90.0
    assert result["ranked_options"][0]["risk_penalty"] == 10.0
