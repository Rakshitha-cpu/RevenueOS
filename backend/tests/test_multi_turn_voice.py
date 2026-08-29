import pytest
from app.services.voice_agent import voice_agent

def test_greeting_intent():
    result = voice_agent.extract_intent("Hello, how are you?")
    assert result["intent"] == "GREETING"
    assert result["willingness_to_pay"] is True
    assert "Razorpay" in result["ai_spoken_reply"] or "doing well" in result["ai_spoken_reply"].lower()

def test_card_technical_inquiry_does_not_cancel():
    result = voice_agent.extract_intent("Why my card is not working?")
    assert result["intent"] == "TECHNICAL_ISSUE"
    assert result["willingness_to_pay"] is True
    assert "UPI" in result["ai_spoken_reply"] or "decline" in result["ai_spoken_reply"].lower()
    # Must NEVER cancel order for card inquiry!
    assert result["intent"] != "OPT_OUT"

def test_price_discount_inquiry():
    result = voice_agent.extract_intent("What products are cheap?")
    assert result["intent"] == "PRICE_INQUIRY"
    assert result["willingness_to_pay"] is True
    assert result["intent"] != "OPT_OUT"

def test_explicit_cancellation():
    result = voice_agent.extract_intent("Please cancel my order, I don't want it")
    assert result["intent"] == "OPT_OUT"
    assert result["willingness_to_pay"] is False

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
