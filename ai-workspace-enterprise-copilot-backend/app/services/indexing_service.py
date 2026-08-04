from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.document_chunk import DocumentChunk
from app.models.document_version import DocumentVersion
from app.rag.embeddings import embed_documents
from app.rag.vector_store import (
    delete_version_vectors,
    upsert_vectors,
)


def get_document_version(
    db: Session,
    version_id: int,
) -> DocumentVersion | None:
    statement = (
        select(DocumentVersion)
        .options(
            joinedload(DocumentVersion.document)
        )
        .where(
            DocumentVersion.id == version_id
        )
    )

    return db.scalar(statement)


def get_chunks_for_version(
    db: Session,
    version_id: int,
) -> list[DocumentChunk]:
    statement = (
        select(DocumentChunk)
        .where(
            DocumentChunk.document_version_id
            == version_id
        )
        .order_by(
            DocumentChunk.chunk_index.asc()
        )
    )

    return list(
        db.scalars(statement).all()
    )


def mark_chunks_failed(
    db: Session,
    chunks: list[DocumentChunk],
) -> None:
    for chunk in chunks:
        chunk.embedding_status = "failed"

    db.commit()


def index_document_version(
    db: Session,
    version_id: int,
) -> int:
    """
    Generate embeddings for all chunks in a document version
    and store them in ChromaDB.
    """
    version = get_document_version(
        db=db,
        version_id=version_id,
    )

    if version is None:
        raise ValueError(
            "Document version not found."
        )

    if version.document is None:
        raise ValueError(
            "Parent document was not found."
        )

    if not version.document.is_active:
        raise ValueError(
            "Inactive documents cannot be indexed."
        )

    if version.extraction_status != "completed":
        raise ValueError(
            "Only successfully extracted documents "
            "can be indexed."
        )

    chunks = get_chunks_for_version(
        db=db,
        version_id=version_id,
    )

    if not chunks:
        raise ValueError(
            "The document version has no chunks."
        )

    chunk_contents = [
        chunk.content
        for chunk in chunks
    ]

    try:
        embeddings = embed_documents(
            chunk_contents
        )

        if len(embeddings) != len(chunks):
            raise RuntimeError(
                "Embedding count does not match chunk count."
            )

        vector_ids: list[str] = []
        metadatas: list[dict[str, object]] = []

        for chunk in chunks:
            vector_id = chunk.chunk_key

            vector_ids.append(vector_id)

            metadatas.append(
                {
                    "document_id": version.document_id,
                    "document_version_id": version.id,
                    "version_number": version.version_number,
                    "chunk_id": chunk.id,
                    "chunk_index": chunk.chunk_index,
                    "chunk_key": chunk.chunk_key,
                    "document_title": (
                        version.document.title
                    ),
                    "filename": (
                        version.document.original_filename
                    ),
                    "file_type": (
                        version.document.file_type
                    ),
                    "page_number": (
                        chunk.page_number
                        if chunk.page_number is not None
                        else 0
                    ),
                }
            )

        # Remove old vectors for this version before re-indexing.
        delete_version_vectors(
            document_version_id=version.id
        )

        upsert_vectors(
            ids=vector_ids,
            documents=chunk_contents,
            embeddings=embeddings,
            metadatas=metadatas,
        )

        for chunk, vector_id in zip(
            chunks,
            vector_ids,
            strict=True,
        ):
            chunk.vector_id = vector_id
            chunk.embedding_status = "completed"

        db.commit()

        return len(chunks)

    except Exception:
        db.rollback()

        mark_chunks_failed(
            db=db,
            chunks=chunks,
        )

        raise