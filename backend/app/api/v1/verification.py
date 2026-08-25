from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.verification import (
    VerificationStatusResponse,
    VerificationActionRequest,
    VerificationActionResponse,
    VerificationHistoryResponse
)
from app.services.verification_service import verification_service

router = APIRouter(prefix="/verification", tags=["Verification"])

@router.get(
    "/",
    response_model=VerificationStatusResponse,
    summary="Get verification system status",
    description="Returns operational status of the verification service."
)
@router.get(
    "",
    response_model=VerificationStatusResponse,
    include_in_schema=False
)
async def get_verification_status():
    """
    CRITICAL ENDPOINT: Verifies operational state of RecoverAI verification service.
    """
    return VerificationStatusResponse(
        status="active",
        message="Verification service is operational",
        version="1.0.0"
    )

@router.post(
    "/action",
    response_model=VerificationActionResponse,
    summary="Verify outcome of a recovery action"
)
async def verify_action(req: VerificationActionRequest, db: Session = Depends(get_db)):
    try:
        record = verification_service.verify_action_outcome(
            db=db,
            transaction_id=req.transaction_id,
            action_executed=req.action_executed,
            parameters=req.parameters
        )
        return VerificationActionResponse(
            verification_id=record.id,
            transaction_id=record.transaction_id,
            action_executed=record.action_executed,
            verified=record.verified,
            status_summary=record.status_summary,
            attempts_made=record.attempts_made,
            evidence=record.evidence
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Verification execution error: {str(e)}"
        )

@router.get(
    "/history/{transaction_id}",
    response_model=VerificationHistoryResponse,
    summary="Get verification history for a transaction"
)
async def get_verification_history(transaction_id: str, db: Session = Depends(get_db)):
    records = verification_service.get_history(db=db, transaction_id=transaction_id)
    return VerificationHistoryResponse(
        records=[
            VerificationActionResponse(
                verification_id=r.id,
                transaction_id=r.transaction_id,
                action_executed=r.action_executed,
                verified=r.verified,
                status_summary=r.status_summary,
                attempts_made=r.attempts_made,
                evidence=r.evidence
            )
            for r in records
        ]
    )
