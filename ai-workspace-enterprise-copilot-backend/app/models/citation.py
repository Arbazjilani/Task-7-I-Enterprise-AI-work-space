from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.message import Message


class Citation(Base):
    __tablename__ = "citations"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    message_id: Mapped[int] = mapped_column(
        ForeignKey(
            "messages.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    document_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        index=True,
    )

    document_version_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    chunk_database_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    version_number: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    document_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    filename: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    page_number: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    chunk_id: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    excerpt: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    message: Mapped["Message"] = relationship(
        back_populates="citations",
    )