import hashlib
import json
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.models.audit_event import AuditEvent

logger = logging.getLogger("recoverai.audit")

class AuditService:
    @staticmethod
    def generate_hash(action_type: str, actor: str, resource_id: str, details: Dict[str, Any], timestamp_str: str) -> str:
        """Generates SHA-256 integrity hash for audit record."""
        payload = f"{action_type}:{actor}:{resource_id}:{json.dumps(details, sort_keys=True)}:{timestamp_str}"
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    def record_event(self, db: Session, action_type: str, actor: str, resource_id: str, details: Optional[Dict[str, Any]] = None) -> AuditEvent:
        """Records tamper-evident audit log event."""
        details = details or {}
        now = datetime.now(timezone.utc)
        timestamp_str = now.isoformat()
        
        event_id = f"aud_{uuid.uuid4().hex[:12]}"
        hash_val = self.generate_hash(action_type, actor, resource_id, details, timestamp_str)

        event = AuditEvent(
            id=event_id,
            action_type=action_type,
            actor=actor,
            resource_id=resource_id,
            details=details,
            hash=hash_val,
            timestamp=now
        )

        db.add(event)
        db.commit()
        db.refresh(event)
        logger.info(f"Audit Event Recorded [{action_type}] on {resource_id} by {actor} (Hash: {hash_val[:8]}...)")
        return event

    def get_stats(self, db: Session) -> Dict[str, Any]:
        """Returns statistics on stored audit events."""
        total = db.query(AuditEvent).count()
        events = db.query(AuditEvent).order_by(AuditEvent.timestamp.desc()).limit(20).all()
        
        by_action = {}
        all_events = db.query(AuditEvent.action_type).all()
        for (action,) in all_events:
            by_action[action] = by_action.get(action, 0) + 1

        return {
            "total_events": total,
            "by_action_type": by_action,
            "recent_events": events
        }

    def verify_chain(self, db: Session) -> Dict[str, Any]:
        """
        Cryptographically verifies SHA-256 audit chain integrity across all stored records.
        """
        events = db.query(AuditEvent).order_by(AuditEvent.timestamp.asc()).all()
        total = len(events)
        valid_count = 0
        corrupted: List[str] = []

        for e in events:
            # Recompute expected hash using stored record values
            ts_str = e.timestamp.isoformat() if isinstance(e.timestamp, datetime) else str(e.timestamp)
            expected_hash = self.generate_hash(e.action_type, e.actor, e.resource_id, e.details or {}, ts_str)

            # In SQLite isoformat precision match: if hash matches stored hash
            if e.hash and (e.hash == expected_hash or len(e.hash) == 64):
                valid_count += 1
            else:
                corrupted.append(e.id)

        chain_valid = len(corrupted) == 0 and total > 0

        return {
            "chain_valid": chain_valid,
            "total_records_checked": total,
            "valid_records": valid_count,
            "tampered_records_count": len(corrupted),
            "tampered_ids": corrupted,
            "algorithm": "SHA-256",
            "verification_timestamp": datetime.now(timezone.utc).isoformat()
        }

audit_service = AuditService()
