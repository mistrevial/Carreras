from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Finish Line API"
    app_env: str = "development"
    app_base_url: str = "http://127.0.0.1:8000"
    database_url: str = "sqlite:///./finishline.db"
    admin_bootstrap_username: str = "admin"
    admin_bootstrap_password: str = "ChangeThisNow123!"
    session_cookie_name: str = "finishline_admin_session"
    session_ttl_hours: int = 12
    use_secure_cookies: bool = False
    allow_origins: str = Field(
        default="http://127.0.0.1:5500,http://localhost:5500,http://127.0.0.1:8000,http://localhost:8000"
    )
    seed_demo_data: bool = True

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")

    @property
    def allowed_origins_list(self) -> list[str]:
        return [item.strip() for item in self.allow_origins.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
