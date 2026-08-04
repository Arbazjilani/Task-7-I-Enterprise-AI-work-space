from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.agents.orchestrator import route_message
from app.agents.registry import (
    get_agent,
    list_agents,
    set_agent_enabled,
)
from app.auth.dependencies import (
    CurrentUser,
    require_roles,
)
from app.models.user import User
from app.schemas.agent import (
    AgentResponse,
    AgentRoutingRequest,
    AgentRoutingResponse,
    AgentStatusUpdate,
)


router = APIRouter(
    prefix="/api/agents",
    tags=["AI Agents"],
)


AdminUser = Annotated[
    User,
    Depends(require_roles("admin")),
]


@router.get(
    "",
    response_model=list[AgentResponse],
)
def get_agents(
    _: CurrentUser,
) -> list[AgentResponse]:
    return [
        AgentResponse(
            name=agent.name,
            display_name=agent.display_name,
            description=agent.description,
            allowed_tools=agent.allowed_tools,
            knowledge_domains=(
                agent.knowledge_domains
            ),
            is_enabled=agent.is_enabled,
        )
        for agent in list_agents()
    ]


@router.get(
    "/{agent_name}",
    response_model=AgentResponse,
)
def get_agent_details(
    agent_name: str,
    _: CurrentUser,
) -> AgentResponse:
    try:
        agent = get_agent(agent_name)

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    return AgentResponse(
        name=agent.name,
        display_name=agent.display_name,
        description=agent.description,
        allowed_tools=agent.allowed_tools,
        knowledge_domains=agent.knowledge_domains,
        is_enabled=agent.is_enabled,
    )


@router.post(
    "/route",
    response_model=AgentRoutingResponse,
)
def test_agent_routing(
    payload: AgentRoutingRequest,
    _: CurrentUser,
) -> AgentRoutingResponse:
    try:
        result = route_message(
            message=payload.message,
            requested_agent=payload.requested_agent,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    return AgentRoutingResponse(
        selected_agent=result.agent.name,
        display_name=result.agent.display_name,
        confidence=result.confidence,
        reason=result.reason,
        matched_keywords=result.matched_keywords,
    )


@router.put(
    "/{agent_name}/status",
    response_model=AgentResponse,
)
def update_agent_status(
    agent_name: str,
    payload: AgentStatusUpdate,
    _: AdminUser,
) -> AgentResponse:
    try:
        agent = set_agent_enabled(
            agent_name=agent_name,
            is_enabled=payload.is_enabled,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    return AgentResponse(
        name=agent.name,
        display_name=agent.display_name,
        description=agent.description,
        allowed_tools=agent.allowed_tools,
        knowledge_domains=agent.knowledge_domains,
        is_enabled=agent.is_enabled,
    )