from pydantic import BaseModel, Field, constr
from typing import Dict, Any, List, Optional

class TransactionPayload(BaseModel):
    id: str = Field(..., description="Unique Transaction ID (e.g. txn_101)")
    amount: float = Field(..., gt=0, le=1000000, description="Amount in INR, strictly positive")
    payment_method: str = Field(..., description="Payment method: UPI, card, netbanking")
    failure_reason: str = Field(..., description="Error code e.g. E_504_TIMEOUT, E_CARD_LIMIT")
    retry_count: int = Field(default=0, ge=0, le=10, description="Retry attempt count")

class CustomerProfilePayload(BaseModel):
    id: str = Field(..., description="Customer UUID or ID")
    name: Optional[str] = Field(default=None, max_length=100)
    phone: Optional[str] = Field(default=None, pattern=r"^\+?[0-9]{10,14}$", description="E.164 phone format")
    email: Optional[str] = Field(default=None, max_length=150)
    lifetime_value: float = Field(default=0.0, ge=0.0)
    is_dnd_registered: bool = Field(default=False)
    risk_score: float = Field(default=15.0, ge=0.0, le=100.0, description="Fraud score from 0 to 100")

class RiskAnalyzeRequest(BaseModel):
    transaction: TransactionPayload
    customer: CustomerProfilePayload

class RiskAnalyzeResponse(BaseModel):
    risk_type: str
    risk_score: float = Field(..., ge=0.0, le=100.0)
    loss_probability: float = Field(..., ge=0.0, le=1.0)
    amount_at_risk: float = Field(..., ge=0.0)
    recoverability_score: float = Field(..., ge=0.0, le=1.0)
    reason_codes: List[str]

class InstantRefundRequest(BaseModel):
    payment_id: str = Field(..., pattern=r"^pay_[a-zA-Z0-9]+$", description="Razorpay payment ID format")
    amount: float = Field(..., gt=0, le=500000, description="Refund amount in INR")
    customer_vpa: str = Field(..., pattern=r"^[\w\.\-]+@[\w\-]+$", description="Valid UPI VPA format")
    reason: str = Field(default="DOUBLE_DEBIT_GATEWAY_TIMEOUT", max_length=100)

class StoreCreditBoostRequest(BaseModel):
    amount: float = Field(..., gt=0, le=500000)
    bonus_percentage: float = Field(default=0.05, ge=0.0, le=0.50, description="Bonus credit boost (default 5%)")