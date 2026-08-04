from __future__ import annotations

from datetime import datetime
from typing import Any

from app.mcp.base import (
    BaseMCPTool,
    MCPToolDefinition,
    MCPToolResult,
)
from app.mcp.mock_data import (
    CALENDAR_EVENTS,
    HOLIDAYS,
    next_numeric_id,
)


class CalendarTool(BaseMCPTool):
    def __init__(self) -> None:
        super().__init__(
            MCPToolDefinition(
                name="calendar_tool",
                display_name="Calendar Tool",
                description=(
                    "Lists events, checks availability, "
                    "creates mock events and returns holidays."
                ),
                required_permission="mcp:calendar:use",
                allowed_agents=[
                    "hr",
                    "project",
                    "general",
                ],
                input_schema={
                    "operation": {
                        "type": "string",
                        "enum": [
                            "list_events",
                            "create_event",
                            "check_availability",
                            "get_holidays",
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
            "list_events",
            "create_event",
            "check_availability",
            "get_holidays",
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
                error="Unsupported calendar operation.",
            )

        if operation == "list_events":
            attendee = arguments.get("attendee")

            events = CALENDAR_EVENTS

            if attendee:
                attendee_lower = str(attendee).lower()

                events = [
                    event
                    for event in events
                    if attendee_lower
                    in [
                        email.lower()
                        for email in event["attendees"]
                    ]
                ]

            return MCPToolResult(
                success=True,
                tool_name=self.name,
                operation=operation,
                data=events,
            )

        if operation == "get_holidays":
            return MCPToolResult(
                success=True,
                tool_name=self.name,
                operation=operation,
                data=HOLIDAYS,
            )

        start_time = arguments.get("start_time")
        end_time = arguments.get("end_time")

        if not start_time or not end_time:
            return MCPToolResult(
                success=False,
                tool_name=self.name,
                operation=operation,
                error=(
                    "start_time and end_time are required."
                ),
            )

        try:
            requested_start = datetime.fromisoformat(
                str(start_time)
            )
            requested_end = datetime.fromisoformat(
                str(end_time)
            )
        except ValueError:
            return MCPToolResult(
                success=False,
                tool_name=self.name,
                operation=operation,
                error=(
                    "Dates must use ISO-8601 format."
                ),
            )

        if requested_end <= requested_start:
            return MCPToolResult(
                success=False,
                tool_name=self.name,
                operation=operation,
                error=(
                    "end_time must be after start_time."
                ),
            )

        conflicts: list[dict[str, Any]] = []

        for event in CALENDAR_EVENTS:
            event_start = datetime.fromisoformat(
                event["start_time"]
            )
            event_end = datetime.fromisoformat(
                event["end_time"]
            )

            overlaps = (
                requested_start < event_end
                and requested_end > event_start
            )

            if overlaps:
                conflicts.append(event)

        if operation == "check_availability":
            return MCPToolResult(
                success=True,
                tool_name=self.name,
                operation=operation,
                data={
                    "available": not conflicts,
                    "conflicts": conflicts,
                },
            )

        title = str(
            arguments.get("title", "")
        ).strip()

        if not title:
            return MCPToolResult(
                success=False,
                tool_name=self.name,
                operation=operation,
                error="Event title is required.",
            )

        if conflicts:
            return MCPToolResult(
                success=False,
                tool_name=self.name,
                operation=operation,
                error=(
                    "The selected time conflicts with "
                    "an existing event."
                ),
                data={
                    "conflicts": conflicts,
                },
            )

        event = {
            "id": next_numeric_id(CALENDAR_EVENTS),
            "title": title,
            "start_time": str(start_time),
            "end_time": str(end_time),
            "location": arguments.get(
                "location",
                "Online",
            ),
            "attendees": arguments.get(
                "attendees",
                [],
            ),
        }

        CALENDAR_EVENTS.append(event)

        return MCPToolResult(
            success=True,
            tool_name=self.name,
            operation=operation,
            data=event,
            message="Mock calendar event created.",
        )