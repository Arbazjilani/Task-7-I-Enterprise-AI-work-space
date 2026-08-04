from __future__ import annotations

from app.mcp.base import BaseMCPTool
from app.mcp.calendar_tool import CalendarTool
from app.mcp.email_tool import EmailTool
from app.mcp.employee_tool import EmployeeTool
from app.mcp.project_tool import ProjectTool


_TOOL_REGISTRY: dict[str, BaseMCPTool] = {
    "employee_tool": EmployeeTool(),
    "calendar_tool": CalendarTool(),
    "email_tool": EmailTool(),
    "project_tool": ProjectTool(),
}


def get_mcp_tool(
    tool_name: str,
) -> BaseMCPTool:
    normalized_name = tool_name.strip().lower()

    tool = _TOOL_REGISTRY.get(normalized_name)

    if tool is None:
        raise ValueError(
            f"MCP tool '{tool_name}' does not exist."
        )

    return tool


def list_mcp_tools() -> list[BaseMCPTool]:
    return list(_TOOL_REGISTRY.values())


def list_tool_names() -> list[str]:
    return sorted(_TOOL_REGISTRY.keys())