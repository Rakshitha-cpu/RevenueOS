from fastapi import APIRouter, Response, Query
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from app.services.telephony_gateway import telephony_gateway

router = APIRouter()

class OutboundCallRequest(BaseModel):
    phone_number: str = Field(..., example="+919845012345")
    customer_name: Optional[str] = Field("Rajesh Kumar", example="Rajesh Kumar")
    order_id: Optional[str] = Field("RZP-8921", example="RZP-8921")
    sku: Optional[str] = Field("Apple AirPods Pro", example="Apple AirPods Pro")
    amount: Optional[float] = Field(4650.0, example=4650.0)
    language: Optional[str] = Field("en-IN", example="en-IN")
    demo_mode: Optional[bool] = Field(False, example=True)
    simulated_ist_hour: Optional[int] = Field(None, example=14)
    failure_code: Optional[str] = Field("E_504_GATEWAY_TIMEOUT", example="E_504_GATEWAY_TIMEOUT")

@router.post("/dispatch-call")
def dispatch_recovery_call(payload: OutboundCallRequest):
    """
    Triggers an outbound PSTN telephony call via Twilio/Exotel
    guarded by PolicyGuard TRAI DND time-window verification.
    """
    result = telephony_gateway.dispatch_outbound_call(
        phone_number=payload.phone_number,
        customer_name=payload.customer_name,
        order_id=payload.order_id,
        sku=payload.sku,
        amount=payload.amount,
        language=payload.language,
        demo_mode=payload.demo_mode,
        simulated_ist_hour=payload.simulated_ist_hour,
        failure_code=payload.failure_code
    )
    return result

@router.get("/twiml", response_class=Response)
def get_twiml_endpoint(
    customer_name: str = Query("Rajesh Kumar"),
    order_id: str = Query("RZP-8921"),
    sku: str = Query("Apple AirPods Pro"),
    amount: float = Query(4650.0),
    language: str = Query("en-IN")
):
    """
    Returns valid XML TwiML for Twilio/Exotel voice browser and IVR trunks.
    """
    twiml_xml = telephony_gateway.build_twiml_script(
        customer_name=customer_name,
        order_id=order_id,
        sku=sku,
        amount=amount,
        language=language
    )
    return Response(content=twiml_xml, media_type="application/xml")

@router.post("/status-callback")
def telephony_status_callback(payload: Dict[str, Any]):
    """
    Receives carrier lifecycle callbacks (ringing, in-progress, completed, busy).
    """
    call_sid = payload.get("CallSid", payload.get("call_sid", "unknown"))
    status = payload.get("CallStatus", payload.get("status", "COMPLETED"))
    duration = int(payload.get("CallDuration", payload.get("duration", 0)))
    
    updated = telephony_gateway.update_call_status(call_sid, status, duration)
    return {"status": "ACK", "call": updated}
