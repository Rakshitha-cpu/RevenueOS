import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.services.refund_engine import refund_engine

class TestRefundEngineSuite(unittest.TestCase):
    """
    Comprehensive Test Suite for Instant Refund & Smart Compensation Engine.
    """

    def test_instant_refund_processing(self):
        """Test sub-3-second instant refund calculation and bank UTR generation."""
        result = refund_engine.process_instant_refund(
            payment_id="pay_test_90421",
            amount=4650.0,
            customer_vpa="test@okaxis",
            reason="GATEWAY_TIMEOUT_DOUBLE_DEBIT"
        )
        self.assertEqual(result["status"], "PROCESSED")
        self.assertEqual(result["amount"], 4650.0)
        self.assertEqual(result["currency"], "INR")
        self.assertEqual(result["speed"], "optimum_instant")
        self.assertTrue(result["bank_rrn_utr"].startswith("UTR"))
        self.assertLess(result["latency_ms"], 3000)
        self.assertEqual(result["settlement_rail"], "UPI_INSTANT_REVERSAL")

    def test_store_credit_uplift_bonus(self):
        """Test converting refund into instant store credit with 5% goodwill bonus."""
        result = refund_engine.offer_store_credit_uplift(amount=1000.0, bonus_pct=0.05)
        self.assertEqual(result["original_amount"], 1000.0)
        self.assertEqual(result["bonus_amount"], 50.0)
        self.assertEqual(result["total_store_credit"], 1050.0)
        self.assertTrue(result["voucher_code"].startswith("REVOS-"))
        self.assertEqual(result["validity_days"], 30)
        self.assertEqual(result["status"], "READY_FOR_REDEMPTION")

    def test_utr_lifecycle_tracking(self):
        """Test NPCI bank audit trail stages for real-time customer transparency."""
        tracking = refund_engine.track_utr_lifecycle("UTR90281039841")
        self.assertEqual(tracking["utr_number"], "UTR90281039841")
        self.assertEqual(tracking["current_status"], "CREDITED_TO_ACCOUNT")
        self.assertEqual(len(tracking["stages"]), 4)
        self.assertEqual(tracking["stages"][-1]["status"], "CREDITED")

if __name__ == '__main__':
    unittest.main()
