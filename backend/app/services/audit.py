import uuid
from datetime import datetime
from typing import Dict, Any, List

class AuditLogger:
    """
    Phase 10: Audit & Analytics Engine.
    Logs every recommendation, policy check, and executed action.
    For this hackathon MVP, we are storing recent logs in-memory for lightning-fast 
    dashboard retrieval, but this mirrors the exact schema of the AuditLog DB model.
    """
    def __init__(self):
        self.logs = []
        
        # Seed a few dummy logs for the dashboard
        self._seed_initial_logs()
        
    def log_event(self, entity_type: str, entity_id: str, event_type: str, actor: str, description: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        log_entry = {
            "id": f"AL-{str(uuid.uuid4())[:8]}",
            "entity_type": entity_type,
            "entity_id": entity_id,
            "event_type": event_type,
            "actor": actor,
            "description": description,
            "metadata": metadata or {},
            "created_at": datetime.utcnow().isoformat()
        }
        self.logs.append(log_entry)
        
        # Keep only the last 500 for memory safety
        if len(self.logs) > 500:
            self.logs.pop(0)
            
        return log_entry

    def get_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        # Return newest logs first
        return sorted(self.logs, key=lambda x: x["created_at"], reverse=True)[:limit]

    def _seed_initial_logs(self):
        # Pre-populate some logs so the dashboard isn't empty immediately
        self.log_event("Transaction", "TXN-8391", "RECOVERY_BLOCKED", "PolicyGuard", "Blocked AI refund recommendation.", {"reason": "Refund requires human approval"})
        self.log_event("Transaction", "TXN-1029", "RECOVERY_EXECUTED", "RazorpayAdapter", "Sent Payment Link to customer via SMS.", {"amount": 4999})
        self.log_event("Customer", "CUST-9921", "INTENT_EXTRACTED", "VoiceAgent", "Customer promised to pay tomorrow.", {"language": "Tamil"})

audit_logger = AuditLogger()
