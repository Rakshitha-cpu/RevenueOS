from fastapi import APIRouter
from typing import Dict, Any, List
from pydantic import BaseModel
from app.services.audit import audit_logger

router = APIRouter()

class LogRequest(BaseModel):
    entity_type: str
    entity_id: str
    event_type: str
    actor: str
    description: str
    metadata: Dict[str, Any] = None

@router.post("/")
def create_audit_log(payload: LogRequest):
    """
    Creates a new immutable audit log entry.
    """
    log = audit_logger.log_event(
        entity_type=payload.entity_type,
        entity_id=payload.entity_id,
        event_type=payload.event_type,
        actor=payload.actor,
        description=payload.description,
        metadata=payload.metadata
    )
    return {"status": "success", "log_id": log["id"]}

@router.get("/")
def get_audit_logs(limit: int = 50):
    """
    Retrieves the most recent audit logs for the dashboard.
    """
    logs = audit_logger.get_logs(limit)
    return {"logs": logs}
