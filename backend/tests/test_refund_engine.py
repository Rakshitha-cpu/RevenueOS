import unittest
from app.services.refund_engine import refund_engine

def test_instant_refund_processing():
    result = refund_engine.process_instant_refund(
        payment_id="pay_test_90421",
        amount=4650.0,
        customer_vpa="test@okaxis",
        reason="GATEWAY_TIMEOUT_DOUBLE_DEBIT"
    )
    assert result["status"] == "PROCESSED"
    assert result["amount"] == 4650.0
    assert result["speed"] == "optimum_instant"
    assert "UTR" in result["bank_rrn_utr"]
    assert result["latency_ms"] < 3000

def test_store_credit_uplift_bonus():
    result = refund_engine.offer_store_credit_uplift(amount=1000.0, bonus_pct=0.05)
    assert result["original_amount"] == 1000.0
    assert result["bonus_amount"] == 50.0
    assert result["total_store_credit"] == 1050.0
    assert "REVOS-" in result["voucher_code"]
    assert result["status"] == "READY_FOR_REDEMPTION"

def test_utr_lifecycle_tracking():
    tracking = refund_engine.track_utr_lifecycle("UTR90281039841")
    assert tracking["current_status"] == "CREDITED_TO_ACCOUNT"
    assert len(tracking["stages"]) == 4
    assert tracking["stages"][-1]["status"] == "CREDITED"
