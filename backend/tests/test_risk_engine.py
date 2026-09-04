import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.services.risk_engine import analyze_transaction_risk

class TestRiskEngineSuite(unittest.TestCase):
    """
    Comprehensive Unit & Integration Test Suite for Risk Intelligence Engine.
    """

    def test_card_declined_risk_profile(self):
        """Test risk calculation for card declined failure code."""
        tx = {"amount": 4650.0, "failure_code": "CARD_DECLINED"}
        customer = {"name": "Rajesh Kumar", "segment": "Standard"}
        result = analyze_transaction_risk(tx, customer)

        self.assertEqual(result["risk_type"], "card_declined")
        self.assertEqual(result["risk_score"], 85.0)
        self.assertEqual(result["loss_probability"], 0.85)
        self.assertIn("CARD_FAILURE", result["reason_codes"])

    def test_abandoned_cart_profile(self):
        """Test recoverability boost on cart abandonment."""
        tx = {"amount": 2500.0, "failure_code": "ABANDONED"}
        customer = {"name": "Ananya Roy", "segment": "VIP"}
        result = analyze_transaction_risk(tx, customer)

        self.assertEqual(result["risk_type"], "abandoned")
        self.assertEqual(result["risk_score"], 70.0)
        self.assertEqual(result["recoverability_score"], 85.0)
        self.assertIn("CHECKOUT_ABANDONMENT", result["reason_codes"])

    def test_high_value_transaction_penalty(self):
        """Test high value penalty applied to amount > 10,000."""
        tx = {"amount": 65000.0, "failure_code": "OVERDUE"}
        customer = {"name": "Vikram Sethi"}
        result = analyze_transaction_risk(tx, customer)

        self.assertEqual(result["risk_score"], 100.0)  # Capped at 100
        self.assertIn("HIGH_VALUE_AT_RISK", result["reason_codes"])

    def test_low_value_transaction_bonus(self):
        """Test low value friction bonus applied to amount < 1000."""
        tx = {"amount": 499.0, "failure_code": "CARD_DECLINED"}
        customer = {"name": "Pooja Hegde"}
        result = analyze_transaction_risk(tx, customer)

        # 50 base + 35 (CARD) - 10 (LOW_VALUE) = 75
        self.assertEqual(result["risk_score"], 75.0)
        self.assertIn("LOW_VALUE_FRICTION", result["reason_codes"])

    def test_malformed_empty_payload_safety(self):
        """Test graceful degradation with empty or missing keys."""
        result = analyze_transaction_risk({}, {})
        self.assertEqual(result["risk_type"], "unknown")
        self.assertEqual(result["amount_at_risk"], 0.0)
        self.assertTrue(0.0 <= result["risk_score"] <= 100.0)

if __name__ == '__main__':
    unittest.main()
