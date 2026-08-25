from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class VerificationStatusResponse(BaseModel):
    status: str = "active"
    message: str = "Verification service is operational"
    version: str = "1.0.0"

class VerificationActionRequest(BaseModel):
    transaction_id: str
    action_executed: str
    parameters: Optional[Dict[str, Any]] = None

class VerificationActionResponse(BaseModel):
    verification_id: str
    transaction_id: str
    action_executed: str
    verified: bool
    status_summary: str
    attempts_made: int
    evidence: Optional[Dict[str, Any]] = None

class VerificationHistoryResponse(BaseModel):
    records: list[VerificationActionResponse]
