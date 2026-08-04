from dataclasses import dataclass
from functools import lru_cache

from groq import Groq

from app.config import settings


@dataclass
class LLMResponse:
    content: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


@lru_cache(maxsize=1)
def get_groq_client() -> Groq:
    return Groq(
        api_key=settings.groq_api_key,
    )


def generate_chat_completion(
    messages: list[dict[str, str]],
    temperature: float = 0.2,
    max_tokens: int = 1000,
) -> LLMResponse:
    if not messages:
        raise ValueError(
            "At least one message is required."
        )

    client = get_groq_client()

    completion = client.chat.completions.create(
        model=settings.groq_model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )

    answer = (
        completion.choices[0].message.content
        or ""
    ).strip()

    if not answer:
        raise RuntimeError(
            "The AI model returned an empty response."
        )

    usage = completion.usage

    prompt_tokens = (
        usage.prompt_tokens
        if usage is not None
        else 0
    )

    completion_tokens = (
        usage.completion_tokens
        if usage is not None
        else 0
    )

    total_tokens = (
        usage.total_tokens
        if usage is not None
        else prompt_tokens + completion_tokens
    )

    return LLMResponse(
        content=answer,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        total_tokens=total_tokens,
    )