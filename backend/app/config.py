from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    groq_api_key: str = ""
    database_url: str = "postgresql://complaint_user:complaint_pass@localhost:5432/complaints_db"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    extraction_model: str = "gemma2-9b-it"
    chat_model: str = "llama-3.3-70b-versatile"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
