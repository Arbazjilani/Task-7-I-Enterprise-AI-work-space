from dataclasses import dataclass

from app.agents.base_agent import BaseAgent
from app.agents.registry import (
    get_agent,
    list_agents,
)


@dataclass
class AgentRoutingResult:
    agent: BaseAgent
    confidence: float
    reason: str
    matched_keywords: list[str]


def route_message(
    message: str,
    requested_agent: str | None = None,
) -> AgentRoutingResult:
    normalized_message = message.strip().lower()

    if not normalized_message:
        raise ValueError(
            "Message cannot be empty."
        )

    if (
        requested_agent
        and requested_agent.strip().lower()
        not in {"", "auto"}
    ):
        agent = get_agent(requested_agent)

        return AgentRoutingResult(
            agent=agent,
            confidence=1.0,
            reason="The user manually selected this agent.",
            matched_keywords=[],
        )

    best_agent: BaseAgent | None = None
    best_keywords: list[str] = []

    for agent in list_agents():
        if agent.name == "general":
            continue

        if not agent.is_enabled:
            continue

        matched_keywords = [
            keyword
            for keyword in agent.routing_keywords()
            if keyword.lower() in normalized_message
        ]

        if len(matched_keywords) > len(best_keywords):
            best_agent = agent
            best_keywords = matched_keywords

    if best_agent is None:
        return AgentRoutingResult(
            agent=get_agent("general"),
            confidence=0.5,
            reason=(
                "No specialized domain keywords were found, "
                "so the General Agent was selected."
            ),
            matched_keywords=[],
        )

    keyword_count = len(best_keywords)

    confidence = min(
        0.95,
        0.55 + (keyword_count * 0.10),
    )

    return AgentRoutingResult(
        agent=best_agent,
        confidence=confidence,
        reason=(
            "The message matched the agent's "
            "domain keywords."
        ),
        matched_keywords=best_keywords,
    )