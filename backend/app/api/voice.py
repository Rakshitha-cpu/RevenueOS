from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from app.services.voice_agent import voice_agent, VoiceAgent
from app.services.policy_guard import PolicyGuard

router = APIRouter()

class IntentRequest(BaseModel):
    utterance: str = Field(..., example="Nanna card work aagthilla, naale pay madthini")
    session_id: Optional[str] = Field(None, example="call_session_9042")
    history: Optional[List[Dict[str, Any]]] = Field(None, description="Previous multi-turn conversation exchanges")

class VoiceTurnRequest(BaseModel):
    message: str = Field(..., example="I want to cancel this order")
    language: Optional[str] = Field("en-IN", example="en-IN")
    customer_name: Optional[str] = Field("Rajesh Kumar", example="Rajesh Kumar")
    order_id: Optional[str] = Field("RZP-8921", example="RZP-8921")
    sku: Optional[str] = Field("Apple AirPods Pro", example="Apple AirPods Pro")
    amount: Optional[float] = Field(4650.0, example=4650.0)
    history: Optional[List[Dict[str, Any]]] = Field(default=[], description="Previous multi-turn messages")

@router.post("/intent")
def extract_voice_intent(payload: IntentRequest):
    """
    Takes a transcribed voice string and conversation history
    and returns a structured JSON intent and dynamic spoken reply.
    """
    structured_intent = voice_agent.extract_intent(
        user_utterance=payload.utterance,
        history=payload.history
    )
    return {
        "session_id": payload.session_id,
        "original_utterance": payload.utterance,
        "extracted_data": structured_intent
    }

@router.post("/turn")
def voice_agent_turn(req: VoiceTurnRequest):
    """
    Primary endpoint for multi-turn voice recovery agent.
    Executes conversational intelligence + PolicyGuard gatekeeper check.
    """
    return VoiceAgent.process_turn(
        message=req.message,
        language=req.language,
        customer_name=req.customer_name,
        order_id=req.order_id,
        sku=req.sku,
        amount=req.amount,
        history=req.history
    )
