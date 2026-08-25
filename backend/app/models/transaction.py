from sqlalchemy import Column, String, Float, Integer, DateTime
from datetime import datetime, timezone
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True)
    merchant_id = Column(String, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    status = Column(String, default="failed", index=True)  # failed, pending, recovered, at_risk
    failure_reason = Column(String, nullable=True)
    payment_method = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    recovery_attempts = Column(Integer, default=0)
    recovery_action = Column(String, nullable=True)
    recovery_status = Column(String, default="none")  # none, attempted, succeeded, failed
