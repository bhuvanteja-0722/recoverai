import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any

class EventStreamService:
    def __init__(self):
        self.events: List[Dict[str, Any]] = [
            {
                "id": "evt_101",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "event_type": "TRANSACTION_DETECTED",
                "transaction_id": "txn_prod_1001",
                "severity": "info",
                "details": {"gateway": "Razorpay - HDFC Direct", "amount": 4999.0}
            },
            {
                "id": "evt_102",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "event_type": "FAILURE_DETECTED",
                "transaction_id": "txn_prod_1001",
                "severity": "warning",
                "details": {"reason": "Gateway timeout during bank authorization"}
            },
            {
                "id": "evt_103",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "event_type": "AI_DIAGNOSIS_COMPLETED",
                "transaction_id": "txn_prod_1001",
                "severity": "info",
                "details": {"category": "technical", "recommendation": "RETRY_PAYMENT", "confidence": 0.91}
            },
            {
                "id": "evt_104",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "event_type": "POLICY_EVALUATED",
                "transaction_id": "txn_prod_1001",
                "severity": "info",
                "details": {"policy": "POL_001", "authorized": True}
            },
            {
                "id": "evt_105",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "event_type": "RECOVERY_INTERVENTION_EXECUTED",
                "transaction_id": "txn_prod_1001",
                "severity": "success",
                "details": {"action": "RETRY_PAYMENT", "status": "initiated"}
            },
            {
                "id": "evt_106",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "event_type": "VERIFICATION_COMPLETED",
                "transaction_id": "txn_prod_1001",
                "severity": "success",
                "details": {"verified": True, "evidence": "captured"}
            }
        ]

    def emit_event(self, event_type: str, transaction_id: str, severity: str, details: Dict[str, Any]):
        evt = {
            "id": f"evt_{uuid.uuid4().hex[:8]}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event_type": event_type,
            "transaction_id": transaction_id,
            "severity": severity,
            "details": details
        }
        self.events.insert(0, evt)
        if len(self.events) > 100:
            self.events.pop()
        return evt

    def get_recent_events(self, limit: int = 50) -> List[Dict[str, Any]]:
        return self.events[:limit]

event_service = EventStreamService()
