from sqlalchemy.orm import Session

from app.config import settings
from app.models.usage_log import UsageLog
from app.monitoring.cost_calculator import (
    calculate_estimated_cost,
)


def create_usage_log(
    db: Session,
    user_id: int,
    conversation_id: int | None,
    message_id: int | None,
    agent_name: str,
    prompt_tokens: int,
    completion_tokens: int,
    total_tokens: int,
    response_time_ms: float,
    request_type: str = "chat",
    model_name: str | None = None,
) -> UsageLog:
    selected_model = (
        model_name
        or settings.groq_model
    )

    estimated_cost = calculate_estimated_cost(
        model_name=selected_model,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
    )

    usage = UsageLog(
        user_id=user_id,
        conversation_id=conversation_id,
        message_id=message_id,
        agent_name=agent_name,
        model_name=selected_model,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        total_tokens=total_tokens,
        estimated_cost=estimated_cost,
        response_time_ms=response_time_ms,
        request_type=request_type,
    )

    db.add(usage)
    db.commit()
    db.refresh(usage)

    return usage