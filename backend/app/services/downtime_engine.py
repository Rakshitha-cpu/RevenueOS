from typing import Dict, Any, List
from datetime import datetime

class BankDowntimeEngine:
    """
    Phase 11: Real-time Bank Network Downtime Intelligence.
    Tracks active banking network outages (e.g. HDFC, SBI, ICICI)
    and automatically reroutes recovery strategies to alternate payment rails (UPI / Cards).
    """
    
    def __init__(self):
        # In-memory registry of active downtimes
        self.active_downtimes: Dict[str, Dict[str, Any]] = {
            "HDFC": {
                "bank": "HDFC Bank",
                "instrument": "netbanking",
                "severity": "HIGH",
                "started_at": datetime.utcnow().isoformat(),
                "status": "ACTIVE"
            }
        }

    def record_downtime(self, bank_code: str, instrument: str, severity: str = "HIGH") -> Dict[str, Any]:
        """Records a new bank outage event from Razorpay webhooks."""
        event = {
            "bank": bank_code.upper(),
            "instrument": instrument,
            "severity": severity,
            "started_at": datetime.utcnow().isoformat(),
            "status": "ACTIVE"
        }
        self.active_downtimes[bank_code.upper()] = event
        return event

    def resolve_downtime(self, bank_code: str) -> bool:
        """Resolves a bank outage event."""
        if bank_code.upper() in self.active_downtimes:
            del self.active_downtimes[bank_code.upper()]
            return True
        return False

    def is_bank_down(self, bank_code: str) -> bool:
        """Checks if a specific bank or method is experiencing downtime."""
        return bank_code.upper() in self.active_downtimes

    def get_rerouted_strategy(self, failed_bank: str, original_method: str) -> Dict[str, Any]:
        """
        Calculates the optimal rerouted payment channel if the original bank is down.
        """
        bank_down = self.is_bank_down(failed_bank)
        if not bank_down:
            return {
                "reroute_needed": False,
                "recommended_rail": original_method,
                "reason": "Bank network operating normally."
            }

        return {
            "reroute_needed": True,
            "affected_bank": failed_bank.upper(),
            "recommended_rail": "UPI_INTENT",
            "alternative_methods": ["UPI_AUTOPAY", "CARDS_FALLBACK", "NETBANKING_ICICI"],
            "reason": f"{failed_bank.upper()} network outage detected. Auto-rerouting to UPI Intent to prevent retry failure."
        }

    def get_all_active_downtimes(self) -> List[Dict[str, Any]]:
        """Returns list of all current bank outages."""
        return list(self.active_downtimes.values())

downtime_engine = BankDowntimeEngine()
