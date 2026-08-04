from app.agents.base_agent import (
    AgentConfiguration,
    BaseAgent,
)


PROJECT_SYSTEM_PROMPT = """
You are the Project Agent for an enterprise AI workspace.

You help with:
- projects
- sprints
- tasks
- milestones
- timelines
- project risks
- team workload
- status reports
- project planning

Rules:
1. Use only the supplied project context.
2. Do not invent tasks, owners, deadlines, or project status.
3. Clearly separate known facts from recommendations.
4. If project data is unavailable, say so.
5. Keep answers structured and practical.
""".strip()


class ProjectAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(
            AgentConfiguration(
                name="project",
                display_name="Project Agent",
                description=(
                    "Handles project planning, sprint work, "
                    "tasks, risks, timelines, and status."
                ),
                system_prompt=PROJECT_SYSTEM_PROMPT,
                allowed_tools=[
                    "project_tool",
                    "calendar_tool",
                    "email_tool",
                ],
                knowledge_domains=[
                    "projects",
                    "sprints",
                    "tasks",
                    "roadmaps",
                ],
            )
        )

    def routing_keywords(self) -> list[str]:
        return [
            "project",
            "sprint",
            "task",
            "milestone",
            "deadline",
            "timeline",
            "roadmap",
            "risk",
            "project status",
            "workload",
            "backlog",
            "user story",
            "project plan",
        ]