from fastapi import APIRouter
from app.api.routers.auth_router import router as auth_router
from app.api.routers.users_router import router as users_router
from app.api.routers.members_router import router as members_router
from app.api.routers.evaluations_router import router as evaluations_router
from app.api.routers.leaderboard_router import router as leaderboard_router
from app.api.routers.admin_router import router as admin_router
from app.api.routers.ai_router import router as ai_router

# Master router that aggregates all routers
api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(members_router)
api_router.include_router(evaluations_router)
api_router.include_router(leaderboard_router)
api_router.include_router(admin_router)
api_router.include_router(ai_router)
