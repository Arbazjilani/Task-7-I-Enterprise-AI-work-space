from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.config import settings
from app.database import Base, SessionLocal, engine
import app.models  # noqa: F401
from app.services.user_service import seed_default_roles
from app.api.chat import router as chat_router
from app.api.documents import router as documents_router
from app.api.agents import router as agents_router
from app.api.mcp import router as mcp_router
from app.monitoring.api_middleware import (
    APIUsageMiddleware,
)
from app.api.analytics import router as analytics_router
@asynccontextmanager
async def lifespan(
    app: FastAPI,
) -> AsyncIterator[None]:
    # A fresh deployment starts with an empty database.  Register every model
    # and create missing tables before seeding the default roles.
    Base.metadata.create_all(bind=engine)

    # Create the four default roles when the application starts.
    with SessionLocal() as db:
        seed_default_roles(db)

    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Enterprise multi-agent AI workspace API",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://task-7-i-enterprise-ai-work-space.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    APIUsageMiddleware,
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(chat_router)
app.include_router(documents_router)
app.include_router(agents_router)
app.include_router(mcp_router)
app.include_router(analytics_router)

@app.get("/", tags=["System"])
def root() -> dict[str, str]:
    return {
        "message": "AI Workspace backend is running",
        "version": settings.app_version,
    }


@app.get("/health", tags=["System"])
def health_check() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": settings.app_name,
    }
