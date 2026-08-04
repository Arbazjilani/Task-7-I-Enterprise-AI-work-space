from dataclasses import dataclass


@dataclass(frozen=True)
class ModelPricing:
    prompt_cost_per_million: float
    completion_cost_per_million: float


MODEL_PRICING: dict[str, ModelPricing] = {
    "llama-3.3-70b-versatile": ModelPricing(
        prompt_cost_per_million=0.59,
        completion_cost_per_million=0.79,
    ),
    "default": ModelPricing(
        prompt_cost_per_million=0.0,
        completion_cost_per_million=0.0,
    ),
}


def calculate_estimated_cost(
    model_name: str,
    prompt_tokens: int,
    completion_tokens: int,
) -> float:
    pricing = MODEL_PRICING.get(
        model_name,
        MODEL_PRICING["default"],
    )

    prompt_cost = (
        prompt_tokens / 1_000_000
    ) * pricing.prompt_cost_per_million

    completion_cost = (
        completion_tokens / 1_000_000
    ) * pricing.completion_cost_per_million

    return round(
        prompt_cost + completion_cost,
        8,
    )