from app.agents.registry import get_agent


def get_agent_prompt(
    agent_name: str,
) -> str:
    agent = get_agent(agent_name)

    return agent.system_prompt