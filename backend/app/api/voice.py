from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
from app.services.voice_agent import voice_agent

router = APIRouter()

class IntentRequest(BaseModel):
    utterance: str
    session_id: str = None

@router.post("/intent")
def extract_voice_intent(payload: IntentRequest):
    """
    Takes a transcribed voice string (in EN, HI, KN, TA, TE, or ML) 
    and returns a structured JSON intent.
    """
    structured_intent = voice_agent.extract_intent(payload.utterance)
    return {
        "session_id": payload.session_id,
        "original_utterance": payload.utterance,
        "extracted_data": structured_intent
    }
