from __future__ import annotations

from dataclasses import dataclass
from time import perf_counter
from typing import Any

from sqlalchemy.orm import Session

from app.mcp.base import MCPToolResult
from app.mcp.registry import get_mcp_tool
from app.models.mcp_execution import MCPExecution
from app.services.employee_tool_service import (
    execute_employee_tool,
)
from app.services.mcp_audit_service import (
    create_mcp_execution_log,
)


@dataclass
class MCPExecutionContext:
    """
    Information about the user and agent executing
    an MCP tool.
    """

    user_id: int
    user_role: str
    agent_name: str
    conversation_id: int | None = None


@dataclass
class AuditedMCPResult:
    """
    MCP tool result together with the stored audit log.
    """

    result: MCPToolResult
    execution: MCPExecution
    execution_time_ms: float


ROLE_PERMISSIONS: dict[str, set[str]] = {
    "admin": {
        "mcp:employee:read",
        "mcp:calendar:use",
        "mcp:email:use",
        "mcp:project:use",
    },
    "manager": {
        "mcp:employee:read",
        "mcp:calendar:use",
        "mcp:email:use",
        "mcp:project:use",
    },
    "employee": {
        "mcp:employee:read",
        "mcp:calendar:use",
        "mcp:project:use",
    },
    "viewer": set(),
}


def has_permission(
    role_name: str,
    permission: str,
) -> bool:
    """
    Check whether a role can use a particular MCP tool.
    """

    normalized_role = (
        role_name.strip().lower()
        if role_name
        else ""
    )

    permissions = ROLE_PERMISSIONS.get(
        normalized_role,
        set(),
    )

    return permission in permissions


def _permission_error_result(
    tool_name: str,
    operation: str,
) -> MCPToolResult:
    """
    Create a standardized permission-denied result.
    """

    return MCPToolResult(
        success=False,
        tool_name=tool_name,
        operation=operation,
        data=None,
        message=None,
        error=(
            "You do not have permission to use this tool."
        ),
    )


def _agent_error_result(
    tool_name: str,
    operation: str,
    agent_name: str,
) -> MCPToolResult:
    """
    Create a standardized unsupported-agent result.
    """

    return MCPToolResult(
        success=False,
        tool_name=tool_name,
        operation=operation,
        data=None,
        message=None,
        error=(
            f"The {agent_name} agent is not "
            f"allowed to use {tool_name}."
        ),
    )


def _execute_database_employee_tool(
    db: Session,
    operation: str,
    arguments: dict[str, Any],
) -> MCPToolResult:
    """
    Execute the database-backed Employee MCP tool.

    This bypasses the old registry execution function for
    employee operations so leave balances are read from the
    employees table.
    """

    print(
        "EMPLOYEE MCP DEBUG:",
        {
            "operation": operation,
            "arguments": arguments,
        },
    )

    employee_result = execute_employee_tool(
        db=db,
        operation=operation,
        arguments=arguments,
    )

    return MCPToolResult(
        success=employee_result.success,
        tool_name="employee_tool",
        operation=employee_result.operation,
        data=employee_result.data,
        message=employee_result.message,
        error=employee_result.error,
    )


def execute_mcp_tool(
    db: Session,
    context: MCPExecutionContext,
    tool_name: str,
    operation: str,
    arguments: dict[str, Any] | None,
) -> MCPToolResult:
    """
    Execute one MCP tool after checking RBAC and agent access.

    Employee-tool requests are processed using SQLAlchemy and
    the employees table. All other tools continue using the
    existing MCP registry.
    """

    normalized_tool_name = tool_name.strip().lower()
    normalized_operation = operation.strip().lower()
    safe_arguments = arguments or {}

    tool = get_mcp_tool(
        normalized_tool_name,
    )

    if not has_permission(
        role_name=context.user_role,
        permission=tool.required_permission,
    ):
        return _permission_error_result(
            tool_name=tool.name,
            operation=normalized_operation,
        )

    if not tool.supports_agent(
        context.agent_name,
    ):
        return _agent_error_result(
            tool_name=tool.name,
            operation=normalized_operation,
            agent_name=context.agent_name,
        )

    # Employee tool needs the active SQLAlchemy session because
    # it reads employee and leave data from PostgreSQL.
    if normalized_tool_name == "employee_tool":
        return _execute_database_employee_tool(
            db=db,
            operation=normalized_operation,
            arguments=safe_arguments,
        )

    # Calendar, email and project tools continue to use the
    # existing registered MCP implementation.
    return tool.execute(
        operation=normalized_operation,
        arguments=safe_arguments,
    )


def execute_and_audit_mcp_tool(
    db: Session,
    context: MCPExecutionContext,
    tool_name: str,
    operation: str,
    arguments: dict[str, Any] | None,
) -> AuditedMCPResult:
    """
    Execute an MCP tool and save its execution details.

    This records:

    - user
    - conversation
    - agent
    - tool
    - operation
    - arguments
    - result
    - status
    - error
    - execution duration
    """

    started_at = perf_counter()

    safe_arguments = arguments or {}

    normalized_tool_name = (
        tool_name.strip().lower()
    )

    normalized_operation = (
        operation.strip().lower()
    )

    try:
        result = execute_mcp_tool(
            db=db,
            context=context,
            tool_name=normalized_tool_name,
            operation=normalized_operation,
            arguments=safe_arguments,
        )

    except Exception as error:
        db.rollback()

        elapsed_ms = (
            perf_counter() - started_at
        ) * 1000

        result = MCPToolResult(
            success=False,
            tool_name=normalized_tool_name,
            operation=normalized_operation,
            data=None,
            message=None,
            error=str(error),
        )

        execution = create_mcp_execution_log(
            db=db,
            user_id=context.user_id,
            conversation_id=(
                context.conversation_id
            ),
            tool_name=normalized_tool_name,
            operation=normalized_operation,
            agent_name=context.agent_name,
            arguments=safe_arguments,
            result_data=None,
            success=False,
            message=None,
            error=str(error),
            execution_time_ms=elapsed_ms,
        )

        return AuditedMCPResult(
            result=result,
            execution=execution,
            execution_time_ms=elapsed_ms,
        )

    elapsed_ms = (
        perf_counter() - started_at
    ) * 1000

    try:
        execution = create_mcp_execution_log(
            db=db,
            user_id=context.user_id,
            conversation_id=(
                context.conversation_id
            ),
            tool_name=result.tool_name,
            operation=result.operation,
            agent_name=context.agent_name,
            arguments=safe_arguments,
            result_data=result.data,
            success=result.success,
            message=result.message,
            error=result.error,
            execution_time_ms=elapsed_ms,
        )

    except Exception:
        db.rollback()
        raise

    return AuditedMCPResult(
        result=result,
        execution=execution,
        execution_time_ms=elapsed_ms,
    )