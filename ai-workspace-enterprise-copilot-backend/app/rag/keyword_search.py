import re
from dataclasses import dataclass

from rank_bm25 import BM25Okapi


@dataclass
class KeywordCandidate:
    chunk_id: int
    content: str
    score: float


def tokenize_text(text: str) -> list[str]:
    """
    Convert text into normalized keyword tokens.
    """
    return re.findall(
        r"[a-zA-Z0-9]+",
        text.lower(),
    )


def normalize_scores(
    scores: list[float],
) -> list[float]:
    if not scores:
        return []

    minimum = min(scores)
    maximum = max(scores)

    if maximum == minimum:
        if maximum <= 0:
            return [0.0 for _ in scores]

        return [1.0 for _ in scores]

    return [
        (score - minimum) / (maximum - minimum)
        for score in scores
    ]


def bm25_search(
    query: str,
    chunks: list[tuple[int, str]],
    limit: int = 10,
) -> list[KeywordCandidate]:
    """
    Search PostgreSQL chunks using BM25 keyword ranking.

    chunks format:
        [(chunk_id, chunk_content), ...]
    """
    normalized_query = query.strip()

    if not normalized_query:
        raise ValueError(
            "Keyword search query cannot be empty."
        )

    if not chunks:
        return []

    query_tokens = tokenize_text(
        normalized_query
    )

    if not query_tokens:
        return []

    tokenized_chunks = [
        tokenize_text(content)
        for _, content in chunks
    ]

    bm25 = BM25Okapi(
        tokenized_chunks
    )

    raw_scores = list(
        bm25.get_scores(query_tokens)
    )

    normalized_scores = normalize_scores(
        [float(score) for score in raw_scores]
    )

    candidates = [
        KeywordCandidate(
            chunk_id=chunk_id,
            content=content,
            score=normalized_score,
        )
        for (
            chunk_id,
            content,
        ), normalized_score in zip(
            chunks,
            normalized_scores,
            strict=True,
        )
    ]

    candidates.sort(
        key=lambda result: result.score,
        reverse=True,
    )

    return candidates[:limit]