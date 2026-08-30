import unittest
import sys
import os
import hmac
import hashlib

# Add backend root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.policy_engine import PolicyGuard
from app.services.security_guard import SecurityGuard
from app.services.voice_agent import VoiceAgent

class TestRevenueOSEndToEndSuite(unittest.TestCase):
    """
    Comprehensive End-to-End Test Suite for RevenueOS.
    Verifies PolicyGuard firewalls, HMAC signatures, Idempotency keys, 
    Maker-Checker routing, and Vernacular NLU progression.
    """

    def setUp(self):
        self.guard = PolicyGuard()
        self.security = SecurityGuard(webhook_secret="rzp_test_secret_key")
        self.voice = VoiceAgent()

    # ---------------- 1. PolicyGuard Firewall Tests ----------------
    def test_01_fraud_block_enforced(self):
        """Test: Transactions with risk score > 85 are deterministically blocked."""
        result = self.guard.evaluate_action(
            action="retry",
            amount=5000,
            customer={"id": "cust_1"},
            policy_config={"fraud_block_enabled": True},
            risk_profile={"risk_score": 92}
        )
        self.assertFalse(result["authorized"])
        self.assertIn("BLOCKED", result["reason"])
        self.assertTrue(result["requires_human"])

    def test_02_high_value_escalation(self):
        """Test: High-value carts (>₹50,000) require human supervisor sign-off."""
        result = self.guard.evaluate_action(
            action="discount",
            amount=75000,
            customer={"id": "cust_2"},
            policy_config={"high_value_threshold": 50000.0},
            risk_profile={"risk_score": 20}
        )
        self.assertFalse(result["authorized"])
        self.assertIn("ESCALATED", result["reason"])
        self.assertTrue(result["requires_human"])

    def test_03_unauthorized_direct_refund_prohibited(self):
        """Test: Direct AI refund execution without human authorization is blocked."""
        result = self.guard.evaluate_action(
            action="refund",
            amount=1000,
            customer={"id": "cust_3"},
            policy_config={},
            risk_profile={"risk_score": 10}
        )
        self.assertFalse(result["authorized"])
        self.assertIn("BLOCKED", result["reason"])

    def test_04_safe_recovery_authorized(self):
        """Test: Standard legitimate recovery below limits is approved."""
        result = self.guard.evaluate_action(
            action="1_tap_upi",
            amount=2500,
            customer={"id": "cust_4"},
            policy_config={"high_value_threshold": 50000.0, "fraud_block_enabled": True},
            risk_profile={"risk_score": 15}
        )
        self.assertTrue(result["authorized"])
        self.assertIn("APPROVED", result["reason"])

    def test_05_stopping_rule_contact_limit_respected(self):
        """Test: Customer who reached max retries is halted (0 spam)."""
        result = self.guard.evaluate_action(
            action="whatsapp_link",
            amount=1500,
            customer={"id": "cust_5", "previous_retries": 3},
            policy_config={"max_retries": 3},
            risk_profile={"risk_score": 10}
        )
        self.assertFalse(result["authorized"])
        self.assertIn("STOPPED", result["reason"])

    # ---------------- 2. Fintech Payment Security Tests ----------------
    def test_06_hmac_signature_verification(self):
        """Test: Genuine X-Razorpay-Signature is verified and tampered payload is rejected."""
        payload = '{"event":"payment.failed","payment_id":"pay_123"}'
        secret = "rzp_test_secret_key"
        signature = hmac.new(secret.encode('utf-8'), payload.encode('utf-8'), hashlib.sha256).hexdigest()
        
        # Valid signature should pass
        valid, msg = self.security.verify_webhook_signature(payload, signature)
        self.assertTrue(valid)
        
        # Tampered payload must fail
        invalid, _ = self.security.verify_webhook_signature(payload + "tampered", signature)
        self.assertFalse(invalid)

    def test_07_idempotency_token_generation(self):
        """Test: Generates 15-minute TTL cryptographic idempotency token."""
        link_data = self.security.generate_idempotent_recovery_link(order_id="ORD_987", amount=4500, customer_phone="+919876543210")
        self.assertIn("idempotency_key", link_data)
        self.assertTrue(link_data["idempotency_key"].startswith("idemp_"))
        self.assertEqual(link_data["ttl_minutes"], 15)

    def test_08_maker_checker_tier_routing(self):
        """Test: Dual-authorization routing based on cart value and risk score."""
        # Low value -> Auto approved
        tier1 = self.security.evaluate_maker_checker_tier(amount=8500, risk_score=15)
        self.assertEqual(tier1["status"], "AUTO_APPROVED")
        
        # High value -> Supervisor Queue
        tier2 = self.security.evaluate_maker_checker_tier(amount=35000, risk_score=20)
        self.assertEqual(tier2["status"], "PENDING_SUPERVISOR_APPROVAL")

    # ---------------- 3. Voice NLU Multi-Turn Progression Tests ----------------
    def test_09_voice_intent_progression(self):
        """Test: Voice NLU accurately classifies customer intents without loop."""
        # Test deterministic NLU by invoking without history
        paid_res = self.voice.extract_intent("I already paid via Google Pay")
        self.assertEqual(paid_res["intent"], "PAYMENT_CONFIRMED")

        dnd_res = self.voice.extract_intent("This is the wrong number, not Rajesh")
        self.assertEqual(dnd_res["intent"], "DND_STOPPING_RULE")

        delay_res = self.voice.extract_intent("Delivery delay is the reason")
        self.assertEqual(delay_res["intent"], "DELIVERY_EXPEDITE")

if __name__ == '__main__':
    unittest.main()