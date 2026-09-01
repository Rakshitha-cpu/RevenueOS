from fastapi import APIRouter
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from app.services.audit import audit_logger

router = APIRouter()

class LogRequest(BaseModel):
    entity_type: str = Field(..., example="TRANSACTION")
    entity_id: str = Field(..., example="RZP-8921")
    event_type: str = Field(..., example="POLICY_EVALUATION")
    actor: str = Field(..., example="PolicyGuard")
    description: str = Field(..., example="PolicyGuard: Verified 5% discount loyalty rule SAVE232")
    metadata: Optional[Dict[str, Any]] = Field(default={}, example={"amount": 4650, "risk_score": 38.5})

@router.post("/")
def create_audit_log(payload: LogRequest):
    """
    Creates a new immutable audit log entry chained cryptographically.
    """
    log = audit_logger.log_event(
        entity_type=payload.entity_type,
        entity_id=payload.entity_id,
        event_type=payload.event_type,
        actor=payload.actor,
        description=payload.description,
        metadata=payload.metadata
    )
    return {"status": "success", "log_id": log["id"], "sha256_hash": log["sha256_hash"]}

@router.get("/")
def get_audit_logs(limit: int = 50):
    """
    Retrieves the most recent cryptographically chained audit logs for compliance audits.
    """
    logs = audit_logger.get_logs(limit)
    return {
        "count": len(logs),
        "logs": logs
    }

@router.get("/verify")
def verify_audit_ledger():
    """
    Performs full mathematical cryptographic SHA-256 verification
    across the entire block ledger to prove zero tampering.
    """
    verification = audit_logger.verify_chain_integrity()
    return verification
