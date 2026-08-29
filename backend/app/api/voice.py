from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from app.services.voice_agent import voice_agent

router = APIRouter()

class IntentRequest(BaseModel):
    utterance: str = Field(..., example="Nanna card work aagthilla, naale pay madthini")
    session_id: Optional[str] = Field(None, example="call_session_9042")
    history: Optional[List[Dict[str, Any]]] = Field(None, description="Previous multi-turn conversation exchanges")

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
