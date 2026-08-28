from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
from app.services.policy_engine import policy_guard

router = APIRouter()

class AuthorizationRequest(BaseModel):
    action: str
    amount: float
    customer: Dict[str, Any]
    policy_config: Dict[str, Any]
    risk_profile: Dict[str, Any]

@router.post("/check")
def check_authorization(payload: AuthorizationRequest):
    """
    Evaluates whether an AI-recommended action is permitted under merchant policy.
    """
    decision = policy_guard.evaluate_action(
        action=payload.action,
        amount=payload.amount,
        customer=payload.customer,
        policy_config=payload.policy_config,
        risk_profile=payload.risk_profile
    )
    return decision
