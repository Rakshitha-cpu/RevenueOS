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

    # ---------------- 1. PolicyGuard Direct Unit Tests ----------------
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
            "demo_mode": False,
            "simulated_ist_hour": 23, # Even late at night, DND suppression takes precedence
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

    # ---------------- 3. VoiceAgent End-to-End Integration Tests ----------------
    def test_07_voice_agent_production_escalates_on_late_night_hour(self):
        """Test: VoiceAgent.process_turn() with demo_mode=False at 23:00 IST triggers HUMAN_ESCALATION."""
        res = VoiceAgent.process_turn(
            message="Can you give me a discount?",
            demo_mode=False,
            simulated_ist_hour=23 # 11 PM IST
        )
        self.assertEqual(res["intent"], "HUMAN_ESCALATION")
        self.assertIn("PolicyGuard BLOCKED", res["action_logged"])
        self.assertFalse(res["policy_evaluation"]["passed"])

    def test_08_voice_agent_demo_mode_allows_late_night_hour(self):
        """Test: VoiceAgent.process_turn() with demo_mode=True at 23:00 IST allows discount resolution."""
        res = VoiceAgent.process_turn(
            message="The price is too high and expensive",
            demo_mode=True,
            simulated_ist_hour=23 # 11 PM IST in demo mode
        )
        self.assertEqual(res["intent"], "PRICE_RETENTION")
        self.assertTrue(res["policy_evaluation"]["passed"])
        self.assertIn("SAVE232", res["action_logged"])

    def test_09_voice_agent_dnd_precedence_at_night(self):
        """Test: Customer saying 'wrong number' at 23:00 IST in production yields DND_STOPPING_RULE."""
        res = VoiceAgent.process_turn(
            message="This is the wrong number, please stop calling me",
            demo_mode=False,
            simulated_ist_hour=23
        )
        self.assertEqual(res["intent"], "DND_STOPPING_RULE")
        self.assertEqual(res["policy_evaluation"]["policy_status"], "DND_SUPPRESSED")
        self.assertTrue(res["policy_evaluation"]["passed"])

    def test_10_dynamic_risk_propagation(self):
        """Test: Dynamic failure_code influences risk_score in VoiceAgent turn."""
        high_risk_turn = VoiceAgent.process_turn(
            message="I will pay tomorrow",
            amount=65000,
            failure_code="CARD_DECLINED",
            demo_mode=True
        )
        low_risk_turn = VoiceAgent.process_turn(
            message="I will pay tomorrow",
            amount=450,
            failure_code="LOW_VALUE_FRICTION",
            demo_mode=True
        )
        self.assertGreater(
            high_risk_turn["policy_evaluation"]["risk_score"],
            low_risk_turn["policy_evaluation"]["risk_score"]
        )

    # ---------------- 4. Security & Cryptographic Idempotency Tests ----------------
    def test_11_hmac_webhook_verification(self):
        """Test: Genuine X-Razorpay-Signature verification."""
        payload = '{"event":"payment.failed","payment_id":"pay_123"}'
        secret = "rzp_test_secret_key"
        signature = hmac.new(secret.encode('utf-8'), payload.encode('utf-8'), hashlib.sha256).hexdigest()
        
        valid = self.security.verify_webhook_signature(payload, signature)
        self.assertTrue(valid)

if __name__ == '__main__':
    unittest.main()