from functools import lru_cache
from typing import TYPE_CHECKING

from app.config import settings

if TYPE_CHECKING:
    from sentence_transformers import SentenceTransformer


@lru_cache(maxsize=1)
def get_embedding_model() -> "SentenceTransformer":
    """
    Load the embedding model once and reuse it.

    During the first execution, the model may be downloaded
    from Hugging Face.
    """
    # Importing sentence-transformers also imports PyTorch.  Keep that work out
    # of application startup so deployments that do not use RAG stay lightweight.
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(
        settings.embedding_model_name
    )


def embed_documents(
    documents: list[str],
) -> list[list[float]]:
    """
    Generate normalized vector embeddings for document chunks.
    """
    if not documents:
        return []

    cleaned_documents = [
        document.strip()
        for document in documents
        if document.strip()
    ]

    if not cleaned_documents:
        return []

    model = get_embedding_model()

    try:
        embeddings = model.encode_document(
            cleaned_documents,
            normalize_embeddings=True,
            show_progress_bar=False,
        )

    except AttributeError:
        # Compatibility with older sentence-transformers versions.
        embeddings = model.encode(
            cleaned_documents,
            normalize_embeddings=True,
            show_progress_bar=False,
        )

    return embeddings.tolist()


def embed_query(
    query: str,
) -> list[float]:
    """
    Generate a normalized vector embedding for a search query.
    """
    normalized_query = query.strip()

    if not normalized_query:
        raise ValueError(
            "The search query cannot be empty."
        )

    model = get_embedding_model()

    try:
        embedding = model.encode_query(
            normalized_query,
            normalize_embeddings=True,
            show_progress_bar=False,
        )

    except AttributeError:
        embedding = model.encode(
            normalized_query,
            normalize_embeddings=True,
            show_progress_bar=False,
        )

    return embedding.tolist()
