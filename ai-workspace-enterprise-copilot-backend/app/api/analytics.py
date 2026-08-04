from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import (
    DatabaseSession,
    require_roles,
)
from app.models.user import User
from app.schemas.analytics import (
    APIUsageSummaryResponse,
    AgentUsageResponse,
    AnalyticsOverviewResponse,
    DailyTokenUsageResponse,
)
from app.services.analytics_service import (
    get_agent_usage,
    get_api_usage_summary,
    get_daily_token_usage,
    get_overview,
)


router = APIRouter(
    prefix="/api/analytics",
    tags=["Monitoring and Analytics"],
)


AnalyticsViewer = Annotated[
    User,
    Depends(
        require_roles(
            "admin",
            "manager",
        )
    ),
]


@router.get(
    "/overview",
    response_model=AnalyticsOverviewResponse,
)
def analytics_overview(
    db: DatabaseSession,
    _: AnalyticsViewer,
) -> AnalyticsOverviewResponse:
    return AnalyticsOverviewResponse(
        **get_overview(db)
    )


@router.get(
    "/agents",
    response_model=list[AgentUsageResponse],
)
def agent_usage(
    db: DatabaseSession,
    _: AnalyticsViewer,
) -> list[AgentUsageResponse]:
    return [
        AgentUsageResponse(**item)
        for item in get_agent_usage(db)
    ]


@router.get(
    "/tokens",
    response_model=list[DailyTokenUsageResponse],
)
def token_usage(
    db: DatabaseSession,
    _: AnalyticsViewer,
    days: int = Query(
        default=30,
        ge=1,
        le=365,
    ),
) -> list[DailyTokenUsageResponse]:
    return [
        DailyTokenUsageResponse(**item)
        for item in get_daily_token_usage(
            db=db,
            days=days,
        )
    ]


@router.get(
    "/apis",
    response_model=list[APIUsageSummaryResponse],
)
def api_usage(
    db: DatabaseSession,
    _: AnalyticsViewer,
) -> list[APIUsageSummaryResponse]:
    return [
        APIUsageSummaryResponse(**item)
        for item in get_api_usage_summary(db)
    ]