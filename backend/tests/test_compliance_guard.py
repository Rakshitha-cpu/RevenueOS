import unittest
import sys
import os
import hmac
import hashlib
from zoneinfo import ZoneInfo
from datetime import datetime

# Add backend root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.policy_guard import PolicyGuard
from app.services.security_guard import SecurityGuard
from app.services.voice_agent import VoiceAgent
from app.services.risk_engine import analyze_transaction_risk

class TestRevenueOSEndToEndSuite(unittest.TestCase):
    """
    Comprehensive End-to-End Test Suite for RevenueOS.
    Verifies PolicyGuard 12-rule safety firewall, TRAI DND boundary conditions,
    ZoneInfo IST timezone calculations, dynamic risk scoring, and DPDP compliance.
    """

    def setUp(self):
        self.guard = PolicyGuard()
        self.security = SecurityGuard(webhook_secret="rzp_test_secret_key")
        self.voice = VoiceAgent()

    # ---------------- 1. PolicyGuard IST Timezone & DND Tests ----------------
    def test_01_trai_dnd_bypassed_in_demo_mode(self):
        """Test: DND time check does NOT block when demo_mode=True, regardless of IST hour."""
        result = PolicyGuard.evaluate_all({
            "simulated_ist_hour": 23, # 11:00 PM IST (normally prohibited)
            "demo_mode": True,
            "discount_applied_percent": 0.0,
            "risk_score": 20.0
        })
        self.assertTrue(result["passed"])
        self.assertEqual(result["policy_status"], "APPROVED")
        self.assertEqual(len(result["violations"]), 0)

    def test_02_trai_dnd_strictly_enforced_in_production(self):
        """Test: DND time check DOES block in production (demo_mode=False) at 22:00 IST."""
        result = PolicyGuard.evaluate_all({
            "simulated_ist_hour": 22, # 10:00 PM IST
            "demo_mode": False,
            "discount_applied_percent": 0.0,
            "risk_score": 20.0
        })
        self.assertFalse(result["passed"])
        self.assertEqual(result["policy_status"], "HALTED")
        self.assertTrue(any("RULE_1_TRAI_DND_VIOLATION" in v for v in result["violations"]))

    def test_03_trai_dnd_allowed_in_working_hours(self):
        """Test: DND time check passes in production at 14:00 IST (2:00 PM)."""
        result = PolicyGuard.evaluate_all({
            "simulated_ist_hour": 14, # 2:00 PM IST
            "demo_mode": False,
            "discount_applied_percent": 0.0,
            "risk_score": 20.0
        })
        self.assertTrue(result["passed"])
        self.assertEqual(result["policy_status"], "APPROVED")

    def test_04_zoneinfo_ist_resolution(self):
        """Test: Verifies PolicyGuard.get_ist_datetime() resolves to Asia/Kolkata timezone."""
        ist_dt = PolicyGuard.get_ist_datetime()
        self.assertEqual(str(ist_dt.tzinfo), "Asia/Kolkata")
        self.assertIsInstance(ist_dt.hour, int)

    # ---------------- 2. DPDP Opt-Out & Stopping Rule Tests ----------------
    def test_05_dpdp_opt_out_is_compliant_dnd_suppression(self):
        """Test: customer_opt_out=True produces DND_SUPPRESSED status via evaluate_all()."""
        result = PolicyGuard.evaluate_all({
            "customer_opt_out": True,
            "demo_mode": True,
            "discount_applied_percent": 0.0,
            "risk_score": 15.0
        })
        self.assertTrue(result["passed"]) # Compliant termination
        self.assertTrue(result["is_dnd_stop"])
        self.assertEqual(result["policy_status"], "DND_SUPPRESSED")

    def test_06_discount_cap_rule_enforced(self):
        """Test: Discount > 5.0% is blocked by PolicyGuard Rule 3."""
        result = PolicyGuard.evaluate_all({
            "discount_applied_percent": 15.0, # Attempted 15% discount
            "demo_mode": True,
            "risk_score": 10.0
        })
        self.assertFalse(result["passed"])
        self.assertEqual(result["policy_status"], "HALTED")
        self.assertTrue(any("RULE_3_DISCOUNT_CAP_EXCEEDED" in v for v in result["violations"]))

    # ---------------- 3. Dynamic Risk Scoring Tests ----------------
    def test_07_dynamic_risk_engine_calculation(self):
        """Test: analyze_transaction_risk outputs dynamic scores based on failure reason and amount."""
        high_risk = analyze_transaction_risk(
            transaction_data={"amount": 45000, "failure_code": "CARD_DECLINED"},
            customer_data={"customer_name": "Test Customer", "interaction_turns": 1}
        )
        low_risk = analyze_transaction_risk(
            transaction_data={"amount": 450, "failure_code": "LOW_VALUE_FRICTION"},
            customer_data={"customer_name": "Test Customer", "interaction_turns": 1}
        )
        self.assertGreater(high_risk["risk_score"], low_risk["risk_score"])
        self.assertIn("CARD_FAILURE", high_risk["reason_codes"])

    # ---------------- 4. Security & Cryptographic Idempotency Tests ----------------
    def test_08_hmac_webhook_verification(self):
        """Test: Genuine X-Razorpay-Signature verification."""
        payload = '{"event":"payment.failed","payment_id":"pay_123"}'
        secret = "rzp_test_secret_key"
        signature = hmac.new(secret.encode('utf-8'), payload.encode('utf-8'), hashlib.sha256).hexdigest()
        
        valid = self.security.verify_webhook_signature(payload, signature)
        self.assertTrue(valid)

    # ---------------- 5. Voice NLU Progression & Gatekeeping Tests ----------------
    def test_09_voice_intent_and_policyguard_gating(self):
        """Test: Voice NLU runs through PolicyGuard gatekeeper and returns structured intent."""
        # 1. Payment confirmation
        paid_res = self.voice.extract_intent("I already paid via Google Pay")
        self.assertEqual(paid_res["intent"], "PAYMENT_CONFIRMED")

        # 2. DND wrong number
        dnd_res = self.voice.extract_intent("This is the wrong number, not Rajesh")
        self.assertEqual(dnd_res["intent"], "DND_STOPPING_RULE")
        self.assertIn("PolicyGuard", dnd_res["policyguard_action"])

        # 3. Price objection with 5% discount cap verified
        price_res = self.voice.extract_intent("The price is too high and expensive")
        self.assertEqual(price_res["intent"], "PRICE_RETENTION")
        self.assertIn("SAVE232", price_res["policyguard_action"])

if __name__ == '__main__':
    unittest.main()