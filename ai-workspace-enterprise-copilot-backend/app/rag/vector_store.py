from functools import lru_cache
from pathlib import Path
from typing import TYPE_CHECKING, Any

from app.config import settings

if TYPE_CHECKING:
    from chromadb.api.models.Collection import Collection


@lru_cache(maxsize=1)
def get_chroma_client():
    """
    Create and reuse a persistent ChromaDB client.
    """
    persist_directory = Path(
        settings.chroma_persist_directory
    )

    persist_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    # ChromaDB brings in ONNX Runtime.  Deferring this import avoids paying its
    # memory cost for API requests that do not use document search.
    import chromadb

    return chromadb.PersistentClient(
        path=str(persist_directory)
    )


@lru_cache(maxsize=1)
def get_document_collection() -> "Collection":
    """
    Get or create the enterprise document collection.
    """
    client = get_chroma_client()

    return client.get_or_create_collection(
        name=settings.chroma_collection_name,
        metadata={
            "description": (
                "Enterprise Copilot document chunks"
            ),
            "hnsw:space": "cosine",
        },
    )


def upsert_vectors(
    ids: list[str],
    documents: list[str],
    embeddings: list[list[float]],
    metadatas: list[dict[str, Any]],
) -> None:
    """
    Insert new vectors or update existing vectors.
    """
    if not ids:
        return

    if not (
        len(ids)
        == len(documents)
        == len(embeddings)
        == len(metadatas)
    ):
        raise ValueError(
            "Vector IDs, documents, embeddings, and metadata "
            "must contain the same number of items."
        )

    collection = get_document_collection()

    collection.upsert(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
    )


def semantic_search(
    query_embedding: list[float],
    limit: int = 5,
    where: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Search ChromaDB using a query embedding.
    """
    if not query_embedding:
        raise ValueError(
            "Query embedding cannot be empty."
        )

    collection = get_document_collection()

    query_arguments: dict[str, Any] = {
        "query_embeddings": [query_embedding],
        "n_results": limit,
        "include": [
            "documents",
            "metadatas",
            "distances",
        ],
    }

    if where is not None:
        query_arguments["where"] = where

    return collection.query(
        **query_arguments
    )


def delete_document_vectors(
    document_id: int,
) -> None:
    """
    Delete all vectors belonging to one document.
    """
    collection = get_document_collection()

    collection.delete(
        where={
            "document_id": document_id,
        }
    )


def delete_version_vectors(
    document_version_id: int,
) -> None:
    """
    Delete all vectors belonging to one document version.
    """
    collection = get_document_collection()

    collection.delete(
        where={
            "document_version_id": document_version_id,
        }
    )


def get_vector_count() -> int:
    """
    Return the total number of vectors in the collection.
    """
    collection = get_document_collection()

    return collection.count()
