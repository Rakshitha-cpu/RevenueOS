import pytest
from app.services.voice_agent import voice_agent

def test_single_turn_kannada_promise():
    result = voice_agent.extract_intent("Nanna card work aagthilla, naale pay madthini")
    assert result["intent"] == "PROMISE_TO_PAY"
    assert result["willingness_to_pay"] is True
    assert "ಧನ್ಯವಾದಗಳು" in result["ai_spoken_reply"] or "Thank you" in result["ai_spoken_reply"]

def test_single_turn_kannada_cancellation():
    result = voice_agent.extract_intent("ನನಗೆ ಈ ಪ್ರಾಡಕ್ಟ್ ಬೇಡ ಆರ್ಡರ್ ಕ್ಯಾನ್ಸಲ್ ಮಾಡಿ")
    assert result["intent"] == "OPT_OUT"
    assert result["willingness_to_pay"] is False
    assert "ಕ್ಯಾನ್ಸಲ್" in result["ai_spoken_reply"] or "cancelled" in result["ai_spoken_reply"]

def test_multi_turn_continuity():
    # Turn 1: Customer states problem
    # Turn 2: Customer promises date with context
    history = [
        {"role": "agent", "text": "Hello, your payment of Rs 4650 failed."},
        {"role": "customer", "text": "Card is declined."},
        {"role": "agent", "text": "Would you like to pay via UPI or later?"}
    ]
    
    result = voice_agent.extract_intent("Send UPI link tomorrow morning on WhatsApp", history=history)
    assert result["intent"] in ["PROMISE_TO_PAY", "ALTERNATIVE_METHOD"]
    assert result["willingness_to_pay"] is True

def test_refund_intent_extraction():
    result = voice_agent.extract_intent("Paisa cut gaya account se refund karo")
    assert result["intent"] == "REFUND_REQUEST"
    assert result["confidence_score"] >= 90
    assert "रिफंड" in result["ai_spoken_reply"] or "refund" in result["ai_spoken_reply"].lower()

def test_silent_or_empty_input():
    result = voice_agent.extract_intent("")
    assert result["intent"] == "UNKNOWN"
    assert result["confidence_score"] == 0
