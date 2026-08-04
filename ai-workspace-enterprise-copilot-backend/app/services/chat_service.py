import asyncio
from collections.abc import AsyncIterator
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User
from app.models.citation import Citation

from app.agents.registry import (
    get_enabled_agent_names,
)


def get_allowed_agents() -> set[str]:
    return get_enabled_agent_names()

ALLOWED_AGENTS = get_enabled_agent_names()


def create_conversation(
    db: Session,
    user: User,
    first_message: str,
    agent_name: str,
) -> Conversation:
    title = first_message.strip()

    if len(title) > 60:
        title = f"{title[:57]}..."

    conversation = Conversation(
        title=title or "New Conversation",
        user_id=user.id,
        agent_name=agent_name,
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


def get_conversation_for_user(
    db: Session,
    conversation_id: int,
    user_id: int,
) -> Conversation | None:
    statement = (
        select(Conversation)
        .options(
            selectinload(Conversation.messages)
            .selectinload(Message.citations)
        )
        .where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        )
    )

    return db.scalar(statement)


def list_conversations_for_user(
    db: Session,
    user_id: int,
) -> list[Conversation]:
    statement = (
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
    )

    return list(db.scalars(statement).all())


def save_message(
    db: Session,
    conversation_id: int,
    role: str,
    content: str,
    agent_name: str | None = None,
    prompt_tokens: int = 0,
    completion_tokens: int = 0,
) -> Message:
    total_tokens = prompt_tokens + completion_tokens

    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
        agent_name=agent_name,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        total_tokens=total_tokens,
    )

    db.add(message)

    conversation = db.get(
        Conversation,
        conversation_id,
    )

    if conversation is not None:
        conversation.updated_at = datetime.now(timezone.utc)

        if agent_name:
            conversation.agent_name = agent_name

    db.commit()
    db.refresh(message)

    return message

def generate_basic_answer(
    user_message: str,
    agent_name: str,
) -> str:
    normalized = user_message.strip().lower()

    if agent_name == "hr":
        return (
            "The HR Agent received your question. "
            "RAG-based HR policy search will be connected in the next stage. "
            f"Your question was: {user_message}"
        )

    if agent_name == "support":
        return (
            "The Support Agent received your request. "
            "Ticket search and support recommendations will be added later. "
            f"Your request was: {user_message}"
        )

    if agent_name == "project":
        return (
            "The Project Agent received your request. "
            "Project tools and task data will be connected later. "
            f"Your request was: {user_message}"
        )

    if agent_name == "documentation":
        return (
            "The Documentation Agent received your request. "
            "Document search and generation will be connected later. "
            f"Your request was: {user_message}"
        )

    if "hello" in normalized or "hi" in normalized:
        return (
            "Hello. I am the Enterprise Copilot. "
            "You can ask about HR, support, projects, or documentation."
        )

    return (
        "I received your message. The current chat module is working. "
        "LLM responses, RAG context, citations, and MCP tools "
        "will be connected in the next stages."
    )


def estimate_tokens(text: str) -> int:
    words = text.split()

    if not words:
        return 0

    return max(1, int(len(words) * 1.3))

async def stream_answer_words(
    answer: str,
    delay_seconds: float = 0.05,
) -> AsyncIterator[str]:
    """
    Temporarily streams a generated answer word by word.

    This will later be replaced by the actual LLM streaming API.
    """
    words = answer.split()

    for index, word in enumerate(words):
        separator = "" if index == 0 else " "

        yield f"{separator}{word}"

        # Gives the event loop a chance to send the chunk.
        await asyncio.sleep(delay_seconds)

def save_citations(
    db: Session,
    message_id: int,
    citations: list[object],
) -> list[Citation]:
    saved_citations: list[Citation] = []

    for citation_data in citations:
        citation = Citation(
            message_id=message_id,
            document_id=(
                citation_data.document_id
            ),
            document_version_id=(
                citation_data.document_version_id
            ),
            chunk_database_id=(
                citation_data.chunk_id
            ),
            version_number=(
                citation_data.version_number
            ),
            document_name=(
                citation_data.document_name
            ),
            filename=citation_data.filename,
            page_number=(
                citation_data.page_number
            ),
            chunk_id=citation_data.chunk_key,
            excerpt=citation_data.excerpt,
            score=citation_data.score,
        )

        db.add(citation)
        saved_citations.append(citation)

    db.commit()

    for citation in saved_citations:
        db.refresh(citation)

    return saved_citations