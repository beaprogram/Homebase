from functools import cached_property
from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", protected_namespaces=("settings_",))

    anthropic_api_key: str = ""
    llm_model: str = "claude-sonnet-4-6"
    embedding_model: str = "all-MiniLM-L6-v2"

    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "homebase"
    db_user: str = "homebase"
    db_password: str = "homebase"

    @cached_property
    def database_url(self) -> str:
        return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"


settings = Settings()
