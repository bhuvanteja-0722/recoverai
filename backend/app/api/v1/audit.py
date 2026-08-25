from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.audit import AuditStatsResponse, AuditEventSchema
from app.services.audit_service import audit_service

router = APIRouter(prefix="/audit", tags=["Audit"])

@router.get("/stats", response_model=AuditStatsResponse, summary="Get audit trail statistics")
async def get_audit_stats(db: Session = Depends(get_db)):
    stats = audit_service.get_stats(db)
    return AuditStatsResponse(
        total_events=stats["total_events"],
        by_action_type=stats["by_action_type"],
        recent_events=[AuditEventSchema.model_validate(e) for e in stats["recent_events"]]
    )

@router.get("/events", response_model=list[AuditEventSchema], summary="Get recent audit events")
async def get_audit_events(limit: int = 50, db: Session = Depends(get_db)):
    stats = audit_service.get_stats(db)
    return [AuditEventSchema.model_validate(e) for e in stats["recent_events"][:limit]]
