from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DocumentVersionResponse(BaseModel):
    id: int
    version_number: int
    stored_filename: str
    checksum: str

    mime_type: str | None = None
    file_size: int

    extraction_status: str
    extraction_error: str | None = None

    chunk_count: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class DocumentResponse(BaseModel):
    id: int
    title: str
    original_filename: str
    file_type: str
    status: str
    is_active: bool
    uploaded_by_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class DocumentDetailResponse(DocumentResponse):
    versions: list[DocumentVersionResponse] = Field(
        default_factory=list
    )

    model_config = ConfigDict(
        from_attributes=True
    )


class DocumentUploadResponse(BaseModel):
    document: DocumentResponse
    version: DocumentVersionResponse
    extracted_characters: int
    message: str


class DocumentSearchRequest(BaseModel):
    query: str = Field(
        min_length=1,
        max_length=1000,
    )

    limit: int = Field(
        default=10,
        ge=1,
        le=50,
    )


class HybridSearchRequest(BaseModel):
    query: str = Field(
        min_length=1,
        max_length=1000,
    )

    limit: int = Field(
        default=5,
        ge=1,
        le=20,
    )

    candidate_limit: int = Field(
        default=20,
        ge=5,
        le=100,
    )

    document_id: int | None = Field(
        default=None,
        ge=1,
    )

    semantic_weight: float = Field(
        default=0.7,
        ge=0.0,
        le=1.0,
    )

    keyword_weight: float = Field(
        default=0.3,
        ge=0.0,
        le=1.0,
    )

    reranker_weight: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
    )

    minimum_score: float = Field(
        default=0.15,
        ge=0.0,
        le=1.0,
    )

    enable_reranking: bool = True


class HybridSearchResultResponse(BaseModel):
    document_id: int
    document_version_id: int
    version_number: int

    chunk_id: int
    chunk_index: int
    chunk_key: str

    document_title: str
    filename: str
    file_type: str

    page_number: int | None = None
    content: str

    semantic_score: float
    keyword_score: float
    hybrid_score: float
    reranker_score: float
    final_score: float


class HybridSearchResponse(BaseModel):
    query: str
    total_results: int

    results: list[
        HybridSearchResultResponse
    ] = Field(
        default_factory=list
    )

class IndexDocumentResponse(BaseModel):
    document_id: int
    version_id: int
    indexed_chunks: int
    message: str


class VectorStoreStatusResponse(BaseModel):
    collection_name: str
    vector_count: int
    status: str