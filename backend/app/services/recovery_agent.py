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
        
        # LIVE AI INFERENCE WITH STRUCTURED OUTPUTS
        if self.client:
            try:
                from pydantic import BaseModel, Field
                
                class RecoveryStrategy(BaseModel):
                    strategy: str = Field(description="Name of the strategy (e.g., Payment link, Immediate retry)")
                    expected_recovery: float = Field(description="Expected monetary recovery amount")
                    risk: str = Field(description="Risk level: Low, Medium, or High")
                    friction: str = Field(description="Customer friction level: Low, Medium, or High")
                
                prompt = f"""
                Analyze this payment failure and generate 4 recovery strategies.
                Amount at risk: {amount}
                Risk Profile: {json.dumps(risk_profile)}
                Customer: {json.dumps(customer)}
                Return a list of strictly formatted strategies calculating expected recovery mathematically based on friction.
                """
                
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                    config={
                        "response_mime_type": "application/json",
                        "response_schema": list[RecoveryStrategy],
                        "temperature": 0.2
                    }
                )
                # Parse the JSON string back into a Python list of dicts
                return json.loads(response.text)
            except Exception as e:
                print(f"GenAI Structured Output failed, falling back to deterministic: {e}")
                pass

        # DETERMINISTIC FALLBACK
        return [
            {
                "strategy": "Immediate retry",
                "expected_recovery": round(amount * 0.64, 2),
                "risk": "Low",
                "friction": "Low"
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
            }
        ]

    def recommend(self, strategies: List[Dict[str, Any]], policy: Dict[str, Any]) -> Dict[str, Any]:
        # LIVE AI INFERENCE
        if self.client:
            try:
                from pydantic import BaseModel
                class Recommendation(BaseModel):
                    recommended_strategy: str
                    expected_recovery: float
                    reason: str
                
                prompt = f"Given these strategies: {json.dumps(strategies)} and this policy: {json.dumps(policy)}, recommend the single best strategy that maximizes recovery while strictly obeying policy."
                
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                    config={
                        "response_mime_type": "application/json",
                        "response_schema": Recommendation,
                        "temperature": 0.1
                    }
                )
                return json.loads(response.text)
            except Exception as e:
                print(f"GenAI Recommendation failed, falling back: {e}")
                pass
                
        # DETERMINISTIC FALLBACK
        # Find the strategy named "Payment link" or just take the first low friction one
        best_strat = next((s for s in strategies if s.get("strategy") == "Payment link"), strategies[0])
        
        return {
            "recommended_strategy": best_strat.get("strategy"),
            "expected_recovery": best_strat.get("expected_recovery"),
            "reason": "Deterministic fallback selected a low friction approach due to missing AI context."
        }
