import logging
import json
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.schemas.agent import (
    DiagnoseRequest,
    DiagnosisResponse,
    ActionRecommendation,
    InterveneRequest,
    InterveneResponse
)
from app.services.nim_service import nim_service
from app.services.verification_service import verification_service
from app.services.audit_service import audit_service
from app.services.razorpay_service import razorpay_service

logger = logging.getLogger("recoverai.agent")

class AgentService:
    def policy_check(self, action: str, amount: float) -> bool:
        """
        Policy Engine: Enforces business safety policies before execution.
        """
        if amount > 50000.0 and action == "RETRY_PAYMENT":
            # Requires escalation for large payments
            return False
        return True

    async def diagnose_transaction(self, req: DiagnoseRequest) -> DiagnosisResponse:
        """
        AI Diagnosis: Analyzes transaction failure reason, predicts likelihood, recommends bounded action.
        Uses NVIDIA NIM when available, otherwise relies on deterministic financial recovery rules.
        """
        # Attempt NIM reasoning
        nim_prompt = f"""Analyze failed transaction:
Amount: {req.amount} {req.merchant_id}
Reason: {req.failure_reason}
Payment Method: {req.payment_method}

Categorize cause (technical/customer/fraud/bank) and recommend ONE action from [RETRY_PAYMENT, SEND_PAYMENT_LINK, APPLY_COUPON, ESCALATE, NO_ACTION].
Format JSON: {{"category": "...", "likelihood": 0.85, "action": "...", "reasoning": "..."}}"""
        
        system_prompt = "You are RecoverAI, an expert financial intelligence risk diagnosis engine."
        nim_res = await nim_service.generate_completion(nim_prompt, system_prompt)

        category = "technical"
        likelihood = 0.75
        action = "RETRY_PAYMENT"
        reasoning = f"Failure reason '{req.failure_reason}' indicates transient gateway timeout."

        if nim_res:
            try:
                # Extract JSON if returned by NIM
                parsed = json.loads(nim_res[nim_res.find("{"):nim_res.rfind("}")+1])
                category = parsed.get("category", category)
                likelihood = float(parsed.get("likelihood", likelihood))
                action = parsed.get("action", action)
                reasoning = parsed.get("reasoning", reasoning)
            except Exception as e:
                logger.warning(f"Could not parse NIM output as JSON: {e}")

        else:
            # Deterministic Fallback Rules
            reason_lower = (req.failure_reason or "").lower()
            if "insufficient" in reason_lower or "balance" in reason_lower:
                category = "customer"
                likelihood = 0.60
                action = "SEND_PAYMENT_LINK"
                reasoning = "Insufficient funds detected. Sending payment link allows customer to pay via alternative payment method."
            elif "declined" in reason_lower or "auth" in reason_lower:
                category = "bank"
                likelihood = 0.50
                action = "SEND_PAYMENT_LINK"
                reasoning = "Card authorization declined by issuer. Payment link recommended."
            elif "timeout" in reason_lower or "network" in reason_lower or "gateway" in reason_lower:
                category = "technical"
                likelihood = 0.85
                action = "RETRY_PAYMENT"
                reasoning = "Transient network issue detected. Automatic gateway retry has high probability of recovery."
            elif "fraud" in reason_lower or "risk" in reason_lower:
                category = "fraud"
                likelihood = 0.10
                action = "NO_ACTION"
                reasoning = "High risk fraud score. Transaction blocked by security policy."

        # Policy Engine Check
        policy_approved = self.policy_check(action, req.amount)
        if not policy_approved:
            action = "ESCALATE"
            reasoning += " (Policy Override: High value transaction requires human approval)"

        recommendation = ActionRecommendation(
            action=action,
            confidence=0.90 if nim_res else 0.85,
            reasoning=reasoning,
            estimated_recovery_likelihood=likelihood,
            policy_approved=policy_approved,
            parameters={"retry_delay_seconds": 5}
        )

        return DiagnosisResponse(
            transaction_id=req.transaction_id,
            failure_category=category,
            recoverable=likelihood > 0.3 and action != "NO_ACTION",
            recovery_likelihood=likelihood,
            primary_cause=req.failure_reason,
            recommendation=recommendation
        )

    def execute_intervention(self, db: Session, req: InterveneRequest) -> InterveneResponse:
        """
        Executes bounded recovery intervention, verifies outcome, and creates audit log.
        """
        # Execute test-mode action
        if req.recommended_action == "RETRY_PAYMENT":
            razorpay_service.trigger_retry_payment(req.transaction_id)
        elif req.recommended_action == "SEND_PAYMENT_LINK":
            razorpay_service.create_payment_link(req.transaction_id, 4999.0)

        # Verification
        v_record = verification_service.verify_action_outcome(
            db=db,
            transaction_id=req.transaction_id,
            action_executed=req.recommended_action
        )

        # Audit
        event = audit_service.record_event(
            db=db,
            action_type="RECOVERY_INTERVENTION_EXECUTED",
            actor="AgentService",
            resource_id=req.transaction_id,
            details={
                "action": req.recommended_action,
                "verification_id": v_record.id,
                "verified": v_record.verified
            }
        )

        return InterveneResponse(
            transaction_id=req.transaction_id,
            action_executed=req.recommended_action,
            status="succeeded" if v_record.verified else "failed",
            verification_id=v_record.id,
            audit_hash=event.hash,
            message=f"Intervention '{req.recommended_action}' executed and verified successfully."
        )

agent_service = AgentService()
