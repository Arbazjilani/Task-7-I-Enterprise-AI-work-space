import hashlib
import re
import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.config import settings
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.document_version import DocumentVersion
from app.models.user import User
from app.rag.chunking import split_text_into_chunks
from app.rag.loaders import (
    SUPPORTED_EXTENSIONS,
    DocumentExtractionError,
    extract_text,
)


MAX_FILE_SIZE = 20 * 1024 * 1024


def ensure_upload_directory() -> Path:
    upload_directory = Path(
        settings.upload_directory
    )

    upload_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    return upload_directory


def sanitize_filename(filename: str) -> str:
    safe_name = Path(filename).name

    safe_name = re.sub(
        r"[^A-Za-z0-9._-]",
        "_",
        safe_name,
    )

    return safe_name or "document"


def calculate_checksum(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


def validate_upload(
    filename: str | None,
    content: bytes,
) -> tuple[str, str]:
    if not filename:
        raise ValueError(
            "The uploaded file must have a filename."
        )

    safe_filename = sanitize_filename(filename)
    extension = Path(safe_filename).suffix.lower()

    if extension not in SUPPORTED_EXTENSIONS:
        allowed = ", ".join(
            sorted(SUPPORTED_EXTENSIONS)
        )

        raise ValueError(
            f"Unsupported file type. Allowed types: {allowed}"
        )

    if not content:
        raise ValueError(
            "The uploaded file is empty."
        )

    if len(content) > MAX_FILE_SIZE:
        raise ValueError(
            "The uploaded file exceeds the 20 MB limit."
        )

    return safe_filename, extension


def get_document_by_id(
    db: Session,
    document_id: int,
) -> Document | None:
    statement = (
        select(Document)
        .options(
            selectinload(Document.versions)
        )
        .where(
            Document.id == document_id,
            Document.is_active.is_(True),
        )
    )

    return db.scalar(statement)


def list_documents(
    db: Session,
    skip: int = 0,
    limit: int = 20,
) -> list[Document]:
    statement = (
        select(Document)
        .where(Document.is_active.is_(True))
        .order_by(Document.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )

    return list(
        db.scalars(statement).all()
    )


def get_next_version_number(
    db: Session,
    document_id: int,
) -> int:
    statement = select(
        func.max(DocumentVersion.version_number)
    ).where(
        DocumentVersion.document_id == document_id
    )

    latest_version = db.scalar(statement)

    return (latest_version or 0) + 1


def create_document_and_version(
    db: Session,
    upload_file: UploadFile,
    file_content: bytes,
    current_user: User,
    title: str | None = None,
    existing_document: Document | None = None,
) -> tuple[
    Document,
    DocumentVersion,
    int,
]:
    safe_filename, extension = validate_upload(
        filename=upload_file.filename,
        content=file_content,
    )

    checksum = calculate_checksum(file_content)

    upload_directory = ensure_upload_directory()

    if existing_document is None:
        document_title = (
            title.strip()
            if title and title.strip()
            else Path(safe_filename).stem
        )

        document = Document(
            title=document_title,
            original_filename=safe_filename,
            file_type=extension.lstrip("."),
            status="processing",
            uploaded_by_id=current_user.id,
        )

        db.add(document)
        db.flush()

        version_number = 1

    else:
        document = existing_document
        version_number = get_next_version_number(
            db=db,
            document_id=document.id,
        )

        document.status = "processing"

    unique_filename = (
        f"{document.id}_v{version_number}_"
        f"{uuid.uuid4().hex}_{safe_filename}"
    )

    storage_path = upload_directory / unique_filename

    version = DocumentVersion(
        document_id=document.id,
        version_number=version_number,
        stored_filename=unique_filename,
        storage_path=str(storage_path),
        checksum=checksum,
        mime_type=upload_file.content_type,
        file_size=len(file_content),
        uploaded_by_id=current_user.id,
        extraction_status="pending",
    )

    db.add(version)

    try:
        storage_path.write_bytes(file_content)

        extracted_text = extract_text(storage_path)

        chunks = split_text_into_chunks(
            extracted_text
        )

        version.extracted_text = extracted_text
        version.extraction_status = "completed"
        version.chunk_count = len(chunks)

        for chunk in chunks:
            db.add(
                DocumentChunk(
                    document_version=version,
                    chunk_index=chunk.index,
                    chunk_key=(
                        f"document-{document.id}-"
                        f"version-{version_number}-"
                        f"chunk-{chunk.index}"
                    ),
                    content=chunk.content,
                    token_count=chunk.token_count,
                    embedding_status="pending",
                )
            )

        document.status = "ready"

        db.commit()
        db.refresh(document)
        db.refresh(version)

        return (
            document,
            version,
            len(extracted_text),
        )

    except DocumentExtractionError as error:
        version.extraction_status = "failed"
        version.extraction_error = str(error)
        document.status = "failed"

        db.commit()
        db.refresh(document)
        db.refresh(version)

        return document, version, 0

    except Exception:
        db.rollback()

        if storage_path.exists():
            storage_path.unlink()

        raise