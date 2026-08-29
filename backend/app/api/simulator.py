from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.simulator import simulator_engine
from app.logger import app_logger

router = APIRouter()

class SimulatorRequest(BaseModel):
    risk_id: str
    strategies: List[Dict[str, Any]]

@router.post("/compare")
def compare_strategies(payload: SimulatorRequest):
    """
    Simulates the impact of different strategies and recommends the optimal one.
    """
    try:
        if not payload.strategies:
            raise ValueError("Strategies list cannot be empty.")
            
        result = simulator_engine.compare_strategies(payload.strategies)
        return result
    except ValueError as ve:
        app_logger.warning(f"Validation error in compare_strategies: {str(ve)}")
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        app_logger.error(f"Unexpected error in compare_strategies: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error during simulation")
