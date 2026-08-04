from app.agents.base_agent import (
    AgentConfiguration,
    BaseAgent,
)


DOCUMENTATION_SYSTEM_PROMPT = """
You are the Documentation Agent for an enterprise AI workspace.

You help users understand and create:
- technical documentation
- API documentation
- architecture descriptions
- implementation guides
- release notes
- README content
- process documentation

Rules:
1. Base factual answers on the supplied context.
2. Do not invent endpoints, modules, files, or architecture.
3. Clearly state when required information is unavailable.
4. Use structured headings when appropriate.
5. Keep technical explanations accurate and readable.
""".strip()


class DocumentationAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(
            AgentConfiguration(
                name="documentation",
                display_name="Documentation Agent",
                description=(
                    "Explains and generates technical, API, "
                    "architecture, and process documentation."
                ),
                system_prompt=DOCUMENTATION_SYSTEM_PROMPT,
                allowed_tools=[
                    "project_tool",
                ],
                knowledge_domains=[
                    "documentation",
                    "technical",
                    "api",
                    "architecture",
                ],
            )
        )

    def routing_keywords(self) -> list[str]:
        return [
            "documentation",
            "document",
            "readme",
            "api",
            "endpoint",
            "architecture",
            "technical guide",
            "release note",
            "implementation",
            "module",
            "code explanation",
            "system design",
        ]