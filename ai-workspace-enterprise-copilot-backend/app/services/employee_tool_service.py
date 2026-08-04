from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.employee import Employee


@dataclass
class EmployeeToolResult:
    """
    Internal result returned by the employee tool.

    The MCP service can convert this result into its
    existing MCPToolResult object.
    """

    success: bool
    operation: str
    data: dict[str, Any] | None
    message: str
    error: str | None = None


def _normalize_string(
    value: object,
) -> str | None:
    """
    Convert an argument to a trimmed string.

    Returns None for missing or empty values.
    """

    if value is None:
        return None

    normalized = str(value).strip()

    if not normalized:
        return None

    return normalized


def _normalize_integer(
    value: object,
) -> int | None:
    """
    Convert an argument to an integer safely.
    """

    if value is None:
        return None

    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _employee_full_name(
    employee: Employee,
) -> str:
    """
    Build the employee's full name.
    """

    first_name = (
        getattr(
            employee,
            "first_name",
            None,
        )
        or ""
    ).strip()

    last_name = (
        getattr(
            employee,
            "last_name",
            None,
        )
        or ""
    ).strip()

    full_name = " ".join(
        part
        for part in [
            first_name,
            last_name,
        ]
        if part
    )

    return full_name or employee.email


def find_employee(
    db: Session,
    arguments: dict[str, Any],
) -> Employee | None:
    """
    Find an active employee.

    Lookup priority:

    1. employee_id
    2. employee_code
    3. email
    """

    employee_id = _normalize_integer(
        arguments.get("employee_id"),
    )

    employee_code = _normalize_string(
        arguments.get("employee_code"),
    )

    email = _normalize_string(
        arguments.get("email"),
    )

    query = db.query(Employee)

    # Restrict lookup to active employees when the
    # Employee model contains an is_active column.
    if hasattr(Employee, "is_active"):
        query = query.filter(
            Employee.is_active.is_(True),
        )

    if employee_id is not None:
        return query.filter(
            Employee.id == employee_id,
        ).first()

    if employee_code is not None:
        return query.filter(
            func.lower(
                Employee.employee_code,
            )
            == employee_code.lower(),
        ).first()

    if email is not None:
        return query.filter(
            func.lower(Employee.email)
            == email.lower(),
        ).first()

    return None


def get_employee_profile(
    db: Session,
    arguments: dict[str, Any],
) -> EmployeeToolResult:
    """
    Return an employee profile.
    """

    employee = find_employee(
        db=db,
        arguments=arguments,
    )

    if employee is None:
        return EmployeeToolResult(
            success=False,
            operation="get_employee",
            data=None,
            message=(
                "Employee not found. Provide "
                "employee_id, employee_code or email."
            ),
            error="Employee not found.",
        )

    data: dict[str, Any] = {
        "employee_id": employee.id,
        "employee_code": (
            employee.employee_code
        ),
        "employee_name": (
            _employee_full_name(employee)
        ),
        "email": employee.email,
        "department": getattr(
            employee,
            "department",
            None,
        ),
        "designation": getattr(
            employee,
            "designation",
            None,
        ),
        "is_active": getattr(
            employee,
            "is_active",
            True,
        ),
    }

    return EmployeeToolResult(
        success=True,
        operation="get_employee",
        data=data,
        message=(
            "Employee profile retrieved "
            "successfully."
        ),
    )


def get_leave_balance(
    db: Session,
    arguments: dict[str, Any],
) -> EmployeeToolResult:
    """
    Return employee leave balances.
    """

    print(
        "EMPLOYEE TOOL LOOKUP:",
        {
            "arguments": arguments,
        },
    )

    employee = find_employee(
        db=db,
        arguments=arguments,
    )

    if employee is None:
        print(
            "EMPLOYEE TOOL RESULT:",
            "employee not found",
        )

        return EmployeeToolResult(
            success=False,
            operation="get_leave_balance",
            data=None,
            message=(
                "Employee not found. Provide "
                "employee_id, employee_code or email."
            ),
            error="Employee not found.",
        )

    data: dict[str, Any] = {
        "employee_id": employee.id,
        "employee_code": (
            employee.employee_code
        ),
        "employee_name": (
            _employee_full_name(employee)
        ),
        "email": employee.email,
        "casual_leave_balance": getattr(
            employee,
            "casual_leave_balance",
            0,
        ),
        "sick_leave_balance": getattr(
            employee,
            "sick_leave_balance",
            0,
        ),
        "annual_leave_balance": getattr(
            employee,
            "annual_leave_balance",
            0,
        ),
    }

    print(
        "EMPLOYEE TOOL RESULT:",
        data,
    )

    return EmployeeToolResult(
        success=True,
        operation="get_leave_balance",
        data=data,
        message=(
            "Leave balance retrieved successfully."
        ),
    )


def execute_employee_tool(
    db: Session,
    operation: str,
    arguments: dict[str, Any] | None,
) -> EmployeeToolResult:
    """
    Execute an employee-tool operation.
    """

    safe_arguments = arguments or {}

    normalized_operation = (
        operation.strip().lower()
    )

    if normalized_operation in {
        "get_employee",
        "get_employee_profile",
        "employee_profile",
    }:
        return get_employee_profile(
            db=db,
            arguments=safe_arguments,
        )

    if normalized_operation in {
        "get_leave_balance",
        "leave_balance",
    }:
        return get_leave_balance(
            db=db,
            arguments=safe_arguments,
        )

    return EmployeeToolResult(
        success=False,
        operation=normalized_operation,
        data=None,
        message=(
            "Unsupported employee-tool operation: "
            f"{operation}"
        ),
        error=(
            "Unsupported employee-tool operation."
        ),
    )