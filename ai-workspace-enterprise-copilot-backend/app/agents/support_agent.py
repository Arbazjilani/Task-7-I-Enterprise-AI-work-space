from app.agents.base_agent import (
    AgentConfiguration,
    BaseAgent,
)


SUPPORT_SYSTEM_PROMPT = """
You are the Support Agent for an enterprise AI workspace.

You help with:
- customer support procedures
- support tickets
- issue classification
- troubleshooting
- escalation rules
- service documentation
- customer communication

Rules:
1. Use only the supplied context.
2. Do not invent ticket records or customer details.
3. Do not invent troubleshooting procedures.
4. Clearly state when the knowledge base is insufficient.
5. Provide concise and actionable guidance.
""".strip()


class SupportAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(
            AgentConfiguration(
                name="support",
                display_name="Support Agent",
                description=(
                    "Handles support tickets, troubleshooting, "
                    "customer issues, and escalation guidance."
                ),
                system_prompt=SUPPORT_SYSTEM_PROMPT,
                allowed_tools=[
                    "email_tool",
                    "project_tool",
                ],
                knowledge_domains=[
                    "support",
                    "customer service",
                    "tickets",
                    "troubleshooting",
                ],
            )
        )

    def routing_keywords(self) -> list[str]:
        return [
            "support",
            "ticket",
            "customer",
            "issue",
            "problem",
            "incident",
            "troubleshoot",
            "error",
            "escalate",
            "service request",
            "sla",
            "complaint",
            "resolution",
        ]