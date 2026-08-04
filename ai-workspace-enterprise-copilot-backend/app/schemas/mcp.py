from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class MCPToolResponse(BaseModel):
    name: str
    display_name: str
    description: str
    required_permission: str

    allowed_agents: list[str] = Field(
        default_factory=list
    )

    operations: list[str] = Field(
        default_factory=list
    )

    input_schema: dict[str, Any] = Field(
        default_factory=dict
    )


class MCPCallRequest(BaseModel):
    tool_name: str = Field(
        min_length=2,
        max_length=100,
    )

    operation: str = Field(
        min_length=2,
        max_length=100,
    )

    arguments: dict[str, Any] = Field(
        default_factory=dict
    )

    agent_name: str = Field(
        default="general",
        min_length=2,
        max_length=50,
    )

    conversation_id: int | None = Field(
        default=None,
        ge=1,
    )


class MCPCallResponse(BaseModel):
    success: bool
    tool_name: str
    operation: str
    execution_id: int | None = None
    execution_time_ms: float = 0.0

    data: Any = None
    message: str | None = None
    error: str | None = None


class MCPChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=5000,
    )

    agent_name: str = Field(
        default="auto",
        min_length=2,
        max_length=50,
    )

    conversation_id: int | None = Field(
        default=None,
        ge=1,
    )


class MCPChatResponse(BaseModel):
    agent_name: str
    tool_name: str | None = None
    operation: str | None = None
    tool_called: bool
    execution_id: int | None = None
    tool_result: Any = None
    answer: str


class MCPExecutionResponse(BaseModel):
    id: int
    user_id: int
    conversation_id: int | None = None
    tool_name: str
    operation: str
    agent_name: str
    arguments: dict[str, Any]
    result_data: Any = None
    success: bool
    message: str | None = None
    error: str | None = None
    execution_time_ms: float
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )