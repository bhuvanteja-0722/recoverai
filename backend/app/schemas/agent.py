from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class DiagnoseRequest(BaseModel):
    transaction_id: str
    merchant_id: str
    amount: float
    failure_reason: str
    payment_method: Optional[str] = None
    customer_history: Optional[Dict[str, Any]] = None

class ActionRecommendation(BaseModel):
    action: str  # RETRY_PAYMENT, SEND_PAYMENT_LINK, APPLY_COUPON, ESCALATE, NO_ACTION
    confidence: float
    reasoning: str
    estimated_recovery_likelihood: float
    policy_approved: bool = True
    parameters: Optional[Dict[str, Any]] = None

class DiagnosisResponse(BaseModel):
    transaction_id: str
    failure_category: str
    recoverable: bool
    recovery_likelihood: float
    primary_cause: str
    recommendation: ActionRecommendation

class InterveneRequest(BaseModel):
    transaction_id: str
    recommended_action: str
    force_execution: bool = False

class InterveneResponse(BaseModel):
    transaction_id: str
    action_executed: str
    status: str  # succeeded, failed, pending
    verification_id: Optional[str] = None
    audit_hash: Optional[str] = None
    message: str
