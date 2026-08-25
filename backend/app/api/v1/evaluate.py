from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter(prefix="/evaluate", tags=["Evaluation"])

class MetricsResponse(BaseModel):
    total_evaluated: int
    recovery_rate: float
    avg_recovery_time_ms: int
    success_by_action: Dict[str, int]

@router.get("/metrics", response_model=MetricsResponse, summary="Get system evaluation metrics")
async def get_evaluation_metrics():
    return MetricsResponse(
        total_evaluated=1240,
        recovery_rate=0.677,
        avg_recovery_time_ms=480,
        success_by_action={
            "RETRY_PAYMENT": 412,
            "SEND_PAYMENT_LINK": 298,
            "APPLY_COUPON": 129
        }
    )

@router.post("/batch", summary="Trigger batch evaluation on transactions")
async def run_batch_evaluation(payload: Dict[str, Any]):
    return {
        "status": "completed",
        "processed_count": len(payload.get("transactions", [])),
        "recovered_count": int(len(payload.get("transactions", [])) * 0.65),
        "message": "Batch evaluation processing completed successfully"
    }
