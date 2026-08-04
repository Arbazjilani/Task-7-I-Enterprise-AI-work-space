from dataclasses import dataclass
from functools import lru_cache

from sentence_transformers import CrossEncoder

from app.config import settings


@dataclass
class RerankedItem:
    chunk_id: int
    score: float


@lru_cache(maxsize=1)
def get_reranker_model() -> CrossEncoder:
    """
    Load the cross-encoder model once.

    The first request may download the model.
    """
    return CrossEncoder(
        settings.reranker_model_name
    )


def normalize_reranker_scores(
    scores: list[float],
) -> list[float]:
    if not scores:
        return []

    minimum = min(scores)
    maximum = max(scores)

    if maximum == minimum:
        return [1.0 for _ in scores]

    return [
        (score - minimum) / (maximum - minimum)
        for score in scores
    ]


def rerank_chunks(
    query: str,
    candidates: list[tuple[int, str]],
) -> list[RerankedItem]:
    """
    candidates format:
        [(chunk_id, content), ...]
    """
    if not candidates:
        return []

    model = get_reranker_model()

    pairs = [
        [query, content]
        for _, content in candidates
    ]

    raw_scores = model.predict(
        pairs,
        show_progress_bar=False,
    )

    float_scores = [
        float(score)
        for score in raw_scores
    ]

    normalized_scores = normalize_reranker_scores(
        float_scores
    )

    results = [
        RerankedItem(
            chunk_id=chunk_id,
            score=normalized_score,
        )
        for (
            chunk_id,
            _,
        ), normalized_score in zip(
            candidates,
            normalized_scores,
            strict=True,
        )
    ]

    results.sort(
        key=lambda item: item.score,
        reverse=True,
    )

    return results