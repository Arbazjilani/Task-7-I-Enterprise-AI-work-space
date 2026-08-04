from pydantic import BaseModel, Field


class AgentResponse(BaseModel):
    name: str
    display_name: str
    description: str
    allowed_tools: list[str] = Field(
        default_factory=list
    )
    knowledge_domains: list[str] = Field(
        default_factory=list
    )
    is_enabled: bool


class AgentRoutingRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=5000,
    )

    requested_agent: str | None = None


class AgentRoutingResponse(BaseModel):
    selected_agent: str
    display_name: str
    confidence: float
    reason: str
    matched_keywords: list[str] = Field(
        default_factory=list
    )


class AgentStatusUpdate(BaseModel):
    is_enabled: bool