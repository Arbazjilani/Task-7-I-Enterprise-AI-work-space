import json
from collections.abc import AsyncIterator
from time import perf_counter

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.agents.orchestrator import route_message
from app.auth.dependencies import CurrentUser, DatabaseSession
from app.database import SessionLocal
from app.models.conversation import Conversation
from app.models.user import User
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ConversationDetail,
    ConversationSummary,
    StreamChatRequest,
)
from app.services.chat_service import (
    create_conversation,
    get_conversation_for_user,
    list_conversations_for_user,
    save_citations,
    save_message,
    stream_answer_words,
)
from app.services.mcp_service import (
    MCPExecutionContext,
    execute_and_audit_mcp_tool,
)
from app.services.rag_chat_service import answer_with_rag
from app.services.tool_answer_service import (
    format_tool_result_for_chat,
)
from app.services.tool_routing_service import (
    detect_tool_request,
)
from app.services.usage_service import create_usage_log


router = APIRouter(
    prefix="/api",
    tags=["AI Chat"],
)


def format_sse(
    event: str,
    data: dict[str, object],
) -> str:
    """
    Format data as a Server-Sent Event.
    """
    payload = {
        "event": event,
        **data,
    }

    return (
        f"data: "
        f"{json.dumps(payload, default=str)}"
        f"\n\n"
    )


def resolve_agent(
    message: str,
    requested_agent: str,
) -> tuple[str, float, str, list[str]]:
    """
    Select an agent using manual selection or
    automatic keyword routing.
    """
    try:
        routing_result = route_message(
            message=message,
            requested_agent=requested_agent,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    return (
        routing_result.agent.name,
        routing_result.confidence,
        routing_result.reason,
        routing_result.matched_keywords,
    )


def resolve_conversation(
    db: Session,
    current_user: User,
    message: str,
    agent_name: str,
    conversation_id: int | None,
) -> Conversation:
    """
    Load an existing user-owned conversation
    or create a new conversation.
    """
    if conversation_id is not None:
        conversation = get_conversation_for_user(
            db=db,
            conversation_id=conversation_id,
            user_id=current_user.id,
        )

        if conversation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found.",
            )

        return conversation

    return create_conversation(
        db=db,
        user=current_user,
        first_message=message,
        agent_name=agent_name,
    )


def record_usage_safely(
    db: Session,
    *,
    user_id: int,
    conversation_id: int,
    message_id: int,
    agent_name: str,
    prompt_tokens: int,
    completion_tokens: int,
    total_tokens: int,
    response_time_ms: float,
    request_type: str,
) -> None:
    """
    Record monitoring data without causing a successful
    chat response to fail when analytics logging fails.
    """
    try:
        create_usage_log(
            db=db,
            user_id=user_id,
            conversation_id=conversation_id,
            message_id=message_id,
            agent_name=agent_name,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            response_time_ms=response_time_ms,
            request_type=request_type,
        )

    except Exception:
        db.rollback()


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Send an enterprise AI chat message",
)
def chat(
    payload: ChatRequest,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> ChatResponse:
    """
    Process a normal non-streaming chat request.

    Processing order:

    1. Route the request to an agent.
    2. Create or retrieve a conversation.
    3. Save the user's message.
    4. Detect an MCP tool request.
    5. Execute MCP or use RAG.
    6. Save the assistant message.
    7. Record token, cost and response-time usage.
    """
    started_at = perf_counter()

    (
        agent_name,
        _routing_confidence,
        _routing_reason,
        _matched_keywords,
    ) = resolve_agent(
        message=payload.message,
        requested_agent=payload.agent_name,
    )

    conversation = resolve_conversation(
        db=db,
        current_user=current_user,
        message=payload.message,
        agent_name=agent_name,
        conversation_id=payload.conversation_id,
    )

    save_message(
        db=db,
        conversation_id=conversation.id,
        role="user",
        content=payload.message,
        agent_name=agent_name,
    )

    tool_routing = detect_tool_request(
        message=payload.message,
        current_user_email=current_user.email,
    )

    # MCP tool execution branch.
    if (
        tool_routing.tool_required
        and tool_routing.tool_name is not None
        and tool_routing.operation is not None
    ):
        context = MCPExecutionContext(
            user_id=current_user.id,
            user_role=current_user.role.name,
            agent_name=agent_name,
            conversation_id=conversation.id,
        )

        try:
            audited_result = execute_and_audit_mcp_tool(
                db=db,
                context=context,
                tool_name=tool_routing.tool_name,
                operation=tool_routing.operation,
                arguments=tool_routing.arguments or {},
            )

        except Exception as error:
            db.rollback()

            raise HTTPException(
                status_code=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
                detail=(
                    "MCP tool execution failed: "
                    f"{error}"
                ),
            ) from error

        tool_result = audited_result.result

        answer = format_tool_result_for_chat(
            tool_result
        )

        assistant_message = save_message(
            db=db,
            conversation_id=conversation.id,
            role="assistant",
            content=answer,
            agent_name=agent_name,
            prompt_tokens=0,
            completion_tokens=0,
        )

        response_time_ms = (
            perf_counter() - started_at
        ) * 1000

        record_usage_safely(
            db=db,
            user_id=current_user.id,
            conversation_id=conversation.id,
            message_id=assistant_message.id,
            agent_name=agent_name,
            prompt_tokens=0,
            completion_tokens=0,
            total_tokens=0,
            response_time_ms=response_time_ms,
            request_type="mcp_chat",
        )

        return ChatResponse(
            conversation_id=conversation.id,
            answer=answer,
            agent_name=agent_name,
            message_id=assistant_message.id,
            citations=[],
            prompt_tokens=0,
            completion_tokens=0,
            total_tokens=0,
            tool_called=True,
            tool_name=tool_result.tool_name,
            tool_operation=tool_result.operation,
            tool_execution_id=(
                audited_result.execution.id
            ),
            tool_result=tool_result.data,
        )

    # RAG and Groq response branch.
    try:
        rag_response = answer_with_rag(
            db=db,
            question=payload.message,
            agent_name=agent_name,
            document_id=payload.document_id,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "AI response generation failed: "
                f"{error}"
            ),
        ) from error

    assistant_message = save_message(
        db=db,
        conversation_id=conversation.id,
        role="assistant",
        content=rag_response.answer,
        agent_name=agent_name,
        prompt_tokens=rag_response.prompt_tokens,
        completion_tokens=(
            rag_response.completion_tokens
        ),
    )

    saved_citations = save_citations(
        db=db,
        message_id=assistant_message.id,
        citations=rag_response.citations,
    )

    response_time_ms = (
        perf_counter() - started_at
    ) * 1000

    record_usage_safely(
        db=db,
        user_id=current_user.id,
        conversation_id=conversation.id,
        message_id=assistant_message.id,
        agent_name=agent_name,
        prompt_tokens=rag_response.prompt_tokens,
        completion_tokens=(
            rag_response.completion_tokens
        ),
        total_tokens=rag_response.total_tokens,
        response_time_ms=response_time_ms,
        request_type="rag_chat",
    )

    return ChatResponse(
        conversation_id=conversation.id,
        answer=rag_response.answer,
        agent_name=agent_name,
        message_id=assistant_message.id,
        citations=saved_citations,
        prompt_tokens=rag_response.prompt_tokens,
        completion_tokens=(
            rag_response.completion_tokens
        ),
        total_tokens=rag_response.total_tokens,
        tool_called=False,
        tool_name=None,
        tool_operation=None,
        tool_execution_id=None,
        tool_result=None,
    )


@router.post(
    "/chat/stream",
    response_class=StreamingResponse,
    summary="Stream an enterprise AI chat response",
)
def stream_chat(
    payload: StreamChatRequest,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> StreamingResponse:
    """
    Stream an MCP or RAG response using
    Server-Sent Events.
    """
    started_at = perf_counter()

    (
        agent_name,
        routing_confidence,
        routing_reason,
        matched_keywords,
    ) = resolve_agent(
        message=payload.message,
        requested_agent=payload.agent_name,
    )

    conversation = resolve_conversation(
        db=db,
        current_user=current_user,
        message=payload.message,
        agent_name=agent_name,
        conversation_id=payload.conversation_id,
    )

    conversation_id = conversation.id
    user_id = current_user.id
    user_role = current_user.role.name
    user_email = current_user.email
    user_message = payload.message
    document_id = payload.document_id

    save_message(
        db=db,
        conversation_id=conversation_id,
        role="user",
        content=user_message,
        agent_name=agent_name,
    )

    async def event_generator() -> AsyncIterator[str]:
        try:
            yield format_sse(
                event="start",
                data={
                    "conversation_id": conversation_id,
                    "agent_name": agent_name,
                    "routing_confidence": (
                        routing_confidence
                    ),
                    "routing_reason": routing_reason,
                    "matched_keywords": matched_keywords,
                },
            )

            with SessionLocal() as stream_db:
                owned_conversation = (
                    get_conversation_for_user(
                        db=stream_db,
                        conversation_id=conversation_id,
                        user_id=user_id,
                    )
                )

                if owned_conversation is None:
                    yield format_sse(
                        event="error",
                        data={
                            "message": (
                                "Conversation no longer exists."
                            ),
                        },
                    )
                    return

                tool_routing = detect_tool_request(
                    message=user_message,
                    current_user_email=user_email,
                )

                # Streaming MCP branch.
                if (
                    tool_routing.tool_required
                    and tool_routing.tool_name
                    is not None
                    and tool_routing.operation
                    is not None
                ):
                    context = MCPExecutionContext(
                        user_id=user_id,
                        user_role=user_role,
                        agent_name=agent_name,
                        conversation_id=conversation_id,
                    )

                    audited_result = (
                        execute_and_audit_mcp_tool(
                            db=stream_db,
                            context=context,
                            tool_name=(
                                tool_routing.tool_name
                            ),
                            operation=(
                                tool_routing.operation
                            ),
                            arguments=(
                                tool_routing.arguments
                                or {}
                            ),
                        )
                    )

                    tool_result = audited_result.result

                    answer = format_tool_result_for_chat(
                        tool_result
                    )

                    full_answer = ""

                    async for chunk in stream_answer_words(
                        answer
                    ):
                        full_answer += chunk

                        yield format_sse(
                            event="token",
                            data={
                                "content": chunk,
                            },
                        )

                    assistant_message = save_message(
                        db=stream_db,
                        conversation_id=conversation_id,
                        role="assistant",
                        content=full_answer,
                        agent_name=agent_name,
                        prompt_tokens=0,
                        completion_tokens=0,
                    )

                    response_time_ms = (
                        perf_counter() - started_at
                    ) * 1000

                    record_usage_safely(
                        db=stream_db,
                        user_id=user_id,
                        conversation_id=(
                            conversation_id
                        ),
                        message_id=(
                            assistant_message.id
                        ),
                        agent_name=agent_name,
                        prompt_tokens=0,
                        completion_tokens=0,
                        total_tokens=0,
                        response_time_ms=(
                            response_time_ms
                        ),
                        request_type=(
                            "mcp_chat_stream"
                        ),
                    )

                    yield format_sse(
                        event="tool",
                        data={
                            "tool_called": True,
                            "tool_name": (
                                tool_result.tool_name
                            ),
                            "operation": (
                                tool_result.operation
                            ),
                            "execution_id": (
                                audited_result.execution.id
                            ),
                            "execution_time_ms": (
                                audited_result
                                .execution_time_ms
                            ),
                            "success": (
                                tool_result.success
                            ),
                            "result": (
                                tool_result.data
                            ),
                            "error": (
                                tool_result.error
                            ),
                        },
                    )

                    yield format_sse(
                        event="done",
                        data={
                            "conversation_id": (
                                conversation_id
                            ),
                            "message_id": (
                                assistant_message.id
                            ),
                            "agent_name": agent_name,
                            "prompt_tokens": 0,
                            "completion_tokens": 0,
                            "total_tokens": 0,
                            "tool_called": True,
                            "response_time_ms": (
                                response_time_ms
                            ),
                        },
                    )

                    return

                # Streaming RAG branch.
                rag_response = answer_with_rag(
                    db=stream_db,
                    question=user_message,
                    agent_name=agent_name,
                    document_id=document_id,
                )

                full_answer = ""

                async for chunk in stream_answer_words(
                    rag_response.answer
                ):
                    full_answer += chunk

                    yield format_sse(
                        event="token",
                        data={
                            "content": chunk,
                        },
                    )

                assistant_message = save_message(
                    db=stream_db,
                    conversation_id=conversation_id,
                    role="assistant",
                    content=full_answer,
                    agent_name=agent_name,
                    prompt_tokens=(
                        rag_response.prompt_tokens
                    ),
                    completion_tokens=(
                        rag_response.completion_tokens
                    ),
                )

                saved_citations = save_citations(
                    db=stream_db,
                    message_id=assistant_message.id,
                    citations=rag_response.citations,
                )

                response_time_ms = (
                    perf_counter() - started_at
                ) * 1000

                record_usage_safely(
                    db=stream_db,
                    user_id=user_id,
                    conversation_id=conversation_id,
                    message_id=assistant_message.id,
                    agent_name=agent_name,
                    prompt_tokens=(
                        rag_response.prompt_tokens
                    ),
                    completion_tokens=(
                        rag_response.completion_tokens
                    ),
                    total_tokens=(
                        rag_response.total_tokens
                    ),
                    response_time_ms=response_time_ms,
                    request_type="rag_chat_stream",
                )

                citation_payload = [
                    {
                        "id": citation.id,
                        "document_id": (
                            citation.document_id
                        ),
                        "document_version_id": (
                            citation.document_version_id
                        ),
                        "chunk_database_id": (
                            citation.chunk_database_id
                        ),
                        "version_number": (
                            citation.version_number
                        ),
                        "document_name": (
                            citation.document_name
                        ),
                        "filename": (
                            citation.filename
                        ),
                        "page_number": (
                            citation.page_number
                        ),
                        "chunk_id": (
                            citation.chunk_id
                        ),
                        "excerpt": (
                            citation.excerpt
                        ),
                        "score": citation.score,
                    }
                    for citation in saved_citations
                ]

                yield format_sse(
                    event="citations",
                    data={
                        "citations": citation_payload,
                    },
                )

                yield format_sse(
                    event="done",
                    data={
                        "conversation_id": (
                            conversation_id
                        ),
                        "message_id": (
                            assistant_message.id
                        ),
                        "agent_name": agent_name,
                        "prompt_tokens": (
                            rag_response.prompt_tokens
                        ),
                        "completion_tokens": (
                            rag_response.completion_tokens
                        ),
                        "total_tokens": (
                            rag_response.total_tokens
                        ),
                        "tool_called": False,
                        "response_time_ms": (
                            response_time_ms
                        ),
                    },
                )

        except ValueError as error:
            yield format_sse(
                event="error",
                data={
                    "message": str(error),
                },
            )

        except Exception as error:
            yield format_sse(
                event="error",
                data={
                    "message": (
                        "Streaming AI response failed."
                    ),
                    "details": str(error),
                },
            )

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get(
    "/conversations",
    response_model=list[ConversationSummary],
    summary="List the current user's conversations",
)
def list_conversations(
    db: DatabaseSession,
    current_user: CurrentUser,
) -> list[Conversation]:
    return list_conversations_for_user(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/conversations/{conversation_id}",
    response_model=ConversationDetail,
    summary="Get a conversation and its messages",
)
def get_conversation(
    conversation_id: int,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> Conversation:
    conversation = get_conversation_for_user(
        db=db,
        conversation_id=conversation_id,
        user_id=current_user.id,
    )

    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    return conversation


@router.delete(
    "/conversations/{conversation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a conversation",
)
def delete_conversation(
    conversation_id: int,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> None:
    conversation = get_conversation_for_user(
        db=db,
        conversation_id=conversation_id,
        user_id=current_user.id,
    )

    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    db.delete(conversation)
    db.commit()