from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.verification import router as verification_router
from app.api.v1.audit import router as audit_router
from app.api.v1.evaluate import router as evaluate_router
from app.api.v1.agent import router as agent_router
from app.api.v1.tools import router as tools_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(health_router)
api_v1_router.include_router(verification_router)
api_v1_router.include_router(audit_router)
api_v1_router.include_router(evaluate_router)
api_v1_router.include_router(agent_router)
api_v1_router.include_router(tools_router)
