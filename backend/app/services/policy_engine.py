from typing import Dict, Any

class PolicyGuard:
    """
    Deterministic firewall between the AI Agent and the Execution Engine.
    Evaluates merchant policies and risk thresholds to ensure the AI never
    goes rogue or executes unauthorized financial actions.
    """
    def __init__(self):
        pass
        
    def evaluate_action(self, action: str, amount: float, customer: Dict[str, Any], policy_config: Dict[str, Any], risk_profile: Dict[str, Any]) -> Dict[str, Any]:
        
        # 1. Check Fraud / Risk Score
        # If the transaction is highly suspicious, block it immediately
        risk_score = risk_profile.get("risk_score", 0)
        if risk_score > 85 and policy_config.get("fraud_block_enabled", True):
            return {
                "authorized": False, 
                "reason": f"BLOCKED: Risk score ({risk_score}) exceeds safe auto-execution limits.", 
                "requires_human": True
            }

        # 2. Check High-Value Threshold
        threshold = policy_config.get("high_value_threshold", 50000.0)
        if amount > threshold:
            return {
                "authorized": False, 
                "reason": f"ESCALATED: Amount (₹{amount}) exceeds high-value auto-recovery threshold (₹{threshold}).", 
                "requires_human": True
            }
            
        # 3. Check Action-Specific Permissions
        # e.g., AI is never allowed to issue direct refunds without human approval
        if action.lower() == "refund":
            return {
                "authorized": False, 
                "reason": "BLOCKED: Unrestricted refunds by AI are prohibited by policy.", 
                "requires_human": True
            }
            
        # 4. Check Customer Contact Limits (Stopping Rules)
        retry_count = customer.get("previous_retries", 0)
        max_retries = policy_config.get("max_retries", 3)
        if retry_count >= max_retries:
            return {
                "authorized": False, 
                "reason": f"STOPPED: Customer has reached maximum contact limit ({max_retries} retries).", 
                "requires_human": True
            }

        # Passed all deterministic checks!
        return {
            "authorized": True, 
            "reason": "APPROVED: Action complies with all merchant policies and risk thresholds.", 
            "requires_human": False
        }

policy_guard = PolicyGuard()
