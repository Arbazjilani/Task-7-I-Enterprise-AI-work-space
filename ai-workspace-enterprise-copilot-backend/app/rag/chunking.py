from dataclasses import dataclass


@dataclass
class TextChunk:
    index: int
    content: str
    token_count: int


def estimate_token_count(text: str) -> int:
    words = text.split()

    if not words:
        return 0

    return max(
        1,
        int(len(words) * 1.3),
    )


def split_text_into_chunks(
    text: str,
    chunk_size: int = 1200,
    chunk_overlap: int = 200,
) -> list[TextChunk]:
    if chunk_size <= 0:
        raise ValueError(
            "chunk_size must be greater than zero."
        )

    if chunk_overlap < 0:
        raise ValueError(
            "chunk_overlap cannot be negative."
        )

    if chunk_overlap >= chunk_size:
        raise ValueError(
            "chunk_overlap must be smaller than chunk_size."
        )

    normalized_text = " ".join(text.split())

    if not normalized_text:
        return []

    chunks: list[TextChunk] = []
    start = 0
    chunk_index = 0
    text_length = len(normalized_text)

    while start < text_length:
        end = min(
            start + chunk_size,
            text_length,
        )

        chunk_text = normalized_text[start:end]

        if end < text_length:
            final_space = chunk_text.rfind(" ")

            if final_space > chunk_size // 2:
                end = start + final_space
                chunk_text = normalized_text[start:end]

        chunk_text = chunk_text.strip()

        if chunk_text:
            chunks.append(
                TextChunk(
                    index=chunk_index,
                    content=chunk_text,
                    token_count=estimate_token_count(
                        chunk_text
                    ),
                )
            )

            chunk_index += 1

        if end >= text_length:
            break

        start = end - chunk_overlap

    return chunks