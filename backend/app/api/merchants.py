from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime

router = APIRouter()

# In-Memory Multi-Tenant Merchant Registry
MERCHANT_DB: Dict[str, Dict[str, Any]] = {
    "merchant_default": {
        "merchant_id": "merchant_default",
        "name": "Tata CliQ Luxury / Apple Authorised",
        "currency": "INR",
        "timezone": "Asia/Kolkata",
        "max_discount_percent": 5.0,
        "loyalty_code": "SAVE232",
        "high_value_threshold": 50000.0,
        "trai_dnd_enforced": True,
        "dnd_start_hour": 21,
        "dnd_end_hour": 8,
        "webhook_url": "https://revenue-os-6cw6.vercel.app/api/webhooks/razorpay",
        "created_at": "2026-08-30T10:00:00Z"
    }
}

class MerchantConfigUpdate(BaseModel):
    name: Optional[str] = Field(None, example="Myntra Fashion")
    max_discount_percent: Optional[float] = Field(None, example=5.0)
    loyalty_code: Optional[str] = Field(None, example="SAVE232")
    high_value_threshold: Optional[float] = Field(None, example=25000.0)
    trai_dnd_enforced: Optional[bool] = Field(None, example=True)
    webhook_url: Optional[str] = Field(None, example="https://merchant.com/webhooks/revenueos")

@router.get("/")
def list_merchants():
    """
    Lists all configured tenant merchants.
    """
    return {
        "count": len(MERCHANT_DB),
        "merchants": list(MERCHANT_DB.values())
    }

@router.get("/{merchant_id}")
def get_merchant_config(merchant_id: str):
    """
    Retrieves dynamic policy & compliance configuration for a specific merchant.
    """
    config = MERCHANT_DB.get(merchant_id)
    if not config:
        config = MERCHANT_DB["merchant_default"]
    return config

@router.put("/{merchant_id}")
def update_merchant_config(merchant_id: str, payload: MerchantConfigUpdate):
    """
    Dynamically updates policy thresholds (e.g. discount cap, DND enforcement) for a merchant tenant.
    """
    if merchant_id not in MERCHANT_DB:
        MERCHANT_DB[merchant_id] = {
            "merchant_id": merchant_id,
            "name": payload.name or f"Merchant {merchant_id}",
            "currency": "INR",
            "timezone": "Asia/Kolkata",
            "max_discount_percent": 5.0,
            "loyalty_code": "SAVE232",
            "high_value_threshold": 50000.0,
            "trai_dnd_enforced": True,
            "dnd_start_hour": 21,
            "dnd_end_hour": 8,
            "webhook_url": "",
            "created_at": datetime.utcnow().isoformat()
        }

    merchant = MERCHANT_DB[merchant_id]
    if payload.name is not None: merchant["name"] = payload.name
    if payload.max_discount_percent is not None: merchant["max_discount_percent"] = payload.max_discount_percent
    if payload.loyalty_code is not None: merchant["loyalty_code"] = payload.loyalty_code
    if payload.high_value_threshold is not None: merchant["high_value_threshold"] = payload.high_value_threshold
    if payload.trai_dnd_enforced is not None: merchant["trai_dnd_enforced"] = payload.trai_dnd_enforced
    if payload.webhook_url is not None: merchant["webhook_url"] = payload.webhook_url

    return {
        "status": "UPDATED",
        "merchant_config": merchant
    }
