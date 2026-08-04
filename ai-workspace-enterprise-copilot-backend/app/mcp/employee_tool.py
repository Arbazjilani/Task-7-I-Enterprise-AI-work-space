from __future__ import annotations

from typing import Any

from app.mcp.base import (
    BaseMCPTool,
    MCPToolDefinition,
    MCPToolResult,
)
from app.mcp.mock_data import EMPLOYEES


class EmployeeTool(BaseMCPTool):
    def __init__(self) -> None:
        super().__init__(
            MCPToolDefinition(
                name="employee_tool",
                display_name="Employee Tool",
                description=(
                    "Retrieves employee profiles, departments "
                    "and leave balances."
                ),
                required_permission="mcp:employee:read",
                allowed_agents=[
                    "hr",
                    "general",
                ],
                input_schema={
                    "operation": {
                        "type": "string",
                        "enum": [
                            "list_employees",
                            "get_employee",
                            "get_leave_balance",
                            "get_employee_department",
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
            "list_employees",
            "get_employee",
            "get_leave_balance",
            "get_employee_department",
        ]

    def _find_employee(
        self,
        arguments: dict[str, Any],
    ) -> dict[str, Any] | None:
        employee_id = arguments.get("employee_id")
        employee_code = arguments.get("employee_code")
        email = arguments.get("email")

        for employee in EMPLOYEES:
            if (
                employee_id is not None
                and employee["id"] == int(employee_id)
            ):
                return employee

            if (
                employee_code
                and employee["employee_code"].lower()
                == str(employee_code).lower()
            ):
                return employee

            if (
                email
                and employee["email"].lower()
                == str(email).lower()
            ):
                return employee

        return None

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
                error="Unsupported employee operation.",
            )

        if operation == "list_employees":
            active_only = bool(
                arguments.get("active_only", True)
            )

            employees = [
                employee
                for employee in EMPLOYEES
                if (
                    not active_only
                    or employee["is_active"]
                )
            ]

            return MCPToolResult(
                success=True,
                tool_name=self.name,
                operation=operation,
                data=employees,
                message=(
                    f"Returned {len(employees)} employees."
                ),
            )

        employee = self._find_employee(arguments)

        if employee is None:
            return MCPToolResult(
                success=False,
                tool_name=self.name,
                operation=operation,
                error=(
                    "Employee not found. Provide employee_id, "
                    "employee_code or email."
                ),
            )

        if operation == "get_employee":
            return MCPToolResult(
                success=True,
                tool_name=self.name,
                operation=operation,
                data=employee,
            )

        if operation == "get_leave_balance":
            return MCPToolResult(
                success=True,
                tool_name=self.name,
                operation=operation,
                data={
                    "employee_id": employee["id"],
                    "employee_code": (
                        employee["employee_code"]
                    ),
                    "full_name": employee["full_name"],
                    "casual_leave_balance": (
                        employee[
                            "casual_leave_balance"
                        ]
                    ),
                    "sick_leave_balance": (
                        employee[
                            "sick_leave_balance"
                        ]
                    ),
                },
            )

        return MCPToolResult(
            success=True,
            tool_name=self.name,
            operation=operation,
            data={
                "employee_id": employee["id"],
                "full_name": employee["full_name"],
                "department": employee["department"],
                "designation": employee["designation"],
                "manager": employee["manager"],
            },
        )