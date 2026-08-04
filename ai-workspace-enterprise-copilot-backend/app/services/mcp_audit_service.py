from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.mcp_execution import MCPExecution


def create_mcp_execution_log(
    db: Session,
    user_id: int,
    conversation_id: int | None,
    tool_name: str,
    operation: str,
    agent_name: str,
    arguments: dict[str, Any],
    success: bool,
    result_data: Any = None,
    message: str | None = None,
    error: str | None = None,
    execution_time_ms: float = 0.0,
) -> MCPExecution:
    execution = MCPExecution(
        user_id=user_id,
        conversation_id=conversation_id,
        tool_name=tool_name,
        operation=operation,
        agent_name=agent_name,
        arguments=arguments,
        result_data=result_data,
        success=success,
        message=message,
        error=error,
        execution_time_ms=execution_time_ms,
    )

    db.add(execution)
    db.commit()
    db.refresh(execution)

    return execution


def list_mcp_executions(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    user_id: int | None = None,
    tool_name: str | None = None,
    success: bool | None = None,
) -> list[MCPExecution]:
    statement = (
        select(MCPExecution)
        .order_by(
            MCPExecution.created_at.desc()
        )
        .offset(skip)
        .limit(limit)
    )

    if user_id is not None:
        statement = statement.where(
            MCPExecution.user_id == user_id
        )

    if tool_name:
        statement = statement.where(
            MCPExecution.tool_name
            == tool_name.strip().lower()
        )

    if success is not None:
        statement = statement.where(
            MCPExecution.success.is_(success)
        )

    return list(
        db.scalars(statement).all()
    )