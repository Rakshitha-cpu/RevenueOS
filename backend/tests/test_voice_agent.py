import pytest
from unittest.mock import patch, MagicMock
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.services.voice_agent import VoiceAgent

@pytest.fixture
def voice_agent_fallback():
    with patch.dict(os.environ, {"GEMINI_API_KEY": ""}):
        agent = VoiceAgent()
        agent.client = None
        return agent

def test_voice_agent_multilingual_fallback(voice_agent_fallback):
    """Test deterministic multilingual fallback for all 6 supported Indian languages."""
    # English
    res_en = voice_agent_fallback.extract_intent("I will pay tomorrow morning")
    assert res_en["intent"] == "PROMISE_TO_PAY"
    assert res_en["willingness_to_pay"] is True

    # Hindi (Kal pay karunga)
    res_hi = voice_agent_fallback.extract_intent("Main kal payment kar dunga")
    assert res_hi["intent"] == "PROMISE_TO_PAY"
    assert res_hi["willingness_to_pay"] is True

    # Kannada (Naale pay maadthini)
    res_kn = voice_agent_fallback.extract_intent("Naale payment maadthini")
    assert res_kn["intent"] == "PROMISE_TO_PAY"
    assert res_kn["willingness_to_pay"] is True

    # Tamil (Naalai)
    res_ta = voice_agent_fallback.extract_intent("Naalai pay panren")
    assert res_ta["intent"] == "PROMISE_TO_PAY"
    assert res_ta["willingness_to_pay"] is True

    # Telugu (Repu)
    res_te = voice_agent_fallback.extract_intent("Repu payment chestanu")
    assert res_te["intent"] == "PROMISE_TO_PAY"
    assert res_te["willingness_to_pay"] is True

    # UPI switch
    res_upi = voice_agent_fallback.extract_intent("Can I pay using GPay or PhonePe UPI?")
    assert res_upi["intent"] == "ALTERNATIVE_METHOD"
    assert res_upi["payment_method"] == "UPI"

    # Opt Out
    res_opt = voice_agent_fallback.extract_intent("No, don't call me again")
    assert res_opt["intent"] == "OPT_OUT"
    assert res_opt["willingness_to_pay"] is False

def test_voice_agent_mocked_gemini():
    """Test LLM extraction when client is active."""
    with patch('google.genai.Client') as mock_genai:
        mock_instance = MagicMock()
        mock_response = MagicMock()
        mock_response.text = '{"intent": "PROMISE_TO_PAY", "payment_method": "UPI", "requested_date": "tomorrow", "willingness_to_pay": true}'
        mock_instance.models.generate_content.return_value = mock_response
        mock_genai.return_value = mock_instance

        with patch.dict(os.environ, {"GEMINI_API_KEY": "test_gemini_key"}):
            agent = VoiceAgent()
            agent.client = mock_instance
            result = agent.extract_intent("I will pay tomorrow via UPI")
            assert result["intent"] == "PROMISE_TO_PAY"
            assert result["payment_method"] == "UPI"
            assert result["willingness_to_pay"] is True
