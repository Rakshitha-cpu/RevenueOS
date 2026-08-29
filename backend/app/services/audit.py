import uuid
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.models import AuditLog
from app.logger import app_logger

class AuditLogger:
    """
    Phase 10: Audit & Analytics Engine.
    Logs every recommendation, policy check, and executed action.
    Persists to PostgreSQL using SQLAlchemy for enterprise data durability.
    """
    def __init__(self):
        self.in_memory_logs = []
        self._seed_initial_logs()
        
    def log_event(self, entity_type: str, entity_id: str, event_type: str, actor: str, description: str, metadata: Dict[str, Any] = None, db: Session = None) -> Dict[str, Any]:
        log_id = f"AL-{str(uuid.uuid4())[:8]}"
        created_at = datetime.utcnow()
        
        # 1. Prepare JSON log entry
        log_entry = {
            "id": log_id,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "event_type": event_type,
            "actor": actor,
            "description": description,
            "metadata": metadata or {},
            "created_at": created_at.isoformat()
        }
        
        # 2. Keep in-memory cache for fast UI fetching if needed
        self.in_memory_logs.append(log_entry)
        if len(self.in_memory_logs) > 500:
            self.in_memory_logs.pop(0)

        # 3. Persist to Database for Data Durability
        if db:
            try:
                db_log = AuditLog(
                    id=log_id,
                    entity_type=entity_type,
                    entity_id=entity_id,
                    event_type=event_type,
                    actor_type=actor, # Storing actor string here
                    actor_id="SYSTEM",
                    description=description,
                    metadata_json=metadata or {},
                    created_at=created_at
                )
                db.add(db_log)
                db.commit()
            except Exception as e:
                app_logger.error(f"Failed to persist audit log to DB: {str(e)}", exc_info=True)
                if db:
                    db.rollback()
            
        return log_entry

    def get_logs(self, db: Session = None, limit: int = 50) -> List[Dict[str, Any]]:
        # If DB session is provided, fetch from PostgreSQL
        if db:
            try:
                db_logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
                if db_logs:
                    return [
                        {
                            "id": log.id,
                            "entity_type": log.entity_type,
                            "entity_id": log.entity_id,
                            "event_type": log.event_type,
                            "actor": log.actor_type,
                            "description": log.description,
                            "metadata": log.metadata_json,
                            "created_at": log.created_at.isoformat()
                        }
                        for log in db_logs
                    ]
            except Exception as e:
                app_logger.error(f"Failed to fetch audit logs from DB: {str(e)}", exc_info=True)
                
        # Fallback to memory
        return sorted(self.in_memory_logs, key=lambda x: x["created_at"], reverse=True)[:limit]

    def _seed_initial_logs(self):
        # Pre-populate some logs so the dashboard isn't empty immediately
        self.log_event("Transaction", "TXN-8391", "RECOVERY_BLOCKED", "PolicyGuard", "Blocked AI refund recommendation.", {"reason": "Refund requires human approval"})
        self.log_event("Transaction", "TXN-1029", "RECOVERY_EXECUTED", "RazorpayAdapter", "Sent Payment Link to customer via SMS.", {"amount": 4999})
        self.log_event("Customer", "CUST-9921", "INTENT_EXTRACTED", "VoiceAgent", "Customer promised to pay tomorrow.", {"language": "Tamil"})

audit_logger = AuditLogger()
