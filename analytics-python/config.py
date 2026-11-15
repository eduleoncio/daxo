"""Configuração de ambiente e conexão usada pelo serviço de análise."""

import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy.engine import URL

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def database_url() -> URL | str:
    """Usa PostgreSQL quando configurado; caso contrário, um SQLite local."""
    host = os.getenv("DB_HOST", "").strip()
    if not host:
        data_dir = BASE_DIR / "data"
        data_dir.mkdir(parents=True, exist_ok=True)
        return f"sqlite:///{(data_dir / 'cti_insights.db').as_posix()}"

    return URL.create(
        "postgresql+psycopg",
        username=os.getenv("DB_USER", ""),
        password=os.getenv("DB_PASSWORD", ""),
        host=host,
        port=int(os.getenv("DB_PORT", "5432")),
        database=os.getenv("DB_NAME", "ctiinsights"),
        query={"sslmode": os.getenv("DB_SSLMODE", "require")},
    )
