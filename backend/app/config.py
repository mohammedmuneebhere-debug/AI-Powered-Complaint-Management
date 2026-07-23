from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    groq_api_key: str = ""
    # sqlite (local dev) | postgresql (docker) | supabase (paste URI from dashboard)
    database_url: str = "sqlite:///./complaints.db"
    database_ssl_mode: str = "require"
    database_pool_size: int = 5
    database_max_overflow: int = 10
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    extraction_model: str = "openai/gpt-oss-20b"
    chat_model: str = "openai/gpt-oss-120b"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def resolved_database_url(self) -> str:
        url = self.database_url.strip()
        if url.startswith("postgres://"):
            return "postgresql://" + url[len("postgres://") :]
        return url

    @property
    def database_provider(self) -> str:
        url = self.resolved_database_url.lower()
        if url.startswith("sqlite"):
            return "sqlite"
        if "supabase.co" in url or "pooler.supabase.com" in url:
            return "supabase"
        if url.startswith("postgresql"):
            return "postgresql"
        return "unknown"

    @property
    def is_remote_postgres(self) -> bool:
        if self.database_provider == "sqlite":
            return False
        host = self.resolved_database_url.split("@")[-1] if "@" in self.resolved_database_url else ""
        return not any(local in host for local in ("localhost", "127.0.0.1"))

    @property
    def use_supabase_pooler(self) -> bool:
        return self.database_provider == "supabase" and ":6543/" in self.resolved_database_url

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
