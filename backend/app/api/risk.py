from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, List
from app.services.risk_engine import analyze_transaction_risk

router = APIRouter()

class RiskAnalyzeRequest(BaseModel):
    transaction: Dict[str, Any]
    customer: Dict[str, Any]

class RiskAnalyzeResponse(BaseModel):
    risk_type: str
    risk_score: float
    loss_probability: float
    amount_at_risk: float
    recoverability_score: float
    reason_codes: List[str]

@router.post("/analyze", response_model=RiskAnalyzeResponse)
def analyze_risk(payload: RiskAnalyzeRequest):
    """
    Analyzes a single transaction and customer profile to predict revenue risk.
    """
    risk_profile = analyze_transaction_risk(payload.transaction, payload.customer)
    return risk_profile

@router.post("/batch-analyze")
def batch_analyze_risk():
    """
    Placeholder for batch analysis of existing transactions.
    """
    return {
        "events_analyzed": 10000,
        "high_risk": 2341,
        "amount_at_risk": 2540000
    }
