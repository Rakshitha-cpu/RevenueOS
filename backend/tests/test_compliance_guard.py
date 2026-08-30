import unittest
import sys
import os

# Add backend root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.policy_engine import PolicyGuard

class TestComplianceGuard(unittest.TestCase):
    """
    Deterministic compliance test suite verifying strict DPDP, fraud blocks,
    and high-value threshold enforcement.
    """

    def setUp(self):
        self.guard = PolicyGuard()

    def test_fraud_block_enforced(self):
        """Verify that transactions with risk score > 85 are deterministically blocked."""
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

    def test_high_value_escalation(self):
        """Verify that amounts exceeding merchant threshold (e.g. ₹50,000) are escalated to human."""
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

    def test_unauthorized_direct_refund_prohibited(self):
        """Verify AI cannot execute unrestricted direct refunds without human approval."""
        result = self.guard.evaluate_action(
            action="refund",
            amount=1000,
            customer={"id": "cust_3"},
            policy_config={},
            risk_profile={"risk_score": 10}
        )
        self.assertFalse(result["authorized"])
        self.assertIn("BLOCKED", result["reason"])

    def test_safe_recovery_authorized(self):
        """Verify standard legitimate interventions under policy threshold pass cleanly."""
        result = self.guard.evaluate_action(
            action="1_tap_upi",
            amount=2500,
            customer={"id": "cust_4"},
            policy_config={"high_value_threshold": 50000.0, "fraud_block_enabled": True},
            risk_profile={"risk_score": 15}
        )
        self.assertTrue(result["authorized"])
        self.assertIn("APPROVED", result["reason"])

if __name__ == '__main__':
    unittest.main()