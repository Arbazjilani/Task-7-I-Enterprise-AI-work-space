from app.agents.base_agent import (
    AgentConfiguration,
    BaseAgent,
)


HR_SYSTEM_PROMPT = """
You are the HR Agent for an enterprise AI workspace.

You answer questions about:
- leave policies
- payroll
- holidays
- employee benefits
- remote work
- employee handbooks
- attendance
- onboarding
- HR procedures

Rules:
1. Use only the supplied knowledge-base context.
2. Never invent leave counts, salary rules, benefits, or policies.
3. If the answer is not present in the context, clearly say so.
4. Keep responses employee-friendly and professional.
5. Use source labels when the supplied context includes them.
""".strip()


class HRAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(
            AgentConfiguration(
                name="hr",
                display_name="HR Agent",
                description=(
                    "Answers employee policy, leave, payroll, "
                    "holiday, and HR procedure questions."
                ),
                system_prompt=HR_SYSTEM_PROMPT,
                allowed_tools=[
                    "employee_tool",
                    "calendar_tool",
                ],
                knowledge_domains=[
                    "hr",
                    "employee",
                    "leave",
                    "payroll",
                ],
            )
        )

    def routing_keywords(self) -> list[str]:
        return [
            "leave",
            "casual leave",
            "sick leave",
            "holiday",
            "payroll",
            "salary",
            "employee",
            "attendance",
            "remote work",
            "work from home",
            "benefit",
            "handbook",
            "onboarding",
            "hr policy",
            "human resources",
        ]