from sqlalchemy import Column, String, DateTime, JSON
from datetime import datetime, timezone
from app.database import Base

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String, primary_key=True, index=True)
    action_type = Column(String, nullable=False, index=True)
    actor = Column(String, nullable=False)
    resource_id = Column(String, nullable=False, index=True)
    details = Column(JSON, nullable=True)
    hash = Column(String, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
