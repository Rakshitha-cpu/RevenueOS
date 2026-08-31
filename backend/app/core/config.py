import os
from typing import Dict, Any

class ConfigManager:
    """
    Centralized configuration management for RevenueOS.
    Replaces hardcoded states with environment-aware dynamic defaults.
    """
    @staticmethod
    def get_initial_bank_downtimes() -> Dict[str, Dict[str, Any]]:
        return {
            "HDFC": {
                "status": os.getenv("HDFC_STATUS", "DOWNTIME"),
                "failure_rate": float(os.getenv("HDFC_FAIL_RATE", "0.85")),
                "alternative_rail": "UPI"
            },
            "SBI": {
                "status": os.getenv("SBI_STATUS", "DEGRADED"),
                "failure_rate": float(os.getenv("SBI_FAIL_RATE", "0.45")),
                "alternative_rail": "CARD"
            },
            "ICICI": {
                "status": os.getenv("ICICI_STATUS", "OPERATIONAL"),
                "failure_rate": float(os.getenv("ICICI_FAIL_RATE", "0.05")),
                "alternative_rail": "NETBANKING"
            }
        }

    @staticmethod
    def get_policy_thresholds() -> Dict[str, Any]:
        return {
            "max_risk_score": float(os.getenv("MAX_RISK_SCORE", "85.0")),
            "high_value_threshold": float(os.getenv("HIGH_VALUE_THRESHOLD", "25000.0")),
            "max_contact_retries": int(os.getenv("MAX_CONTACT_RETRIES", "2")),
            "idempotency_ttl_minutes": int(os.getenv("IDEMPOTENCY_TTL_MIN", "15"))
        }

config_manager = ConfigManager()