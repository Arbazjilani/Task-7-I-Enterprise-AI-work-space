from __future__ import annotations

import json
from typing import Any

from app.mcp.base import MCPToolResult


def format_tool_result_for_chat(
    result: MCPToolResult,
) -> str:
    if not result.success:
        return (
            result.error
            or "The requested tool call failed."
        )

    if result.tool_name == "employee_tool":
        if result.operation == "get_leave_balance":
            data = result.data or {}

            return (
                f"{data.get('full_name', 'The employee')} has "
                f"{data.get('casual_leave_balance', 0)} casual "
                f"leave days and "
                f"{data.get('sick_leave_balance', 0)} sick "
                f"leave days remaining."
            )

        if result.operation == "list_employees":
            employees = result.data or []

            if not employees:
                return "No active employees were found."

            names = [
                (
                    f"{employee['full_name']} "
                    f"({employee['department']})"
                )
                for employee in employees
            ]

            return (
                "Active employees: "
                + ", ".join(names)
                + "."
            )

    if result.tool_name == "calendar_tool":
        if result.operation == "get_holidays":
            holidays = result.data or []

            if not holidays:
                return "No holidays were found."

            items = [
                (
                    f"{holiday['name']} on "
                    f"{holiday['date']}"
                )
                for holiday in holidays
            ]

            return (
                "Company holidays: "
                + "; ".join(items)
                + "."
            )

        if result.operation == "list_events":
            events = result.data or []

            if not events:
                return "No calendar events were found."

            items = [
                (
                    f"{event['title']} from "
                    f"{event['start_time']} to "
                    f"{event['end_time']}"
                )
                for event in events
            ]

            return (
                "Upcoming calendar events: "
                + "; ".join(items)
                + "."
            )

    if result.tool_name == "project_tool":
        if result.operation == "list_projects":
            projects = result.data or []

            if not projects:
                return "No projects were found."

            items = [
                (
                    f"{project['name']} "
                    f"({project['status']})"
                )
                for project in projects
            ]

            return (
                "Projects: "
                + ", ".join(items)
                + "."
            )

        if result.operation == "get_project_summary":
            data = result.data or {}
            project = data.get(
                "project",
                {},
            )

            return (
                f"{project.get('name', 'The project')} is "
                f"{project.get('status', 'unknown')} with "
                f"{data.get('completed_tasks', 0)} completed "
                f"tasks and {data.get('open_tasks', 0)} "
                f"open tasks. Project health is "
                f"{project.get('health', 'unknown')}."
            )

    if result.tool_name == "email_tool":
        if result.operation == "search_emails":
            emails = result.data or []

            if not emails:
                return "No matching emails were found."

            items = [
                (
                    f"“{email['subject']}” from "
                    f"{email['from']}"
                )
                for email in emails
            ]

            return (
                "Matching emails: "
                + "; ".join(items)
                + "."
            )

    if result.message:
        return result.message

    return json.dumps(
        result.data,
        default=str,
    )