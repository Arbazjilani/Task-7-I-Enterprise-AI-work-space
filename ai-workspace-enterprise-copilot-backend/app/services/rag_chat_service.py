from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.agents.prompts import get_agent_prompt
from app.services.llm_service import (
    LLMResponse,
    generate_chat_completion,
)
from app.services.search_service import (
    SearchResult,
    hybrid_search,
)


@dataclass
class RAGCitation:
    document_id: int
    document_version_id: int
    version_number: int
    chunk_id: int
    chunk_key: str
    document_name: str
    filename: str
    page_number: int | None
    excerpt: str
    score: float


@dataclass
class RAGChatResponse:
    answer: str
    citations: list[RAGCitation]
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


def build_context(
    results: list[SearchResult],
) -> str:
    sections: list[str] = []

    for index, result in enumerate(
        results,
        start=1,
    ):
        page_text = (
            str(result.page_number)
            if result.page_number is not None
            else "Not available"
        )

        sections.append(
            "\n".join(
                [
                    f"[Source {index}]",
                    (
                        "Document: "
                        f"{result.document_title}"
                    ),
                    f"Filename: {result.filename}",
                    (
                        "Version: "
                        f"{result.version_number}"
                    ),
                    f"Page: {page_text}",
                    f"Chunk: {result.chunk_key}",
                    f"Content: {result.content}",
                ]
            )
        )

    return "\n\n".join(sections)


def build_citations(
    results: list[SearchResult],
) -> list[RAGCitation]:
    citations: list[RAGCitation] = []

    for result in results:
        excerpt = result.content.strip()

        if len(excerpt) > 500:
            excerpt = f"{excerpt[:497]}..."

        citations.append(
            RAGCitation(
                document_id=result.document_id,
                document_version_id=(
                    result.document_version_id
                ),
                version_number=result.version_number,
                chunk_id=result.chunk_id,
                chunk_key=result.chunk_key,
                document_name=(
                    result.document_title
                ),
                filename=result.filename,
                page_number=result.page_number,
                excerpt=excerpt,
                score=result.final_score,
            )
        )

    return citations


def answer_with_rag(
    db: Session,
    question: str,
    agent_name: str,
    document_id: int | None = None,
) -> RAGChatResponse:
    normalized_question = question.strip()

    if not normalized_question:
        raise ValueError(
            "Question cannot be empty."
        )

    search_results = hybrid_search(
        db=db,
        query=normalized_question,
        limit=5,
        candidate_limit=20,
        document_id=document_id,
        semantic_weight=0.7,
        keyword_weight=0.3,
        reranker_weight=0.5,
        minimum_score=0.10,
        enable_reranking=True,
    )

    if not search_results:
        return RAGChatResponse(
            answer=(
                "I could not find enough relevant information "
                "in the enterprise knowledge base to answer "
                "this question."
            ),
            citations=[],
            prompt_tokens=0,
            completion_tokens=0,
            total_tokens=0,
        )

    context = build_context(
        search_results
    )

    system_prompt = get_agent_prompt(
        agent_name
    )

    user_prompt = f"""
Use the enterprise knowledge-base context below to answer the question.

Knowledge-base context:

{context}

Question:

{normalized_question}

Instructions:
- Answer using only the supplied context.
- Do not mention information that does not appear in the context.
- Do not invent source names or page numbers.
- When useful, refer to the source using labels such as [Source 1].
""".strip()

    llm_response: LLMResponse = (
        generate_chat_completion(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            temperature=0.2,
            max_tokens=1000,
        )
    )

    return RAGChatResponse(
        answer=llm_response.content,
        citations=build_citations(
            search_results
        ),
        prompt_tokens=(
            llm_response.prompt_tokens
        ),
        completion_tokens=(
            llm_response.completion_tokens
        ),
        total_tokens=(
            llm_response.total_tokens
        ),
    )