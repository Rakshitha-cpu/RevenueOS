from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, List
from app.services.recovery_agent import RecoveryIntelligenceAgent

router = APIRouter()
agent = RecoveryIntelligenceAgent()

class DiagnoseRequest(BaseModel):
    risk_profile: Dict[str, Any]
    customer: Dict[str, Any]

class StrategyRequest(BaseModel):
    risk_profile: Dict[str, Any]
    customer: Dict[str, Any]
    policy: Dict[str, Any]

class RecommendRequest(BaseModel):
    strategies: List[Dict[str, Any]]
    policy: Dict[str, Any]

@router.post("/diagnose")
def diagnose_risk(payload: DiagnoseRequest):
    diagnosis = agent.diagnose(payload.risk_profile, payload.customer)
    return {"diagnosis": diagnosis}

@router.post("/generate-strategies")
def generate_strategies(payload: StrategyRequest):
    strategies = agent.generate_strategies(payload.risk_profile, payload.customer, payload.policy)
    return {"strategies": strategies}

@router.post("/recommend")
def recommend_strategy(payload: RecommendRequest):
    recommendation = agent.recommend(payload.strategies, payload.policy)
    return recommendation
