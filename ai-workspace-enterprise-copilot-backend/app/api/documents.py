from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)

from app.auth.dependencies import (
    CurrentUser,
    DatabaseSession,
    require_roles,
)
from app.config import settings
from app.models.document import Document
from app.models.user import User
from app.rag.vector_store import (
    delete_document_vectors,
    get_vector_count,
)
from app.schemas.document import (
    DocumentDetailResponse,
    DocumentResponse,
    DocumentUploadResponse,
    HybridSearchRequest,
    HybridSearchResponse,
    HybridSearchResultResponse,
    IndexDocumentResponse,
    VectorStoreStatusResponse,
)
from app.services.document_service import (
    create_document_and_version,
    get_document_by_id,
    list_documents,
)
from app.services.indexing_service import (
    index_document_version,
)
from app.services.search_service import (
    hybrid_search,
)


router = APIRouter(
    prefix="/api/documents",
    tags=["Knowledge Base"],
)


DocumentManager = Annotated[
    User,
    Depends(
        require_roles(
            "admin",
            "manager",
        )
    ),
]


@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    db: DatabaseSession,
    current_user: DocumentManager,
    file: UploadFile = File(...),
    title: str | None = Form(default=None),
) -> DocumentUploadResponse:
    """
    Upload a new PDF, DOCX, Markdown, or TXT document.

    The file is:
    1. Saved locally.
    2. Extracted into text.
    3. Split into chunks.
    4. Stored in PostgreSQL.
    5. Indexed in ChromaDB.
    """
    try:
        file_content = await file.read()

        document, version, character_count = (
            create_document_and_version(
                db=db,
                upload_file=file,
                file_content=file_content,
                current_user=current_user,
                title=title,
            )
        )

        if version.extraction_status == "completed":
            index_document_version(
                db=db,
                version_id=version.id,
            )

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Document upload or indexing failed: "
                f"{error}"
            ),
        ) from error

    finally:
        await file.close()

    if version.extraction_status == "completed":
        message = (
            "Document uploaded, processed, "
            "and indexed successfully."
        )
    else:
        message = (
            "Document uploaded, but text extraction failed."
        )

    return DocumentUploadResponse(
        document=document,
        version=version,
        extracted_characters=character_count,
        message=message,
    )


@router.get(
    "",
    response_model=list[DocumentResponse],
)
def get_documents(
    db: DatabaseSession,
    _: CurrentUser,
    skip: int = Query(
        default=0,
        ge=0,
    ),
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
) -> list[Document]:
    """
    Return all active knowledge-base documents.
    """
    return list_documents(
        db=db,
        skip=skip,
        limit=limit,
    )


@router.post(
    "/search",
    response_model=HybridSearchResponse,
)
def search_documents(
    payload: HybridSearchRequest,
    db: DatabaseSession,
    _: CurrentUser,
) -> HybridSearchResponse:
    """
    Search document chunks using:

    - ChromaDB semantic search
    - BM25 keyword search
    - Hybrid scoring
    - Optional cross-encoder re-ranking
    """
    try:
        results = hybrid_search(
            db=db,
            query=payload.query,
            limit=payload.limit,
            candidate_limit=payload.candidate_limit,
            document_id=payload.document_id,
            semantic_weight=payload.semantic_weight,
            keyword_weight=payload.keyword_weight,
            reranker_weight=payload.reranker_weight,
            minimum_score=payload.minimum_score,
            enable_reranking=payload.enable_reranking,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hybrid search failed: {error}",
        ) from error

    response_results = [
        HybridSearchResultResponse(
            document_id=result.document_id,
            document_version_id=(
                result.document_version_id
            ),
            version_number=result.version_number,
            chunk_id=result.chunk_id,
            chunk_index=result.chunk_index,
            chunk_key=result.chunk_key,
            document_title=result.document_title,
            filename=result.filename,
            file_type=result.file_type,
            page_number=result.page_number,
            content=result.content,
            semantic_score=result.semantic_score,
            keyword_score=result.keyword_score,
            hybrid_score=result.hybrid_score,
            reranker_score=result.reranker_score,
            final_score=result.final_score,
        )
        for result in results
    ]

    return HybridSearchResponse(
        query=payload.query,
        total_results=len(response_results),
        results=response_results,
    )


@router.get(
    "/vector-status",
    response_model=VectorStoreStatusResponse,
)
def vector_store_status(
    _: CurrentUser,
) -> VectorStoreStatusResponse:
    """
    Return ChromaDB collection information and vector count.
    """
    try:
        vector_count = get_vector_count()

    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Vector store is unavailable: "
                f"{error}"
            ),
        ) from error

    return VectorStoreStatusResponse(
        collection_name=(
            settings.chroma_collection_name
        ),
        vector_count=vector_count,
        status="available",
    )


@router.post(
    "/{document_id}/index",
    response_model=IndexDocumentResponse,
)
def index_document(
    document_id: int,
    db: DatabaseSession,
    _: DocumentManager,
) -> IndexDocumentResponse:
    """
    Manually index or re-index the latest version
    of a document into ChromaDB.
    """
    document = get_document_by_id(
        db=db,
        document_id=document_id,
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    if not document.versions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document has no versions.",
        )

    latest_version = max(
        document.versions,
        key=lambda version: version.version_number,
    )

    try:
        indexed_chunks = index_document_version(
            db=db,
            version_id=latest_version.id,
        )

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Document indexing failed: "
                f"{error}"
            ),
        ) from error

    return IndexDocumentResponse(
        document_id=document.id,
        version_id=latest_version.id,
        indexed_chunks=indexed_chunks,
        message="Document chunks indexed successfully.",
    )


@router.post(
    "/{document_id}/versions",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document_version(
    document_id: int,
    db: DatabaseSession,
    current_user: DocumentManager,
    file: UploadFile = File(...),
) -> DocumentUploadResponse:
    """
    Upload a new version of an existing document.

    The new version is extracted, chunked, saved,
    and indexed into ChromaDB.
    """
    document = get_document_by_id(
        db=db,
        document_id=document_id,
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    try:
        file_content = await file.read()

        updated_document, version, character_count = (
            create_document_and_version(
                db=db,
                upload_file=file,
                file_content=file_content,
                current_user=current_user,
                existing_document=document,
            )
        )

        if version.extraction_status == "completed":
            index_document_version(
                db=db,
                version_id=version.id,
            )

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Document version upload or indexing failed: "
                f"{error}"
            ),
        ) from error

    finally:
        await file.close()

    if version.extraction_status == "completed":
        message = (
            "New document version uploaded "
            "and indexed successfully."
        )
    else:
        message = (
            "Document version uploaded, "
            "but text extraction failed."
        )

    return DocumentUploadResponse(
        document=updated_document,
        version=version,
        extracted_characters=character_count,
        message=message,
    )


@router.get(
    "/{document_id}",
    response_model=DocumentDetailResponse,
)
def get_document(
    document_id: int,
    db: DatabaseSession,
    _: CurrentUser,
) -> Document:
    """
    Return one active document and its version history.
    """
    document = get_document_by_id(
        db=db,
        document_id=document_id,
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    return document


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def deactivate_document(
    document_id: int,
    db: DatabaseSession,
    _: DocumentManager,
) -> None:
    """
    Soft-delete a document and remove its vectors
    from ChromaDB.
    """
    document = get_document_by_id(
        db=db,
        document_id=document_id,
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    try:
        delete_document_vectors(
            document_id=document.id
        )

        document.is_active = False
        document.status = "inactive"

        db.commit()

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Could not deactivate document: "
                f"{error}"
            ),
        ) from error