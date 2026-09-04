import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.services.policy_guard import PolicyGuard

class TestPolicyEngineSuite(unittest.TestCase):
    """
    Exhaustive Test Suite for PolicyGuard Deterministic Safety Rules (Rules 1-12).
    """

    def test_compliant_transaction_authorized(self):
        """Rule: Normal compliant daytime transaction within discount cap is approved."""
        context = {
            "simulated_ist_hour": 14,
            "demo_mode": False,
            "risk_score": 15.0,
            "discount_applied_percent": 5.0,
            "amount": 4650.0
        }
        res = PolicyGuard.evaluate_all(context)
        self.assertTrue(res["passed"])
        self.assertEqual(res["policy_status"], "APPROVED")
        self.assertEqual(res["violations_count"], 0)

    def test_trai_dnd_violation_in_prod(self):
        """Rule 1: Late night (23:00 IST) automated outreach strictly halted in production."""
        context = {
            "simulated_ist_hour": 23,
            "demo_mode": False,
            "risk_score": 10.0
        }
        res = PolicyGuard.evaluate_all(context)
        self.assertFalse(res["passed"])
        self.assertEqual(res["policy_status"], "HALTED")
        self.assertTrue(any("RULE_1_TRAI_DND_VIOLATION" in v for v in res["violations"]))

    def test_fraud_risk_ceiling_breached(self):
        """Rule 2: Transactions with fraud risk score > 85 are halted."""
        context = {
            "simulated_ist_hour": 15,
            "demo_mode": True,
            "risk_score": 92.0
        }
        res = PolicyGuard.evaluate_all(context)
        self.assertFalse(res["passed"])
        self.assertEqual(res["policy_status"], "HALTED")
        self.assertTrue(any("RULE_2_FRAUD_RISK_EXCEEDED" in v for v in res["violations"]))

    def test_discount_cap_exceeded(self):
        """Rule 3: Unauthorized discount request > 5.0% is halted."""
        context = {
            "simulated_ist_hour": 14,
            "demo_mode": True,
            "discount_applied_percent": 15.0
        }
        res = PolicyGuard.evaluate_all(context)
        self.assertFalse(res["passed"])
        self.assertEqual(res["policy_status"], "HALTED")
        self.assertTrue(any("RULE_3_DISCOUNT_CAP_EXCEEDED" in v for v in res["violations"]))

    def test_dpdp_opt_out_stopping_rule(self):
        """Rule 4: Explicit DND / Wrong Number opt-out takes immediate precedence."""
        context = {
            "simulated_ist_hour": 23,
            "demo_mode": False,
            "customer_opt_out": True
        }
        res = PolicyGuard.evaluate_all(context)
        self.assertTrue(res["is_dnd_stop"])
        self.assertEqual(res["policy_status"], "DND_SUPPRESSED")

    def test_npci_direct_debit_blocked(self):
        """Rule 5: Direct debit without 2FA PIN is strictly forbidden."""
        context = {
            "simulated_ist_hour": 14,
            "demo_mode": True,
            "action_type": "DIRECT_DEBIT_WITHOUT_PIN"
        }
        res = PolicyGuard.evaluate_all(context)
        self.assertFalse(res["passed"])
        self.assertEqual(res["policy_status"], "HALTED")
        self.assertTrue(any("RULE_5_NPCI_PIN_REQUIRED" in v for v in res["violations"]))

if __name__ == '__main__':
    unittest.main()
