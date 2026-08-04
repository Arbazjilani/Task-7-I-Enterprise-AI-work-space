from app.agents.base_agent import BaseAgent
from app.agents.documentation_agent import (
    DocumentationAgent,
)
from app.agents.general_agent import GeneralAgent
from app.agents.hr_agent import HRAgent
from app.agents.project_agent import ProjectAgent
from app.agents.support_agent import SupportAgent


_AGENT_REGISTRY: dict[str, BaseAgent] = {
    "general": GeneralAgent(),
    "hr": HRAgent(),
    "support": SupportAgent(),
    "project": ProjectAgent(),
    "documentation": DocumentationAgent(),
}


def get_agent(
    agent_name: str,
) -> BaseAgent:
    normalized_name = agent_name.strip().lower()

    agent = _AGENT_REGISTRY.get(normalized_name)

    if agent is None:
        raise ValueError(
            f"Agent '{agent_name}' does not exist."
        )

    if not agent.is_enabled:
        raise ValueError(
            f"Agent '{agent_name}' is currently disabled."
        )

    return agent


def list_agents() -> list[BaseAgent]:
    return list(_AGENT_REGISTRY.values())


def get_enabled_agent_names() -> set[str]:
    return {
        agent.name
        for agent in _AGENT_REGISTRY.values()
        if agent.is_enabled
    }


def set_agent_enabled(
    agent_name: str,
    is_enabled: bool,
) -> BaseAgent:
    agent = get_agent(agent_name)

    agent.configuration.is_enabled = is_enabled

    return agent