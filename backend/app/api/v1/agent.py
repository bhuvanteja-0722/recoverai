from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.agent import (
    DiagnoseRequest,
    DiagnosisResponse,
    InterveneRequest,
    InterveneResponse
)
from app.services.agent_service import agent_service

router = APIRouter(prefix="/agent", tags=["AI Agent"])

@router.post(
    "/diagnose",
    response_model=DiagnosisResponse,
    summary="Diagnose a transaction failure using AI"
)
async def diagnose_transaction(req: DiagnoseRequest):
    try:
        return await agent_service.diagnose_transaction(req)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Agent diagnosis failed: {str(e)}"
        )

@router.post(
    "/recommend",
    response_model=DiagnosisResponse,
    summary="Get recovery recommendation"
)
async def recommend_action(req: DiagnoseRequest):
    return await agent_service.diagnose_transaction(req)

@router.post(
    "/intervene",
    response_model=InterveneResponse,
    summary="Execute bounded recovery action"
)
async def execute_intervention(req: InterveneRequest, db: Session = Depends(get_db)):
    try:
        return agent_service.execute_intervention(db=db, req=req)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Intervention execution failed: {str(e)}"
        )
