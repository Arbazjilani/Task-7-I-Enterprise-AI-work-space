from datetime import datetime, timedelta, timezone

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.models.api_usage import APIUsage
from app.models.conversation import Conversation
from app.models.document import Document
from app.models.mcp_execution import MCPExecution
from app.models.message import Message
from app.models.usage_log import UsageLog
from app.models.user import User


def get_overview(
    db: Session,
) -> dict[str, int | float]:
    total_users = db.scalar(
        select(func.count(User.id))
    ) or 0

    total_documents = db.scalar(
        select(func.count(Document.id)).where(
            Document.is_active.is_(True)
        )
    ) or 0

    total_conversations = db.scalar(
        select(func.count(Conversation.id))
    ) or 0

    total_messages = db.scalar(
        select(func.count(Message.id))
    ) or 0

    usage_totals = db.execute(
        select(
            func.count(UsageLog.id),
            func.coalesce(
                func.sum(UsageLog.total_tokens),
                0,
            ),
            func.coalesce(
                func.sum(UsageLog.estimated_cost),
                0.0,
            ),
            func.coalesce(
                func.avg(UsageLog.response_time_ms),
                0.0,
            ),
        )
    ).one()

    total_agent_calls = int(
        usage_totals[0]
    )

    total_tokens = int(
        usage_totals[1]
    )

    estimated_cost = float(
        usage_totals[2]
    )

    average_response_time_ms = float(
        usage_totals[3]
    )

    total_mcp_calls = db.scalar(
        select(func.count(MCPExecution.id))
    ) or 0

    api_totals = db.execute(
        select(
            func.count(APIUsage.id),
            func.coalesce(
                func.sum(
                    case(
                        (
                            APIUsage.status_code >= 400,
                            1,
                        ),
                        else_=0,
                    )
                ),
                0,
            ),
        )
    ).one()

    total_api_requests = int(
        api_totals[0]
    )

    total_api_errors = int(
        api_totals[1]
    )

    api_error_rate = (
        total_api_errors / total_api_requests * 100
        if total_api_requests
        else 0.0
    )

    return {
        "total_users": total_users,
        "total_documents": total_documents,
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "total_agent_calls": total_agent_calls,
        "total_mcp_calls": total_mcp_calls,
        "total_tokens": total_tokens,
        "estimated_cost": round(
            estimated_cost,
            8,
        ),
        "average_response_time_ms": round(
            average_response_time_ms,
            2,
        ),
        "api_error_rate": round(
            api_error_rate,
            2,
        ),
    }


def get_agent_usage(
    db: Session,
) -> list[dict[str, int | float | str]]:
    rows = db.execute(
        select(
            UsageLog.agent_name,
            func.count(UsageLog.id),
            func.coalesce(
                func.sum(UsageLog.total_tokens),
                0,
            ),
            func.coalesce(
                func.sum(UsageLog.estimated_cost),
                0.0,
            ),
        )
        .group_by(UsageLog.agent_name)
        .order_by(
            func.count(UsageLog.id).desc()
        )
    ).all()

    return [
        {
            "agent_name": row[0],
            "call_count": int(row[1]),
            "total_tokens": int(row[2]),
            "estimated_cost": round(
                float(row[3]),
                8,
            ),
        }
        for row in rows
    ]


def get_daily_token_usage(
    db: Session,
    days: int = 30,
) -> list[dict[str, object]]:
    start_date = datetime.now(
        timezone.utc
    ) - timedelta(days=days)

    date_column = func.date(
        UsageLog.created_at
    )

    rows = db.execute(
        select(
            date_column,
            func.coalesce(
                func.sum(UsageLog.prompt_tokens),
                0,
            ),
            func.coalesce(
                func.sum(UsageLog.completion_tokens),
                0,
            ),
            func.coalesce(
                func.sum(UsageLog.total_tokens),
                0,
            ),
            func.coalesce(
                func.sum(UsageLog.estimated_cost),
                0.0,
            ),
        )
        .where(
            UsageLog.created_at >= start_date
        )
        .group_by(date_column)
        .order_by(date_column)
    ).all()

    return [
        {
            "date": row[0],
            "prompt_tokens": int(row[1]),
            "completion_tokens": int(row[2]),
            "total_tokens": int(row[3]),
            "estimated_cost": round(
                float(row[4]),
                8,
            ),
        }
        for row in rows
    ]


def get_api_usage_summary(
    db: Session,
) -> list[dict[str, object]]:
    rows = db.execute(
        select(
            APIUsage.endpoint,
            APIUsage.method,
            func.count(APIUsage.id),
            func.coalesce(
                func.sum(
                    case(
                        (
                            APIUsage.status_code >= 400,
                            1,
                        ),
                        else_=0,
                    )
                ),
                0,
            ),
            func.coalesce(
                func.avg(
                    APIUsage.response_time_ms
                ),
                0.0,
            ),
        )
        .group_by(
            APIUsage.endpoint,
            APIUsage.method,
        )
        .order_by(
            func.count(APIUsage.id).desc()
        )
    ).all()

    return [
        {
            "endpoint": row[0],
            "method": row[1],
            "request_count": int(row[2]),
            "error_count": int(row[3]),
            "average_response_time_ms": round(
                float(row[4]),
                2,
            ),
        }
        for row in rows
    ]