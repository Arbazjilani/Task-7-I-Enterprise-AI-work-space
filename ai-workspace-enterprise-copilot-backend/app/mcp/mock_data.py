from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Any


EMPLOYEES: list[dict[str, Any]] = [
    {
        "id": 1,
        "employee_code": "EMP001",
        "full_name": "D Venkatesh",
        "email": "venkatesh@example.com",
        "department": "Engineering",
        "designation": "AI Engineer",
        "manager": "Engineering Manager",
        "casual_leave_balance": 12,
        "sick_leave_balance": 10,
        "is_active": True,
    },
    {
        "id": 2,
        "employee_code": "EMP002",
        "full_name": "Anita Sharma",
        "email": "anita@example.com",
        "department": "Human Resources",
        "designation": "HR Manager",
        "manager": "Operations Director",
        "casual_leave_balance": 9,
        "sick_leave_balance": 8,
        "is_active": True,
    },
    {
        "id": 3,
        "employee_code": "EMP003",
        "full_name": "Rahul Kumar",
        "email": "rahul@example.com",
        "department": "Customer Support",
        "designation": "Support Executive",
        "manager": "Support Manager",
        "casual_leave_balance": 7,
        "sick_leave_balance": 9,
        "is_active": True,
    },
]


CALENDAR_EVENTS: list[dict[str, Any]] = [
    {
        "id": 1,
        "title": "Sprint Planning",
        "start_time": "2026-07-16T10:00:00+05:30",
        "end_time": "2026-07-16T11:00:00+05:30",
        "location": "Conference Room A",
        "attendees": [
            "venkatesh@example.com",
            "rahul@example.com",
        ],
    },
    {
        "id": 2,
        "title": "HR Policy Review",
        "start_time": "2026-07-17T15:00:00+05:30",
        "end_time": "2026-07-17T16:00:00+05:30",
        "location": "Online",
        "attendees": [
            "anita@example.com",
        ],
    },
]


HOLIDAYS: list[dict[str, str]] = [
    {
        "name": "Independence Day",
        "date": "2026-08-15",
    },
    {
        "name": "Gandhi Jayanti",
        "date": "2026-10-02",
    },
    {
        "name": "Christmas",
        "date": "2026-12-25",
    },
]


EMAIL_RECORDS: list[dict[str, Any]] = [
    {
        "id": 1,
        "from": "hr@example.com",
        "to": ["venkatesh@example.com"],
        "subject": "Updated Leave Policy",
        "body": (
            "The updated employee leave policy is now "
            "available in the knowledge base."
        ),
        "status": "received",
        "created_at": "2026-07-14T09:00:00+05:30",
    },
    {
        "id": 2,
        "from": "support@example.com",
        "to": ["rahul@example.com"],
        "subject": "High Priority Ticket",
        "body": (
            "Ticket SUP-104 requires immediate review."
        ),
        "status": "received",
        "created_at": "2026-07-14T11:30:00+05:30",
    },
]


PROJECTS: list[dict[str, Any]] = [
    {
        "id": 1,
        "name": "Enterprise Copilot",
        "description": (
            "Multi-agent enterprise AI workspace."
        ),
        "status": "in_progress",
        "health": "green",
        "owner": "D Venkatesh",
        "start_date": "2026-07-01",
        "target_date": "2026-07-31",
    },
    {
        "id": 2,
        "name": "Customer Support AI",
        "description": (
            "AI-assisted ticket and customer support platform."
        ),
        "status": "completed",
        "health": "green",
        "owner": "Rahul Kumar",
        "start_date": "2026-06-01",
        "target_date": "2026-06-30",
    },
]


PROJECT_TASKS: list[dict[str, Any]] = [
    {
        "id": 1,
        "project_id": 1,
        "title": "Implement JWT authentication",
        "status": "completed",
        "priority": "high",
        "assignee": "D Venkatesh",
        "due_date": "2026-07-05",
    },
    {
        "id": 2,
        "project_id": 1,
        "title": "Implement MCP tools",
        "status": "in_progress",
        "priority": "high",
        "assignee": "D Venkatesh",
        "due_date": "2026-07-18",
    },
    {
        "id": 3,
        "project_id": 1,
        "title": "Build React admin dashboard",
        "status": "pending",
        "priority": "medium",
        "assignee": "D Venkatesh",
        "due_date": "2026-07-24",
    },
]


def next_numeric_id(
    records: list[dict[str, Any]],
) -> int:
    if not records:
        return 1

    return max(
        int(record["id"])
        for record in records
    ) + 1


def utc_now_iso() -> str:
    return datetime.now(
        timezone.utc
    ).isoformat()