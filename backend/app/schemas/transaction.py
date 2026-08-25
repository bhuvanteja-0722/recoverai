from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class TransactionBase(BaseModel):
    id: str
    merchant_id: str
    amount: float
    currency: str = "INR"
    status: str = "failed"
    failure_reason: Optional[str] = None
    payment_method: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    model_config = ConfigDict(from_attributes=True)

    created_at: datetime
    updated_at: datetime
    recovery_attempts: int = 0
    recovery_action: Optional[str] = None
    recovery_status: str = "none"
