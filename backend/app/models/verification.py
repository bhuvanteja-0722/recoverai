from sqlalchemy import Column, String, DateTime, Boolean, JSON, Integer
from datetime import datetime, timezone
from app.database import Base

class VerificationRecord(Base):
    __tablename__ = "verification_records"

    id = Column(String, primary_key=True, index=True)
    transaction_id = Column(String, nullable=False, index=True)
    action_executed = Column(String, nullable=False)
    verified = Column(Boolean, default=False)
    attempts_made = Column(Integer, default=1)
    status_summary = Column(String, nullable=False)
    evidence = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
