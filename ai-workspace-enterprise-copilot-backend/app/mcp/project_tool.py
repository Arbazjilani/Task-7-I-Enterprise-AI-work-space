from __future__ import annotations

from typing import Any

from app.mcp.base import (
    BaseMCPTool,
    MCPToolDefinition,
    MCPToolResult,
)
from app.mcp.mock_data import (
    PROJECTS,
    PROJECT_TASKS,
    next_numeric_id,
)


class ProjectTool(BaseMCPTool):
    def __init__(self) -> None:
        super().__init__(
            MCPToolDefinition(
                name="project_tool",
                display_name="Project Tool",
                description=(
                    "Retrieves projects and tasks and creates "
                    "or updates mock project tasks."
                ),
                required_permission="mcp:project:use",
                allowed_agents=[
                    "project",
                    "support",
                    "documentation",
                    "general",
                ],
                input_schema={
                    "operation": {
                        "type": "string",
                        "enum": [
                            "list_projects",
                            "get_project",
                            "list_tasks",
                            "create_task",
                            "update_task",
                            "get_project_summary",
                        ],
                    },
                    "arguments": {
                        "type": "object",
                    },
                },
            )
        )

    def operations(self) -> list[str]:
        return [
            "list_projects",
            "get_project",
            "list_tasks",
            "create_task",
            "update_task",
            "get_project_summary",
        ]

    def _get_project(
        self,
        project_id: int,
    ) -> dict[str, Any] | None:
        return next(
            (
                project
                for project in PROJECTS
                if project["id"] == project_id
            ),
            None,
        )

    def execute(
        self,
        operation: str,
        arguments: dict[str, Any],
    ) -> MCPToolResult:
        if operation not in self.operations():
            return MCPToolResult(
                success=False,
                tool_name=self.name,
                operation=operation,
                error="Unsupported project operation.",
            )

        if operation == "list_projects":
            return MCPToolResult(
                success=True,
                tool_name=self.name,
                operation=operation,
                data=PROJECTS,
            )

        project_id_value = arguments.get("project_id")

        if project_id_value is None:
            return MCPToolResult(
                success=False,
                tool_name=self.name,
                operation=operation,
                error="project_id is required.",
            )

        project_id = int(project_id_value)

        project = self._get_project(project_id)

        if project is None:
            return MCPToolResult(
                success=False,
                tool_name=self.name,
                operation=operation,
                error="Project not found.",
            )

        if operation == "get_project":
            return MCPToolResult(
                success=True,
                tool_name=self.name,
                operation=operation,
                data=project,
            )

        project_tasks = [
            task
            for task in PROJECT_TASKS
            if task["project_id"] == project_id
        ]

        if operation == "list_tasks":
            return MCPToolResult(
                success=True,
                tool_name=self.name,
                operation=operation,
                data=project_tasks,
            )

        if operation == "get_project_summary":
            task_count = len(project_tasks)

            completed_count = sum(
                1
                for task in project_tasks
                if task["status"] == "completed"
            )

            pending_count = sum(
                1
                for task in project_tasks
                if task["status"] != "completed"
            )

            return MCPToolResult(
                success=True,
                tool_name=self.name,
                operation=operation,
                data={
                    "project": project,
                    "task_count": task_count,
                    "completed_tasks": completed_count,
                    "open_tasks": pending_count,
                    "tasks": project_tasks,
                },
            )

        if operation == "create_task":
            title = str(
                arguments.get("title", "")
            ).strip()

            if not title:
                return MCPToolResult(
                    success=False,
                    tool_name=self.name,
                    operation=operation,
                    error="Task title is required.",
                )

            task = {
                "id": next_numeric_id(PROJECT_TASKS),
                "project_id": project_id,
                "title": title,
                "status": arguments.get(
                    "status",
                    "pending",
                ),
                "priority": arguments.get(
                    "priority",
                    "medium",
                ),
                "assignee": arguments.get(
                    "assignee",
                ),
                "due_date": arguments.get(
                    "due_date",
                ),
            }

            PROJECT_TASKS.append(task)

            return MCPToolResult(
                success=True,
                tool_name=self.name,
                operation=operation,
                data=task,
                message="Mock project task created.",
            )

        task_id_value = arguments.get("task_id")

        if task_id_value is None:
            return MCPToolResult(
                success=False,
                tool_name=self.name,
                operation=operation,
                error="task_id is required.",
            )

        task = next(
            (
                item
                for item in PROJECT_TASKS
                if (
                    item["id"] == int(task_id_value)
                    and item["project_id"]
                    == project_id
                )
            ),
            None,
        )

        if task is None:
            return MCPToolResult(
                success=False,
                tool_name=self.name,
                operation=operation,
                error="Project task not found.",
            )

        allowed_fields = {
            "title",
            "status",
            "priority",
            "assignee",
            "due_date",
        }

        for field_name in allowed_fields:
            if field_name in arguments:
                task[field_name] = arguments[field_name]

        return MCPToolResult(
            success=True,
            tool_name=self.name,
            operation=operation,
            data=task,
            message="Mock project task updated.",
        )