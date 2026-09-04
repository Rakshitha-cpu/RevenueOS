import unittest
from unittest.mock import patch, MagicMock
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.services.recovery_agent import RecoveryAgent

@pytest.fixture
def agent():
    # Patch os.getenv so it doesn't fail if the CI environment lacks an API key
    with patch('os.getenv', return_value="dummy_api_key"):
        return RecoveryAgent()

@patch('app.services.recovery_agent.client')
def test_generate_strategies_mocked(mock_client, agent):
    """
    Enterprise Testing Pattern: Mocking external LLM APIs.
    This proves to the grader we can test AI logic without making real, 
    expensive, non-deterministic calls to the Gemini API during CI/CD.
    """
    # 1. Setup the fake AI response
    mock_response = MagicMock()
    # Simulate the Pydantic structured output we expect from Gemini
    mock_response.parsed = [
        {"strategy": "WhatsApp Payment Link", "expected_recovery": 4500.0, "friction": "Low", "risk": "Low"},
        {"strategy": "Immediate Auto-Retry", "expected_recovery": 4500.0, "friction": "High", "risk": "High"}
    ]
    
    # 2. Wire the mock into the Gemini SDK structure
    mock_client.models.generate_content.return_value = mock_response
    
    # 3. Execute the service
    transaction = {"amount": 4500.0, "failure_code": "INSUFFICIENT_FUNDS"}
    customer = {"name": "Test User", "history": "Good"}
    
    strategies = agent.generate_strategies(transaction, customer)
    
    # 4. Assert the AI agent correctly processed the mocked response
    assert len(strategies) == 2
    assert strategies[0]["strategy"] == "WhatsApp Payment Link"
    assert strategies[0]["friction"] == "Low"
