import pytest
from app.services.policy_engine import PolicyGuard
from app.services.security_guard import SecurityGuard
from app.services.risk_engine import analyze_transaction_risk
from app.services.voice_agent import VoiceAgent

class TestPolicyEngineIntegration:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.guard = PolicyGuard()
        self.security = SecurityGuard(webhook_secret="rzp_test_secret_123")
        self.voice = VoiceAgent()

    def test_fraud_boundary_enforcement(self):
        res = self.guard.evaluate_action(
            action="retry",
            amount=5000,
            customer={"id": "c1"},
            policy_config={"fraud_block_enabled": True},
            risk_profile={"risk_score": 86}
        )
        assert res["authorized"] is False
        assert "BLOCKED" in res["reason"]

    def test_high_value_escalation_tier(self):
        res = self.guard.evaluate_action(
            action="discount",
            amount=60000,
            customer={"id": "c2"},
            policy_config={"high_value_threshold": 50000.0},
            risk_profile={"risk_score": 10}
        )
        assert res["authorized"] is False
        assert "ESCALATED" in res["reason"]

    def test_unauthorized_refund_blocked(self):
        res = self.guard.evaluate_action(
            action="refund",
            amount=1000,
            customer={"id": "c3"},
            policy_config={},
            risk_profile={"risk_score": 5}
        )
        assert res["authorized"] is False
        assert "BLOCKED" in res["reason"]

    def test_dnd_stopping_rule_suppression(self):
        res = self.guard.evaluate_action(
            action="whatsapp_link",
            amount=2000,
            customer={"id": "c4", "previous_retries": 2},
            policy_config={"max_retries": 2},
            risk_profile={"risk_score": 12}
        )
        assert res["authorized"] is False
        assert "STOPPED" in res["reason"]

    def test_risk_engine_calculation(self):
        txn = {"id": "t1", "amount": 4500, "failure_reason": "E_504_TIMEOUT"}
        cust = {"id": "c5", "previous_retries": 0, "is_vip": True}
        profile = analyze_transaction_risk(txn, cust)
        assert profile["risk_score"] < 50
        assert profile["recoverability_score"] > 0.70

    def test_idempotency_token_structure(self):
        link = self.security.generate_idempotent_recovery_link(order_id="ORD_101", amount=3500, customer_phone="+919876543210")
        assert "idemp_" in link["idempotency_key"]
        assert link["ttl_minutes"] == 15

    def test_live_ai_agent_prompt_structure(self):
        intent_res = self.voice.extract_intent("My order is delayed, when will it arrive?")
        assert intent_res["intent"] in ["DELIVERY_EXPEDITE", "DELIVERY_DELAY"]
        assert "confidence_score" in intent_res