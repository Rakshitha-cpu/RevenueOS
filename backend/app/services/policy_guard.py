import os
from datetime import datetime
from zoneinfo import ZoneInfo
from typing import Dict, Any, List

class PolicyGuard:
    """
    Deterministic Financial Safety Firewall for RevenueOS.
    Enforces RBI, NPCI, TRAI DND, and DPDP regulations.
    """
    
    MAX_DISCOUNT_PERCENT: float = 5.0
    MAX_OUTBOUND_RETRIES: int = 3
    MIN_INTERVENTION_GAP_SECONDS: int = 300
    MAX_RECOVERY_WINDOW_HOURS: int = 24
    
    TRAI_DND_START_HOUR: int = 21  # 9:00 PM IST
    TRAI_DND_END_HOUR: int = 8     # 8:00 AM IST

    @classmethod
    def get_ist_datetime(cls) -> datetime:
        """Returns current datetime in Asia/Kolkata timezone using standard library zoneinfo."""
        return datetime.now(ZoneInfo("Asia/Kolkata"))

    @classmethod
    def evaluate_all(cls, tx: Dict[str, Any]) -> Dict[str, Any]:
        violations: List[str] = []
        rules_checked = 12
        
        # 1. Evaluate IST Time for TRAI DND (9 PM to 8 AM IST)
        # Allows explicitly passing simulated_ist_hour for testing boundary conditions
        current_ist_time = cls.get_ist_datetime()
        current_ist_hour = tx.get("simulated_ist_hour", current_ist_time.hour)
        is_demo = tx.get("demo_mode", False)
        
        if not is_demo:
            if current_ist_hour >= cls.TRAI_DND_START_HOUR or current_ist_hour < cls.TRAI_DND_END_HOUR:
                violations.append(f"RULE_1_TRAI_DND_VIOLATION: Automated outreach prohibited outside 8 AM - 9 PM IST (Evaluated IST Hour: {current_ist_hour}).")
            
        # 2. Rule 2: Fraud Risk Ceiling (>85)
        risk_score = tx.get("risk_score", 0.0)
        if risk_score > 85.0:
            violations.append(f"RULE_2_FRAUD_RISK_EXCEEDED: Transaction fraud score {risk_score} > 85 ceiling. Automated action halted.")
            
        # 3. Rule 3: Hard Retention Discount Cap (<=5%)
        discount = tx.get("discount_applied_percent", 0.0)
        if discount > cls.MAX_DISCOUNT_PERCENT:
            violations.append(f"RULE_3_DISCOUNT_CAP_EXCEEDED: Attempted discount {discount}% exceeds hard policy ceiling of {cls.MAX_DISCOUNT_PERCENT}%.")
            
        # 4. Rule 4: DPDP Act Explicit Opt-Out / DND Consent Revocation
        customer_opt_out = tx.get("customer_opt_out", False)
        if customer_opt_out:
            violations.append("RULE_4_DPDP_CONSENT_REVOKED: Customer revoked outreach consent. Mandated immediate halt with 0 further retries.")
            
        # 5. Rule 5: NPCI 2FA UPI MPIN Requirement
        if tx.get("action_type") == "DIRECT_DEBIT_WITHOUT_PIN":
            violations.append("RULE_5_NPCI_PIN_REQUIRED: Automated direct debit without UPI MPIN is strictly prohibited.")
            
        # 6. Rule 6: Maximum Retry Velocity
        retry_count = tx.get("retry_count", 0)
        if retry_count >= cls.MAX_OUTBOUND_RETRIES:
            violations.append("RULE_6_MAX_RETRIES_EXCEEDED: Maximum 3 outreach attempts reached for this session.")
            
        # 7. Rule 7: Minimum Inter-call Cooldown
        gap_sec = tx.get("seconds_since_last_contact", 9999)
        if gap_sec < cls.MIN_INTERVENTION_GAP_SECONDS:
            violations.append("RULE_7_COOLDOWN_ACTIVE: Minimum 5-minute cooldown required between customer calls.")
            
        # 8. Rule 8: Recovery Time Window
        elapsed_hours = tx.get("hours_since_failure", 0.5)
        if elapsed_hours > cls.MAX_RECOVERY_WINDOW_HOURS:
            violations.append("RULE_8_WINDOW_EXPIRED: Payment failed > 24 hours ago; inventory reservation released.")
            
        # 9. Rule 9: Bank Gateway Circuit Breaker
        if tx.get("bank_gateway_status") == "HARD_OUTAGE" and tx.get("retry_channel") == "SAME_CARD_GATEWAY":
            violations.append("RULE_9_CIRCUIT_BREAKER: Gateway hard down; rerouting to UPI rail mandatory.")
            
        # 10. Rule 10: Dynamic Surcharge Prohibition
        if tx.get("surcharge_added", 0.0) > 0.0:
            violations.append("RULE_10_RBI_SURCHARGE_VIOLATION: Surcharges on recovered payments prohibited.")
            
        # 11. Rule 11: Cross-Currency Compliance (FEMA)
        if tx.get("currency", "INR") != "INR" and not tx.get("fema_declared", False):
            violations.append("RULE_11_FEMA_COMPLIANCE: International currency requires explicit FEMA declaration.")
            
        # 12. Rule 12: Immutable Audit Logging
        audit_logged = tx.get("audit_hash_recorded", True)
        if not audit_logged:
            violations.append("RULE_12_AUDIT_LOG_MISSING: Decision must be recorded in SHA-256 ledger.")

        # Determine compliance outcome
        # If the only violation is Rule 4 (customer requested DND), it is a compliant SUPPRESSED stop
        is_dnd_stop = customer_opt_out and len(violations) == 1 and "RULE_4" in violations[0]
        is_passed = len(violations) == 0

        policy_status = "APPROVED" if is_passed else ("DND_SUPPRESSED" if is_dnd_stop else "HALTED")

        return {
            "passed": is_passed or is_dnd_stop,
            "policy_status": policy_status,
            "is_dnd_stop": is_dnd_stop,
            "rules_checked": rules_checked,
            "violations_count": len(violations),
            "violations": violations,
            "ist_hour": current_ist_hour,
            "demo_mode": is_demo,
            "timestamp": current_ist_time.isoformat()
        }

policy_guard = PolicyGuard()
