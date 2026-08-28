import os
import json
from typing import Dict, Any, List

try:
    from google import genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

class RecoveryIntelligenceAgent:
    """
    Agent #2: Recovery Intelligence Agent
    """
    
    def __init__(self):
        from dotenv import load_dotenv
        load_dotenv()
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key and HAS_GENAI:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None
            
        self.system_prompt = "You are the RevenueOS Recovery Intelligence Agent. Return concise insights."

    def diagnose(self, risk_profile: Dict[str, Any], customer: Dict[str, Any]) -> str:
        # LIVE AI INFERENCE
        if self.client:
            prompt = f"Diagnose this payment failure: {json.dumps(risk_profile)}. Customer context: {json.dumps(customer)}. Be brief (1-2 sentences)."
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            return response.text

        # DETERMINISTIC FALLBACK
        risk_type = risk_profile.get("risk_type", "").lower()
        
        if "card" in risk_type or risk_type == "card_declined":
            return "Payment-method friction. Customer's card is consistently failing. Historical signals indicate a preference for UPI."
        elif risk_type == "abandoned":
            return "Checkout distraction or multi-factor authentication fatigue. High probability of recovery with a low-friction payment link."
        elif risk_type == "overdue":
            return "Cash flow delay. B2B customer usually pays within Net-45 terms despite Net-30 invoice."
        
        return "General payment drop-off. Standard recovery flows apply."

    def generate_strategies(self, risk_profile: Dict[str, Any], customer: Dict[str, Any], policy: Dict[str, Any]) -> List[Dict[str, Any]]:
        amount = risk_profile.get("amount_at_risk", 10000)
        
        # Simulating the generation of various strategies
        return [
            {
                "strategy": "Immediate retry",
                "expected_recovery": round(amount * 0.64, 2),
                "risk": "Low",
                "friction": "Low"
            },
            {
                "strategy": "Email + link",
                "expected_recovery": round(amount * 0.73, 2),
                "risk": "Low",
                "friction": "Medium"
            },
            {
                "strategy": "Payment link",
                "expected_recovery": round(amount * 0.81, 2),
                "risk": "Low",
                "friction": "Low"
            },
            {
                "strategy": "Voice + UPI",
                "expected_recovery": round(amount * 0.93, 2),
                "risk": "Medium",
                "friction": "High"
            },
            {
                "strategy": "Human escalation",
                "expected_recovery": round(amount * 0.59, 2),
                "risk": "Low",
                "friction": "Low"
            }
        ]

    def recommend(self, strategies: List[Dict[str, Any]], policy: Dict[str, Any]) -> Dict[str, Any]:
        # Evaluates the best tradeoff between recovery, risk, and policy
        # In a real LLM call, the LLM evaluates the tradeoffs and returns this JSON.
        
        return {
            "recommended_strategy": "Payment link",
            "expected_recovery": strategies[2]["expected_recovery"], # Corresponds to Payment link
            "reason": "Voice + UPI has a higher absolute expected recovery, but 'Payment link' achieves a better recovery/friction tradeoff and strictly complies with the current merchant policy limits on customer contact."
        }
