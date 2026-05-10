from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", protected_namespaces=("settings_",))

    anthropic_api_key: str = ""
    database_url: str = "postgresql://homebase:homebase@localhost:5432/homebase"
    llm_model: str = "claude-sonnet-4-6"
    embedding_model: str = "all-MiniLM-L6-v2"


settings = Settings()
