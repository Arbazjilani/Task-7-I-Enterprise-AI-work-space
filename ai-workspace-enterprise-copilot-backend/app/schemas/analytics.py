from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class AnalyticsOverviewResponse(BaseModel):
    total_users: int
    total_documents: int
    total_conversations: int
    total_messages: int
    total_agent_calls: int
    total_mcp_calls: int
    total_tokens: int
    estimated_cost: float
    average_response_time_ms: float
    api_error_rate: float


class AgentUsageResponse(BaseModel):
    agent_name: str
    call_count: int
    total_tokens: int
    estimated_cost: float


class DailyTokenUsageResponse(BaseModel):
    date: date
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    estimated_cost: float


class APIUsageSummaryResponse(BaseModel):
    endpoint: str
    method: str
    request_count: int
    error_count: int
    average_response_time_ms: float


class CostSummaryResponse(BaseModel):
    total_cost: float
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


class UsageLogResponse(BaseModel):
    id: int
    user_id: int
    conversation_id: int | None = None
    message_id: int | None = None
    agent_name: str
    model_name: str | None = None
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    estimated_cost: float
    response_time_ms: float
    request_type: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )