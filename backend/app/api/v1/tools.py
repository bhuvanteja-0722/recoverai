from fastapi import APIRouter, Depends, Header, HTTPException, status
from typing import Optional, List, Dict, Any
from app.config import settings
from app.services.razorpay_service import razorpay_service

router = APIRouter(prefix="/tools", tags=["Recovery Tools"])

def verify_api_key(x_api_key: Optional[str] = Header(None)):
    """API Key protection for privileged tool endpoints."""
    if settings.DEBUG:
        return True
    if x_api_key != settings.INTERNAL_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-API-Key header"
        )
    return True

@router.get("/list", summary="List available recovery tools")
async def list_tools():
    return [
        {
            "name": "RETRY_PAYMENT",
            "description": "Trigger network-layer payment retry via Razorpay gateway",
            "parameters": ["transaction_id"],
            "risk_level": "low"
        },
        {
            "name": "SEND_PAYMENT_LINK",
            "description": "Generate and dispatch SMS/Email Razorpay Payment Link",
            "parameters": ["transaction_id", "customer_email"],
            "risk_level": "low"
        },
        {
            "name": "APPLY_COUPON",
            "description": "Apply targeted recovery discount code to incentivize checkout completion",
            "parameters": ["transaction_id", "discount_percentage"],
            "risk_level": "medium"
        },
        {
            "name": "ESCALATE",
            "description": "Flag transaction for merchant support team review",
            "parameters": ["transaction_id", "reason"],
            "risk_level": "low"
        }
    ]

@router.get("/payment-status/{payment_id}", summary="Check payment status from Razorpay")
async def check_payment_status(payment_id: str, _: bool = Depends(verify_api_key)):
    return razorpay_service.fetch_payment_status(payment_id)
