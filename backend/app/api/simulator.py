from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.simulator import simulator_engine

router = APIRouter()

class SimulatorRequest(BaseModel):
    risk_id: str
    strategies: List[Dict[str, Any]]

@router.post("/compare")
def compare_strategies(payload: SimulatorRequest):
    """
    Simulates the impact of different strategies and recommends the optimal one.
    """
    result = simulator_engine.compare_strategies(payload.strategies)
    return result
