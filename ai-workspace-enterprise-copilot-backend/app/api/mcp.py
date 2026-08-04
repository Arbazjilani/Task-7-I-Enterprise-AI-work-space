from __future__ import annotations

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
    status,
)

from app.agents.orchestrator import route_message
from app.auth.dependencies import (
    CurrentUser,
    DatabaseSession,
)
from app.mcp.registry import list_mcp_tools
from app.models.mcp_execution import MCPExecution
from app.schemas.mcp import (
    MCPCallRequest,
    MCPCallResponse,
    MCPChatRequest,
    MCPChatResponse,
    MCPExecutionResponse,
    MCPToolResponse,
)
from app.services.mcp_audit_service import (
    list_mcp_executions,
)
from app.services.mcp_service import (
    MCPExecutionContext,
    execute_and_audit_mcp_tool,
)
from app.services.tool_answer_service import (
    format_tool_result_for_chat,
)
from app.services.tool_routing_service import (
    detect_tool_request,
)


router = APIRouter(
    prefix="/api/mcp",
    tags=["MCP Tools"],
)


@router.get(
    "/tools",
    response_model=list[MCPToolResponse],
)
def get_tools(
    _: CurrentUser,
) -> list[MCPToolResponse]:
    return [
        MCPToolResponse(
            name=tool.name,
            display_name=tool.display_name,
            description=tool.description,
            required_permission=(
                tool.required_permission
            ),
            allowed_agents=tool.allowed_agents,
            operations=tool.operations(),
            input_schema=tool.input_schema,
        )
        for tool in list_mcp_tools()
    ]


@router.post(
    "/call",
    response_model=MCPCallResponse,
)
def call_tool(
    payload: MCPCallRequest,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> MCPCallResponse:
    context = MCPExecutionContext(
        user_id=current_user.id,
        user_role=current_user.role.name,
        agent_name=payload.agent_name.lower(),
        conversation_id=payload.conversation_id,
    )

    audited_result = execute_and_audit_mcp_tool(
        db=db,
        context=context,
        tool_name=payload.tool_name,
        operation=payload.operation,
        arguments=payload.arguments,
    )

    result = audited_result.result

    return MCPCallResponse(
        success=result.success,
        tool_name=result.tool_name,
        operation=result.operation,
        execution_id=(
            audited_result.execution.id
        ),
        execution_time_ms=(
            audited_result.execution_time_ms
        ),
        data=result.data,
        message=result.message,
        error=result.error,
    )


@router.post(
    "/chat",
    response_model=MCPChatResponse,
)
def mcp_chat(
    payload: MCPChatRequest,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> MCPChatResponse:
    try:
        routing = route_message(
            message=payload.message,
            requested_agent=payload.agent_name,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    agent_name = routing.agent.name

    tool_routing = detect_tool_request(
        message=payload.message,
        current_user_email=current_user.email,
    )

    if (
        not tool_routing.tool_required
        or tool_routing.tool_name is None
        or tool_routing.operation is None
    ):
        return MCPChatResponse(
            agent_name=agent_name,
            tool_called=False,
            answer=(
                "No MCP tool call was required. "
                "Use the normal AI chat endpoint for "
                "knowledge-base questions."
            ),
        )

    context = MCPExecutionContext(
        user_id=current_user.id,
        user_role=current_user.role.name,
        agent_name=agent_name,
        conversation_id=payload.conversation_id,
    )

    audited_result = execute_and_audit_mcp_tool(
        db=db,
        context=context,
        tool_name=tool_routing.tool_name,
        operation=tool_routing.operation,
        arguments=(
            tool_routing.arguments
            or {}
        ),
    )

    result = audited_result.result

    answer = format_tool_result_for_chat(
        result
    )

    return MCPChatResponse(
        agent_name=agent_name,
        tool_name=result.tool_name,
        operation=result.operation,
        tool_called=True,
        execution_id=(
            audited_result.execution.id
        ),
        tool_result=result.data,
        answer=answer,
    )


@router.get(
    "/executions",
    response_model=list[MCPExecutionResponse],
)
def get_mcp_executions(
    db: DatabaseSession,
    current_user: CurrentUser,
    skip: int = Query(
        default=0,
        ge=0,
    ),
    limit: int = Query(
        default=50,
        ge=1,
        le=200,
    ),
    tool_name: str | None = Query(
        default=None
    ),
    success: bool | None = Query(
        default=None
    ),
) -> list[MCPExecution]:
    user_id = None

    if current_user.role.name not in {
        "admin",
        "manager",
    }:
        user_id = current_user.id

    return list_mcp_executions(
        db=db,
        skip=skip,
        limit=limit,
        user_id=user_id,
        tool_name=tool_name,
        success=success,
    )