from fastapi import APIRouter
from datetime import datetime, timezone
from app.config import settings

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", summary="Get system health status")
@router.get("/", summary="Get system health status")
async def get_health():
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "services": {
            "database": "connected",
            "nim": "configured" if settings.NGC_API_KEY else "unconfigured_using_fallback",
            "razorpay": "test_mode"
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/detailed", summary="Get detailed health status")
async def get_detailed_health():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": "development" if settings.DEBUG else "production",
        "services": {
            "database": {"status": "ok", "url": "sqlite"},
            "nim": {"status": "ok" if settings.NGC_API_KEY else "fallback", "model": settings.NIM_MODEL},
            "razorpay": {"status": "ok", "mode": "test"}
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
