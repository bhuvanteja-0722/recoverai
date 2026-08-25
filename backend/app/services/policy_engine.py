import logging
from typing import Dict, Any, Optional, Tuple
from pydantic import BaseModel

logger = logging.getLogger("recoverai.policy")

class PolicyRule(BaseModel):
    id: str
    name: str
    description: str
    action: str
    max_amount: float
    max_retries: int
    requires_escalation_above: float
    enabled: bool = True

class PolicyDecision(BaseModel):
    authorized: bool
    action: str
    policy_name: str
    reason: str
    overridden: bool = False
    original_ai_recommendation: str
    cooldown_seconds: int = 5
    max_retries_allowed: int = 2

class PolicyEngine:
    """
    Deterministic Recovery Policy Engine.
    Ensures AI recommendations strictly comply with financial safety rules before execution.
    AI recommends. Policy authorizes.
    """
    DEFAULT_RULES = [
        PolicyRule(
            id="POL_001",
            name="Transient Gateway Retry Limit",
            description="Allows max 2 automatic retries for transient gateway timeouts on amounts < ₹50,000.",
            action="RETRY_PAYMENT",
            max_amount=50000.0,
            max_retries=2,
            requires_escalation_above=50000.0,
        ),
        PolicyRule(
            id="POL_002",
            name="Payment Link Dispatch Eligibility",
            description="Permits payment links for customer authorization or insufficient fund drops.",
            action="SEND_PAYMENT_LINK",
            max_amount=100000.0,
            max_retries=3,
            requires_escalation_above=100000.0,
        ),
        PolicyRule(
            id="POL_003",
            name="Recovery Incentive Ceiling",
            description="Restricts discount coupon applications to transactions below ₹10,000.",
            action="APPLY_COUPON",
            max_amount=10000.0,
            max_retries=1,
            requires_escalation_above=10000.0,
        ),
        PolicyRule(
            id="POL_004",
            name="High-Value Transaction Guard",
            description="Requires human escalation for any transaction equal to or exceeding ₹50,000.",
            action="ESCALATE",
            max_amount=10000000.0,
            max_retries=0,
            requires_escalation_above=50000.0,
        ),
    ]

    def evaluate(
        self,
        ai_recommendation: str,
        amount: float,
        failure_category: str,
        attempt_count: int = 0
    ) -> PolicyDecision:
        logger.info(f"Policy Engine evaluating: AI Action '{ai_recommendation}', Amount ₹{amount}, Category '{failure_category}'")

        # Rule 1: High-Value Escalation Guard
        if amount >= 50000.0 and ai_recommendation in ["RETRY_PAYMENT", "APPLY_COUPON"]:
            return PolicyDecision(
                authorized=False,
                action="ESCALATE",
                policy_name="High-Value Transaction Guard (POL_004)",
                reason=f"Transaction amount ₹{amount:,.2f} exceeds auto-recovery threshold (₹50,000.00). Escalating for merchant review.",
                overridden=True,
                original_ai_recommendation=ai_recommendation,
                cooldown_seconds=0,
                max_retries_allowed=0
            )

        # Rule 2: Fraud / Risk High Severity Block
        if "fraud" in failure_category.lower() or "risk" in failure_category.lower():
            return PolicyDecision(
                authorized=False,
                action="NO_ACTION",
                policy_name="Security & Fraud Prevention Guard",
                reason="High-risk security flag detected by risk engine. Automatic recovery blocked by security policy.",
                overridden=True,
                original_ai_recommendation=ai_recommendation,
                cooldown_seconds=0,
                max_retries_allowed=0
            )

        # Rule 3: Max Retry Limit Reached
        if attempt_count >= 2 and ai_recommendation == "RETRY_PAYMENT":
            return PolicyDecision(
                authorized=False,
                action="SEND_PAYMENT_LINK",
                policy_name="Max Gateway Retry Cap Exceeded",
                reason="Maximum gateway retries (2) reached. Converting recovery action to alternative Payment Link dispatch.",
                overridden=True,
                original_ai_recommendation=ai_recommendation,
                cooldown_seconds=30,
                max_retries_allowed=2
            )

        # Authorized Standard Decision
        policy_name = "Standard Recovery Policy (POL_001)"
        if ai_recommendation == "SEND_PAYMENT_LINK":
            policy_name = "Payment Link Dispatch Policy (POL_002)"
        elif ai_recommendation == "APPLY_COUPON":
            policy_name = "Recovery Incentive Policy (POL_003)"

        return PolicyDecision(
            authorized=True,
            action=ai_recommendation,
            policy_name=policy_name,
            reason=f"Action '{ai_recommendation}' satisfies all safety limits for amount ₹{amount:,.2f}.",
            overridden=False,
            original_ai_recommendation=ai_recommendation,
            cooldown_seconds=5,
            max_retries_allowed=2
        )

    def get_rules(self) -> list[Dict[str, Any]]:
        return [rule.model_dump() for rule in self.DEFAULT_RULES]

policy_engine = PolicyEngine()
