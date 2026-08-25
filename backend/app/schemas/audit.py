from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime

class AuditEventSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    action_type: str
    actor: str
    resource_id: str
    details: Optional[Dict[str, Any]] = None
    hash: str
    timestamp: datetime

class AuditStatsResponse(BaseModel):
    total_events: int
    by_action_type: Dict[str, int]
    recent_events: List[AuditEventSchema]
