from dataclasses import dataclass, field
import re
from typing import Any


@dataclass
class ToolRoutingResult:
    tool_required: bool
    tool_name: str | None = None
    operation: str | None = None
    arguments: dict[str, Any] = field(
        default_factory=dict,
    )


def extract_email(
    message: str,
) -> str | None:
    """
    Extract an email address from the user message.
    """

    match = re.search(
        r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
        message,
    )

    if match is None:
        return None

    return match.group(0).strip()


def extract_employee_code(
    message: str,
) -> str | None:
    """
    Extract employee codes such as:

    EMP001
    EMP-001
    EMP_001
    """

    match = re.search(
        r"\bEMP[-_]?\d+\b",
        message,
        flags=re.IGNORECASE,
    )

    if match is None:
        return None

    return match.group(0).upper()


def extract_employee_id(
    message: str,
) -> int | None:
    """
    Extract an employee ID from text such as:

    employee id 5
    employee_id 5
    employee id: 5
    """

    match = re.search(
        r"\bemployee[\s_-]*id\s*[:=#-]?\s*(\d+)\b",
        message,
        flags=re.IGNORECASE,
    )

    if match is None:
        return None

    return int(match.group(1))


def extract_project_id(
    message: str,
) -> int | None:
    """
    Extract a project ID from text such as:

    project id 10
    project_id 10
    """

    match = re.search(
        r"\bproject[\s_-]*id\s*[:=#-]?\s*(\d+)\b",
        message,
        flags=re.IGNORECASE,
    )

    if match is None:
        return None

    return int(match.group(1))


def extract_ticket_id(
    message: str,
) -> int | None:
    """
    Extract a support ticket ID.
    """

    match = re.search(
        r"\b(?:ticket|issue)[\s_-]*id\s*[:=#-]?\s*(\d+)\b",
        message,
        flags=re.IGNORECASE,
    )

    if match is None:
        return None

    return int(match.group(1))


def extract_date(
    message: str,
) -> str | None:
    """
    Extract a date in YYYY-MM-DD format.
    """

    match = re.search(
        r"\b\d{4}-\d{2}-\d{2}\b",
        message,
    )

    if match is None:
        return None

    return match.group(0)


def contains_any(
    message: str,
    phrases: list[str],
) -> bool:
    """
    Return True when any phrase is present.
    """

    normalized = message.lower()

    return any(
        phrase in normalized
        for phrase in phrases
    )


def build_employee_arguments(
    message: str,
    current_user_email: str | None,
) -> dict[str, Any]:
    """
    Build employee lookup arguments.

    Priority:
    1. Explicit employee ID
    2. Explicit employee code
    3. Explicit email in message
    4. Logged-in user's email
    """

    arguments: dict[str, Any] = {}

    employee_id = extract_employee_id(
        message,
    )

    employee_code = extract_employee_code(
        message,
    )

    email_from_message = extract_email(
        message,
    )

    if employee_id is not None:
        arguments["employee_id"] = employee_id

    if employee_code is not None:
        arguments["employee_code"] = employee_code

    if email_from_message:
        arguments["email"] = email_from_message

    elif current_user_email:
        arguments["email"] = current_user_email

    return arguments


def detect_tool_request(
    message: str,
    current_user_email: str | None = None,
) -> ToolRoutingResult:
    """
    Detect whether the user's message requires an MCP tool.

    The function returns:

    - whether a tool is required
    - tool name
    - operation name
    - tool arguments
    """

    normalized = message.strip().lower()

    if not normalized:
        return ToolRoutingResult(
            tool_required=False,
        )

    employee_arguments = build_employee_arguments(
        message=message,
        current_user_email=current_user_email,
    )

    # =========================================
    # EMPLOYEE TOOL — LEAVE BALANCE
    # =========================================

    leave_balance_phrases = [
        "my leave balance",
        "leave balance",
        "casual leave balance",
        "sick leave balance",
        "annual leave balance",
        "remaining leave",
        "remaining leaves",
        "how many leaves",
        "how much leave",
        "how many casual leaves",
        "how many sick leaves",
        "how many annual leaves",
        "available leaves",
        "available leave",
    ]

    if contains_any(
        normalized,
        leave_balance_phrases,
    ):
        return ToolRoutingResult(
            tool_required=True,
            tool_name="employee_tool",
            operation="get_leave_balance",
            arguments=employee_arguments,
        )

    # =========================================
    # EMPLOYEE TOOL — EMPLOYEE PROFILE
    # =========================================

    employee_profile_phrases = [
        "my employee profile",
        "employee profile",
        "employee details",
        "employee information",
        "my details",
        "my profile",
        "show employee",
        "find employee",
    ]

    if contains_any(
        normalized,
        employee_profile_phrases,
    ):
        return ToolRoutingResult(
            tool_required=True,
            tool_name="employee_tool",
            operation="get_employee",
            arguments=employee_arguments,
        )

    # =========================================
    # EMPLOYEE TOOL — DEPARTMENT
    # =========================================

    department_phrases = [
        "my department",
        "employee department",
        "which department",
        "department details",
    ]

    if contains_any(
        normalized,
        department_phrases,
    ):
        return ToolRoutingResult(
            tool_required=True,
            tool_name="employee_tool",
            operation="get_employee",
            arguments=employee_arguments,
        )

    # =========================================
    # CALENDAR TOOL — HOLIDAYS
    # =========================================

    holiday_phrases = [
        "holiday calendar",
        "company holidays",
        "upcoming holidays",
        "next holiday",
        "list holidays",
        "public holidays",
        "office holidays",
    ]

    if contains_any(
        normalized,
        holiday_phrases,
    ):
        return ToolRoutingResult(
            tool_required=True,
            tool_name="calendar_tool",
            operation="list_holidays",
            arguments={},
        )

    # =========================================
    # CALENDAR TOOL — EVENTS
    # =========================================

    calendar_event_phrases = [
        "calendar events",
        "my calendar",
        "upcoming meetings",
        "today's meetings",
        "todays meetings",
        "list meetings",
        "show meetings",
    ]

    if contains_any(
        normalized,
        calendar_event_phrases,
    ):
        arguments: dict[str, Any] = {}

        requested_date = extract_date(
            message,
        )

        if requested_date:
            arguments["date"] = requested_date

        return ToolRoutingResult(
            tool_required=True,
            tool_name="calendar_tool",
            operation="list_events",
            arguments=arguments,
        )

    # =========================================
    # EMAIL TOOL — INBOX
    # =========================================

    inbox_phrases = [
        "show my emails",
        "show emails",
        "list emails",
        "recent emails",
        "latest emails",
        "check inbox",
        "my inbox",
        "unread emails",
    ]

    if contains_any(
        normalized,
        inbox_phrases,
    ):
        return ToolRoutingResult(
            tool_required=True,
            tool_name="email_tool",
            operation="list_emails",
            arguments={
                "email": current_user_email,
            }
            if current_user_email
            else {},
        )

    # =========================================
    # EMAIL TOOL — SEND EMAIL
    # =========================================

    send_email_phrases = [
        "send email",
        "send an email",
        "email this",
        "compose email",
    ]

    if contains_any(
        normalized,
        send_email_phrases,
    ):
        recipient_email = extract_email(
            message,
        )

        arguments = {}

        if recipient_email:
            arguments["to"] = recipient_email

        return ToolRoutingResult(
            tool_required=True,
            tool_name="email_tool",
            operation="send_email",
            arguments=arguments,
        )

    # =========================================
    # PROJECT TOOL — PROJECT SUMMARY
    # =========================================

    project_summary_phrases = [
        "project summary",
        "show project summary",
        "project overview",
        "project details",
        "show project",
        "enterprise copilot project summary",
    ]

    if contains_any(
        normalized,
        project_summary_phrases,
    ):
        arguments = {}

        project_id = extract_project_id(
            message,
        )

        if project_id is not None:
            arguments["project_id"] = project_id

        return ToolRoutingResult(
            tool_required=True,
            tool_name="project_tool",
            operation="get_project_summary",
            arguments=arguments,
        )

    # =========================================
    # PROJECT TOOL — PROJECT STATUS
    # =========================================

    project_status_phrases = [
        "project status",
        "current project status",
        "project progress",
        "project health",
        "project timeline",
    ]

    if contains_any(
        normalized,
        project_status_phrases,
    ):
        arguments = {}

        project_id = extract_project_id(
            message,
        )

        if project_id is not None:
            arguments["project_id"] = project_id

        return ToolRoutingResult(
            tool_required=True,
            tool_name="project_tool",
            operation="get_project_status",
            arguments=arguments,
        )

    # =========================================
    # SUPPORT TOOL — TICKET DETAILS
    # =========================================

    ticket_phrases = [
        "ticket status",
        "support ticket",
        "show ticket",
        "ticket details",
        "issue status",
    ]

    if contains_any(
        normalized,
        ticket_phrases,
    ):
        arguments = {}

        ticket_id = extract_ticket_id(
            message,
        )

        if ticket_id is not None:
            arguments["ticket_id"] = ticket_id

        return ToolRoutingResult(
            tool_required=True,
            tool_name="support_tool",
            operation="get_ticket",
            arguments=arguments,
        )

    # =========================================
    # NO TOOL REQUIRED
    # =========================================

    return ToolRoutingResult(
        tool_required=False,
        tool_name=None,
        operation=None,
        arguments={},
    )