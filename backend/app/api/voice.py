from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import json
import asyncio
from app.services.voice_agent import voice_agent, VoiceAgent
from app.services.policy_guard import PolicyGuard
from app.logger import app_logger

router = APIRouter()

class IntentRequest(BaseModel):
    utterance: str = Field(..., example="Nanna card work aagthilla, naale pay madthini")
    session_id: Optional[str] = Field(None, example="call_session_9042")
    history: Optional[List[Dict[str, Any]]] = Field(None, description="Previous multi-turn conversation exchanges")
    demo_mode: Optional[bool] = Field(None, example=True)
    simulated_ist_hour: Optional[int] = Field(None, example=14)
    failure_code: Optional[str] = Field("E_504_GATEWAY_TIMEOUT", example="E_504_GATEWAY_TIMEOUT")

class VoiceTurnRequest(BaseModel):
    message: str = Field(..., example="I want to cancel this order")
    language: Optional[str] = Field("en-IN", example="en-IN")
    customer_name: Optional[str] = Field("Rajesh Kumar", example="Rajesh Kumar")
    order_id: Optional[str] = Field("RZP-8921", example="RZP-8921")
    sku: Optional[str] = Field("Apple AirPods Pro", example="Apple AirPods Pro")
    amount: Optional[float] = Field(4650.0, example=4650.0)
    history: Optional[List[Dict[str, Any]]] = Field(default=[], description="Previous multi-turn messages")
    demo_mode: Optional[bool] = Field(None, example=True)
    simulated_ist_hour: Optional[int] = Field(None, example=14)
    failure_code: Optional[str] = Field("E_504_GATEWAY_TIMEOUT", example="E_504_GATEWAY_TIMEOUT")

@router.post("/intent")
def extract_voice_intent(payload: IntentRequest):
    """
    Takes a transcribed voice string and conversation history
    and returns a structured JSON intent and dynamic spoken reply.
    """
    structured_intent = voice_agent.extract_intent(
        user_utterance=payload.utterance,
        history=payload.history,
        demo_mode=payload.demo_mode,
        simulated_ist_hour=payload.simulated_ist_hour,
        failure_code=payload.failure_code
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
        history=req.history,
        demo_mode=req.demo_mode,
        simulated_ist_hour=req.simulated_ist_hour,
        failure_code=req.failure_code
    )

@router.websocket("/ws/{session_id}")
async def voice_streaming_websocket(websocket: WebSocket, session_id: str):
    """
    Real-Time Bidirectional WebSocket Voice Gateway.
    Supports streaming transcript packets, sub-second latency, barge-in interruption signals,
    and real-time PolicyGuard gatekeeping.
    """
    await websocket.accept()
    app_logger.info(f"WebSocket Connected: Session {session_id}")
    
    session_history: List[Dict[str, Any]] = []
    
    try:
        # Send initial handshake ACK
        await websocket.send_json({
            "event": "SESSION_INITIALIZED",
            "session_id": session_id,
            "status": "READY",
            "policyguard_firewall": "ACTIVE",
            "latency_sla_ms": 400
        })

        while True:
            raw_data = await websocket.receive_text()
            data = json.loads(raw_data)
            event_type = data.get("event") or data.get("type", "USER_UTTERANCE")

            # 1. Handle Barge-in / Interruption Event
            if event_type == "BARGE_IN":
                await websocket.send_json({
                    "event": "AUDIO_STREAM_HALTED",
                    "reason": "CUSTOMER_INTERRUPT_DETECTED",
                    "status": "LISTENING"
                })
                continue

            # 2. Process Voice Utterance / Transcript Packet
            message = data.get("message") or data.get("text", "")
            if not message:
                continue

            # Acknowledge receipt
            await websocket.send_json({
                "event": "PROCESSING_TURN",
                "session_id": session_id
            })

            # Execute turn through VoiceAgent + PolicyGuard
            turn_result = VoiceAgent.process_turn(
                message=message,
                language=data.get("language", "en-IN"),
                customer_name=data.get("customer_name", "Rajesh Kumar"),
                order_id=data.get("order_id", "RZP-8921"),
                sku=data.get("sku", "Apple AirPods Pro"),
                amount=float(data.get("amount", 4650.0)),
                history=session_history,
                demo_mode=data.get("demo_mode", True),
                simulated_ist_hour=data.get("simulated_ist_hour"),
                failure_code=data.get("failure_code", "E_504_GATEWAY_TIMEOUT")
            )

            # Update session history
            session_history.append({"role": "user", "text": message})
            session_history.append({"role": "agent", "text": turn_result.get("reply_text", "")})

            # Emit streaming completion packet
            await websocket.send_json({
                "event": "AGENT_RESPONSE",
                "session_id": session_id,
                "data": turn_result
            })

    except WebSocketDisconnect:
        app_logger.info(f"WebSocket Disconnected: Session {session_id}")
    except Exception as e:
        app_logger.error(f"WebSocket Session Error: {e}")
        try:
            await websocket.send_json({"event": "ERROR", "message": str(e)})
        except:
            pass
