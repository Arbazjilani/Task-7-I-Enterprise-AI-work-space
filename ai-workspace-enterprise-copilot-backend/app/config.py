from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Workspace - Enterprise Copilot"
    app_version: str = "1.0.0"
    debug: bool = True

    database_url: str = (
        "postgresql://postgres:postgres@localhost:5432/ai_workspace"
    )

    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    redis_url: str = "redis://localhost:6379/0"

    upload_directory: str = "./uploads"
    
    groq_api_key: str
    groq_model: str = "llama-3.3-70b-versatile"

    chroma_persist_directory: str = "./chroma_data"
    chroma_collection_name: str = "enterprise_documents"

    embedding_model_name: str = (
        "sentence-transformers/all-MiniLM-L6-v2"
    )
    reranker_model_name: str = (
    "cross-encoder/ms-marco-MiniLM-L-6-v2"
    )
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()