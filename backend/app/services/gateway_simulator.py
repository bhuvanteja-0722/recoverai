import random
import logging
from typing import Dict, Any

logger = logging.getLogger("recoverai.simulator")

class GatewaySimulator:
    """
    Deterministic Payment Gateway Simulator.
    Simulates payment failure conditions, gateway responses, and outcome assertions for reproducible demos.
    """

    SCENARIOS = {
        "GATEWAY_TIMEOUT": {
            "name": "Gateway Timeout",
            "description": "Transient 504 Gateway Timeout during HDFC/Razorpay card authorization.",
            "amount": 4999.0,
            "failure_reason": "Gateway timeout during bank authorization",
            "payment_method": "card",
            "gateway": "Razorpay - HDFC Direct",
            "expected_ai_action": "RETRY_PAYMENT",
            "simulated_recovery_result": "captured",
        },
        "BANK_UNAVAILABLE": {
            "name": "Bank Host Offline",
            "description": "Core banking server offline (UPI NPCI response code 91).",
            "amount": 2490.0,
            "failure_reason": "UPI Issuer Bank Server Unavailable (NPCI 91)",
            "payment_method": "upi",
            "gateway": "Razorpay - ICICI UPI",
            "expected_ai_action": "SEND_PAYMENT_LINK",
            "simulated_recovery_result": "captured",
        },
        "INSUFFICIENT_FUNDS": {
            "name": "Insufficient Balance",
            "description": "Customer account balance low at time of subscription charge.",
            "amount": 1299.0,
            "failure_reason": "Insufficient balance in account",
            "payment_method": "upi",
            "gateway": "Razorpay - SBI",
            "expected_ai_action": "SEND_PAYMENT_LINK",
            "simulated_recovery_result": "captured",
        },
        "AUTHENTICATION_FAILURE": {
            "name": "3DS Authentication Timeout",
            "description": "Customer failed to complete 2FA OTP verification step within 120s.",
            "amount": 8950.0,
            "failure_reason": "3DS OTP verification timeout",
            "payment_method": "card",
            "gateway": "Razorpay - Axis Bank",
            "expected_ai_action": "SEND_PAYMENT_LINK",
            "simulated_recovery_result": "captured",
        },
        "HIGH_VALUE_ESCALATION": {
            "name": "High Value Transaction (>₹50k)",
            "description": "Enterprise charge of ₹75,000 failed due to limit check. Policy requires escalation.",
            "amount": 75000.0,
            "failure_reason": "Merchant transaction velocity limit exceeded",
            "payment_method": "netbanking",
            "gateway": "Razorpay - Corporate",
            "expected_ai_action": "RETRY_PAYMENT",
            "simulated_recovery_result": "escalated",
        },
        "FRAUD_RISK_BLOCK": {
            "name": "High Fraud Score Block",
            "description": "Risk engine flagged IP velocity. Automatic recovery blocked by policy.",
            "amount": 15000.0,
            "failure_reason": "Risk Engine Flag: High velocity carding pattern detected",
            "payment_method": "card",
            "gateway": "Razorpay - Risk Shield",
            "expected_ai_action": "NO_ACTION",
            "simulated_recovery_result": "blocked",
        },
    }

    def get_scenarios(self) -> Dict[str, Dict[str, Any]]:
        return self.SCENARIOS

    def run_scenario(self, scenario_key: str) -> Dict[str, Any]:
        scenario = self.SCENARIOS.get(scenario_key, self.SCENARIOS["GATEWAY_TIMEOUT"])
        txn_id = f"txn_sim_{scenario_key.lower()[:8]}_{random.randint(100, 999)}"
        
        return {
            "transaction_id": txn_id,
            "scenario": scenario["name"],
            "merchant_id": "merch_razorpay_demo",
            "amount": scenario["amount"],
            "failure_reason": scenario["failure_reason"],
            "payment_method": scenario["payment_method"],
            "gateway": scenario["gateway"],
            "simulated_recovery_result": scenario["simulated_recovery_result"]
        }

gateway_simulator = GatewaySimulator()
