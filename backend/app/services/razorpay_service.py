import logging
from typing import Dict, Any
from app.config import settings

logger = logging.getLogger("recoverai.razorpay")

class RazorpayService:
    """
    Razorpay Test Mode Integration Service.
    Handles test payment status checks, link generations, and refund/retry operations safely.
    """
    def __init__(self):
        self.key_id = settings.RAZORPAY_KEY_ID
        self.key_secret = settings.RAZORPAY_KEY_SECRET
        self.is_configured = bool(self.key_id and self.key_secret)

    def fetch_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """Fetch payment status from Razorpay or simulate test status."""
        logger.info(f"Checking Razorpay status for {payment_id}")
        # In test-mode simulation
        return {
            "id": payment_id,
            "status": "failed" if payment_id.startswith("pay_fail") else "captured",
            "method": "card",
            "amount": 499900, # 4999.00 INR in paise
            "currency": "INR",
            "error_code": "BAD_REQUEST_ERROR" if payment_id.startswith("pay_fail") else None,
            "error_description": "Payment failed due to bank timeout" if payment_id.startswith("pay_fail") else None,
            "mode": "test"
        }

    def create_payment_link(self, transaction_id: str, amount: float, customer_email: str = "customer@example.com") -> Dict[str, Any]:
        """Generates a test-mode Razorpay Payment Link for recovered transactions."""
        link_id = f"plink_{transaction_id[:12]}"
        return {
            "id": link_id,
            "short_url": f"https://rzp.io/i/test_{link_id}",
            "amount": int(amount * 100),
            "status": "created",
            "transaction_id": transaction_id
        }

    def trigger_retry_payment(self, transaction_id: str) -> Dict[str, Any]:
        """Triggers a bounded payment retry in test mode."""
        return {
            "status": "initiated",
            "retry_id": f"retry_{transaction_id[:12]}",
            "message": "Payment retry initiated with network fallback route"
        }

razorpay_service = RazorpayService()
