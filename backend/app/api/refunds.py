from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app.services.refund_engine import refund_engine

router = APIRouter()

class InstantRefundRequest(BaseModel):
    payment_id: str = Field(..., example="pay_NX48291048")
    amount: float = Field(..., gt=0, example=4650.0)
    customer_vpa: str = Field("customer@okaxis", example="rajesh@okhdfcbank")
    reason: str = Field("GATEWAY_TIMEOUT_DEBIT", example="DOUBLE_DEBIT_TIMEOUT")

class StoreCreditRequest(BaseModel):
    amount: float = Field(..., gt=0, example=4650.0)
    bonus_percentage: Optional[float] = Field(0.05, example=0.05)

@router.post("/instant")
def issue_instant_refund(payload: InstantRefundRequest):
    """
    Triggers a T+0 instant refund through Razorpay Instant Refund rails (< 3s).
    """
    result = refund_engine.process_instant_refund(
        payment_id=payload.payment_id,
        amount=payload.amount,
        customer_vpa=payload.customer_vpa,
        reason=payload.reason
    )
    return {
        "success": True,
        "refund": result
    }

@router.post("/store-credit-boost")
def issue_store_credit_uplift(payload: StoreCreditRequest):
    """
    Calculates instant 5% goodwill store credit voucher as an alternative to bank refund.
    """
    result = refund_engine.offer_store_credit_uplift(
        amount=payload.amount,
        bonus_pct=payload.bonus_percentage or 0.05
    )
    return {
        "success": True,
        "store_credit": result
    }

@router.get("/track/{utr_number}")
def track_refund_utr(utr_number: str):
    """
    Tracks live lifecycle of an NPCI UTR number for transparency.
    """
    result = refund_engine.track_utr_lifecycle(utr_number)
    return {
        "success": True,
        "tracking": result
    }
