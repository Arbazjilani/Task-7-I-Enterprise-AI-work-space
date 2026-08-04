from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.document_version import DocumentVersion
from app.rag.embeddings import embed_query
from app.rag.keyword_search import bm25_search
from app.rag.reranker import rerank_chunks
from app.rag.vector_store import semantic_search


@dataclass
class SearchResult:
    document_id: int
    document_version_id: int
    version_number: int

    chunk_id: int
    chunk_index: int
    chunk_key: str

    document_title: str
    filename: str
    file_type: str

    page_number: int | None
    content: str

    semantic_score: float
    keyword_score: float
    hybrid_score: float
    reranker_score: float
    final_score: float


def distance_to_score(
    distance: float,
) -> float:
    score = 1.0 - distance

    return max(
        0.0,
        min(1.0, score),
    )


def get_active_chunks(
    db: Session,
    document_id: int | None = None,
) -> list[DocumentChunk]:
    statement = (
        select(DocumentChunk)
        .join(
            DocumentVersion,
            DocumentChunk.document_version_id
            == DocumentVersion.id,
        )
        .join(
            Document,
            DocumentVersion.document_id
            == Document.id,
        )
        .options(
            joinedload(
                DocumentChunk.document_version
            ).joinedload(
                DocumentVersion.document
            )
        )
        .where(
            Document.is_active.is_(True),
            Document.status == "ready",
            DocumentVersion.extraction_status
            == "completed",
        )
    )

    if document_id is not None:
        statement = statement.where(
            Document.id == document_id
        )

    return list(
        db.scalars(statement).unique().all()
    )


def get_semantic_score_map(
    query: str,
    limit: int,
    document_id: int | None,
) -> dict[int, float]:
    query_embedding = embed_query(query)

    where = None

    if document_id is not None:
        where = {
            "document_id": document_id,
        }

    raw_results = semantic_search(
        query_embedding=query_embedding,
        limit=limit,
        where=where,
    )

    metadatas = (
        raw_results.get("metadatas", [[]])[0]
        if raw_results.get("metadatas")
        else []
    )

    distances = (
        raw_results.get("distances", [[]])[0]
        if raw_results.get("distances")
        else []
    )

    scores: dict[int, float] = {}

    for metadata, distance in zip(
        metadatas,
        distances,
        strict=False,
    ):
        if not metadata:
            continue

        chunk_id = int(
            metadata["chunk_id"]
        )

        scores[chunk_id] = distance_to_score(
            float(distance)
        )

    return scores


def hybrid_search(
    db: Session,
    query: str,
    limit: int = 5,
    candidate_limit: int = 20,
    document_id: int | None = None,
    semantic_weight: float = 0.7,
    keyword_weight: float = 0.3,
    reranker_weight: float = 0.5,
    minimum_score: float = 0.15,
    enable_reranking: bool = True,
) -> list[SearchResult]:
    normalized_query = query.strip()

    if not normalized_query:
        raise ValueError(
            "Search query cannot be empty."
        )

    if limit < 1 or limit > 20:
        raise ValueError(
            "Limit must be between 1 and 20."
        )

    if candidate_limit < limit:
        candidate_limit = limit

    if semantic_weight < 0 or keyword_weight < 0:
        raise ValueError(
            "Search weights cannot be negative."
        )

    weight_total = (
        semantic_weight + keyword_weight
    )

    if weight_total == 0:
        raise ValueError(
            "At least one search weight must be greater than zero."
        )

    semantic_weight = (
        semantic_weight / weight_total
    )

    keyword_weight = (
        keyword_weight / weight_total
    )

    chunks = get_active_chunks(
        db=db,
        document_id=document_id,
    )

    if not chunks:
        return []

    chunk_by_id = {
        chunk.id: chunk
        for chunk in chunks
    }

    keyword_results = bm25_search(
        query=normalized_query,
        chunks=[
            (
                chunk.id,
                chunk.content,
            )
            for chunk in chunks
        ],
        limit=candidate_limit,
    )

    keyword_score_map = {
        result.chunk_id: result.score
        for result in keyword_results
    }

    semantic_score_map = get_semantic_score_map(
        query=normalized_query,
        limit=candidate_limit,
        document_id=document_id,
    )

    candidate_ids = set(
        keyword_score_map
    ) | set(
        semantic_score_map
    )

    hybrid_scores: dict[int, float] = {}

    for chunk_id in candidate_ids:
        semantic_score = semantic_score_map.get(
            chunk_id,
            0.0,
        )

        keyword_score = keyword_score_map.get(
            chunk_id,
            0.0,
        )

        hybrid_scores[chunk_id] = (
            semantic_score * semantic_weight
            + keyword_score * keyword_weight
        )

    ordered_candidate_ids = sorted(
        candidate_ids,
        key=lambda chunk_id: hybrid_scores[
            chunk_id
        ],
        reverse=True,
    )[:candidate_limit]

    reranker_score_map: dict[int, float] = {}

    if enable_reranking and ordered_candidate_ids:
        reranked = rerank_chunks(
            query=normalized_query,
            candidates=[
                (
                    chunk_id,
                    chunk_by_id[chunk_id].content,
                )
                for chunk_id in ordered_candidate_ids
                if chunk_id in chunk_by_id
            ],
        )

        reranker_score_map = {
            result.chunk_id: result.score
            for result in reranked
        }

    results: list[SearchResult] = []

    for chunk_id in ordered_candidate_ids:
        chunk = chunk_by_id.get(chunk_id)

        if chunk is None:
            continue

        version = chunk.document_version
        document = version.document

        semantic_score = semantic_score_map.get(
            chunk_id,
            0.0,
        )

        keyword_score = keyword_score_map.get(
            chunk_id,
            0.0,
        )

        hybrid_score = hybrid_scores.get(
            chunk_id,
            0.0,
        )

        reranker_score = reranker_score_map.get(
            chunk_id,
            hybrid_score,
        )

        if enable_reranking:
            final_score = (
                hybrid_score
                * (1.0 - reranker_weight)
                + reranker_score
                * reranker_weight
            )
        else:
            final_score = hybrid_score

        if final_score < minimum_score:
            continue

        results.append(
            SearchResult(
                document_id=document.id,
                document_version_id=version.id,
                version_number=(
                    version.version_number
                ),
                chunk_id=chunk.id,
                chunk_index=chunk.chunk_index,
                chunk_key=chunk.chunk_key,
                document_title=document.title,
                filename=(
                    document.original_filename
                ),
                file_type=document.file_type,
                page_number=chunk.page_number,
                content=chunk.content,
                semantic_score=semantic_score,
                keyword_score=keyword_score,
                hybrid_score=hybrid_score,
                reranker_score=reranker_score,
                final_score=final_score,
            )
        )

    results.sort(
        key=lambda result: result.final_score,
        reverse=True,
    )

    return results[:limit]