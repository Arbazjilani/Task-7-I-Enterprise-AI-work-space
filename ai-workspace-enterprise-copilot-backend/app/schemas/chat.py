from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CitationResponse(BaseModel):
    id: int

    document_id: int | None = None
    document_version_id: int | None = None
    chunk_database_id: int | None = None
    version_number: int | None = None

    document_name: str
    filename: str | None = None
    page_number: int | None = None
    chunk_id: str | None = None

    excerpt: str | None = None
    score: float | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )


class ChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=5000,
    )

    conversation_id: int | None = Field(
        default=None,
        ge=1,
    )

    agent_name: str = Field(
        default="auto",
        min_length=2,
        max_length=50,
    )

    document_id: int | None = Field(
        default=None,
        ge=1,
    )


class StreamChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=5000,
    )

    conversation_id: int | None = Field(
        default=None,
        ge=1,
    )

    agent_name: str = Field(
        default="general",
        min_length=2,
        max_length=50,
    )

    document_id: int | None = Field(
        default=None,
        ge=1,
    )


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    agent_name: str | None = None

    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0

    created_at: datetime

    citations: list[CitationResponse] = Field(
        default_factory=list,
    )

    model_config = ConfigDict(
        from_attributes=True,
    )


class ChatResponse(BaseModel):
    conversation_id: int
    answer: str
    agent_name: str
    message_id: int

    citations: list[CitationResponse] = Field(
        default_factory=list,
    )

    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    tool_called: bool = False
tool_name: str | None = None
tool_operation: str | None = None
tool_execution_id: int | None = None
tool_result: object | None = None

class ConversationSummary(BaseModel):
    id: int
    title: str
    agent_name: str

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class ConversationDetail(BaseModel):
    id: int
    title: str
    agent_name: str

    created_at: datetime
    updated_at: datetime

    messages: list[MessageResponse] = Field(
        default_factory=list,
    )

    model_config = ConfigDict(
        from_attributes=True,
    )


class ConversationCreateRequest(BaseModel):
    title: str = Field(
        default="New Conversation",
        min_length=1,
        max_length=200,
    )

    agent_name: str = Field(
        default="general",
        min_length=2,
        max_length=50,
    )


class ConversationUpdateRequest(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    agent_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=50,
    )


class ConversationDeleteResponse(BaseModel):
    message: str
    conversation_id: int


class ChatErrorResponse(BaseModel):
    detail: str