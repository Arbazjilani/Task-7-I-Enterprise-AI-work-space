from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class AgentConfiguration:
    name: str
    display_name: str
    description: str
    system_prompt: str

    allowed_tools: list[str] = field(
        default_factory=list
    )

    knowledge_domains: list[str] = field(
        default_factory=list
    )

    is_enabled: bool = True


class BaseAgent(ABC):
    def __init__(
        self,
        configuration: AgentConfiguration,
    ) -> None:
        self.configuration = configuration

    @property
    def name(self) -> str:
        return self.configuration.name

    @property
    def display_name(self) -> str:
        return self.configuration.display_name

    @property
    def description(self) -> str:
        return self.configuration.description

    @property
    def system_prompt(self) -> str:
        return self.configuration.system_prompt

    @property
    def allowed_tools(self) -> list[str]:
        return self.configuration.allowed_tools

    @property
    def knowledge_domains(self) -> list[str]:
        return self.configuration.knowledge_domains

    @property
    def is_enabled(self) -> bool:
        return self.configuration.is_enabled

    def can_handle(
        self,
        message: str,
    ) -> bool:
        normalized_message = message.lower()

        return any(
            keyword.lower() in normalized_message
            for keyword in self.routing_keywords()
        )

    @abstractmethod
    def routing_keywords(self) -> list[str]:
        raise NotImplementedError