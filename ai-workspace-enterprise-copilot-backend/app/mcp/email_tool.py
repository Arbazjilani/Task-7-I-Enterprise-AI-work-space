from __future__ import annotations

from typing import Any

from app.mcp.base import (
    BaseMCPTool,
    MCPToolDefinition,
    MCPToolResult,
)
from app.mcp.mock_data import (
    EMAIL_RECORDS,
    next_numeric_id,
    utc_now_iso,
)


class EmailTool(BaseMCPTool):
    def __init__(self) -> None:
        super().__init__(
            MCPToolDefinition(
                name="email_tool",
                display_name="Email Tool",
                description=(
                    "Searches mock emails and creates email drafts."
                ),
                required_permission="mcp:email:use",
                allowed_agents=[
                    "support",
                    "project",
                    "general",
                ],
                input_schema={
                    "operation": {
                        "type": "string",
                        "enum": [
                            "search_emails",
                            "create_email_draft",
                            "get_email",
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
            "search_emails",
            "create_email_draft",
            "get_email",
        ]

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
                error="Unsupported email operation.",
            )

        if operation == "search_emails":
            query = str(
                arguments.get("query", "")
            ).strip().lower()

            if not query:
                results = EMAIL_RECORDS
            else:
                results = [
                    email
                    for email in EMAIL_RECORDS
                    if (
                        query in email["subject"].lower()
                        or query in email["body"].lower()
                        or query in email["from"].lower()
                    )
                ]

            return MCPToolResult(
                success=True,
                tool_name=self.name,
                operation=operation,
                data=results,
                message=(
                    f"Returned {len(results)} email records."
                ),
            )

        if operation == "get_email":
            email_id = arguments.get("email_id")

            if email_id is None:
                return MCPToolResult(
                    success=False,
                    tool_name=self.name,
                    operation=operation,
                    error="email_id is required.",
                )

            email = next(
                (
                    item
                    for item in EMAIL_RECORDS
                    if item["id"] == int(email_id)
                ),
                None,
            )

            if email is None:
                return MCPToolResult(
                    success=False,
                    tool_name=self.name,
                    operation=operation,
                    error="Email not found.",
                )

            return MCPToolResult(
                success=True,
                tool_name=self.name,
                operation=operation,
                data=email,
            )

        recipients = arguments.get("to", [])
        subject = str(
            arguments.get("subject", "")
        ).strip()
        body = str(
            arguments.get("body", "")
        ).strip()

        if isinstance(recipients, str):
            recipients = [recipients]

        if not recipients or not subject or not body:
            return MCPToolResult(
                success=False,
                tool_name=self.name,
                operation=operation,
                error=(
                    "to, subject and body are required."
                ),
            )

        draft = {
            "id": next_numeric_id(EMAIL_RECORDS),
            "from": arguments.get(
                "from",
                "copilot@example.com",
            ),
            "to": recipients,
            "subject": subject,
            "body": body,
            "status": "draft",
            "created_at": utc_now_iso(),
        }

        EMAIL_RECORDS.append(draft)

        return MCPToolResult(
            success=True,
            tool_name=self.name,
            operation=operation,
            data=draft,
            message=(
                "Email draft created. No real email was sent."
            ),
        )