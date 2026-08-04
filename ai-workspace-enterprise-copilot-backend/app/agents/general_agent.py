from app.agents.base_agent import (
    AgentConfiguration,
    BaseAgent,
)


GENERAL_SYSTEM_PROMPT = """
You are Enterprise Copilot, a professional enterprise AI assistant.

You help users with general enterprise questions and route specialized
questions to the appropriate domain when needed.

Rules:
1. Use only the supplied enterprise knowledge-base context.
2. Do not invent company facts, policies, deadlines, or procedures.
3. If the context does not contain enough information, clearly say so.
4. Keep responses professional, direct, and helpful.
5. Do not create fake citations.
""".strip()


class GeneralAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(
            AgentConfiguration(
                name="general",
                display_name="Enterprise Copilot",
                description=(
                    "General enterprise assistant for broad "
                    "workspace questions."
                ),
                system_prompt=GENERAL_SYSTEM_PROMPT,
                allowed_tools=[],
                knowledge_domains=[
                    "general",
                    "enterprise",
                ],
            )
        )

    def routing_keywords(self) -> list[str]:
        return []