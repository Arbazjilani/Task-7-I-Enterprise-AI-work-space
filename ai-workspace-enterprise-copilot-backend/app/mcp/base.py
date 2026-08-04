from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class MCPToolDefinition:
    name: str
    display_name: str
    description: str
    required_permission: str
    allowed_agents: list[str] = field(default_factory=list)
    input_schema: dict[str, Any] = field(default_factory=dict)


@dataclass
class MCPToolResult:
    success: bool
    tool_name: str
    operation: str
    data: Any = None
    message: str | None = None
    error: str | None = None


class BaseMCPTool(ABC):
    def __init__(
        self,
        definition: MCPToolDefinition,
    ) -> None:
        self.definition = definition

    @property
    def name(self) -> str:
        return self.definition.name

    @property
    def display_name(self) -> str:
        return self.definition.display_name

    @property
    def description(self) -> str:
        return self.definition.description

    @property
    def required_permission(self) -> str:
        return self.definition.required_permission

    @property
    def allowed_agents(self) -> list[str]:
        return self.definition.allowed_agents

    @property
    def input_schema(self) -> dict[str, Any]:
        return self.definition.input_schema

    def supports_agent(self, agent_name: str) -> bool:
        if not self.allowed_agents:
            return True

        return agent_name in self.allowed_agents

    @abstractmethod
    def operations(self) -> list[str]:
        raise NotImplementedError

    @abstractmethod
    def execute(
        self,
        operation: str,
        arguments: dict[str, Any],
    ) -> MCPToolResult:
        raise NotImplementedError