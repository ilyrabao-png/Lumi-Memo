from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_DEFAULT_DEV_ORIGINS = (
    "http://localhost:3000,"
    "http://127.0.0.1:3000,"
    "http://localhost:3001,"
    "http://127.0.0.1:3001"
)


def _parse_cors_origins(raw: str) -> list[str]:
    """Split comma- or semicolon-separated origins; strip whitespace; drop trailing slashes; dedupe."""
    if not raw or not raw.strip():
        return [x.strip() for x in _DEFAULT_DEV_ORIGINS.split(",") if x.strip()]
    out: list[str] = []
    seen: set[str] = set()
    for part in raw.replace(";", ",").split(","):
        o = part.strip().rstrip("/")
        if not o or o in seen:
            continue
        seen.add(o)
        out.append(o)
    return out if out else [x.strip() for x in _DEFAULT_DEV_ORIGINS.split(",") if x.strip()]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    api_host: str = "0.0.0.0"
    api_port: int = 8000
    # Env: CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,...
    cors_origins: str = _DEFAULT_DEV_ORIGINS

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _normalize_cors_origins(cls, v: object) -> str:
        if v is None:
            return _DEFAULT_DEV_ORIGINS
        if isinstance(v, list):
            return ",".join(str(x).strip() for x in v if str(x).strip())
        return str(v).strip() if str(v).strip() else _DEFAULT_DEV_ORIGINS

    @property
    def cors_origins_list(self) -> list[str]:
        return _parse_cors_origins(self.cors_origins)


@lru_cache
def get_settings() -> Settings:
    return Settings()
