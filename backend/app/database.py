from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import NullPool

from app.config import settings


def _build_engine():
    url = settings.resolved_database_url

    if settings.database_provider == "sqlite":
        return create_engine(
            url,
            pool_pre_ping=True,
            connect_args={"check_same_thread": False},
        )

    connect_args: dict = {}
    if settings.is_remote_postgres:
        connect_args["sslmode"] = settings.database_ssl_mode

    engine_kwargs: dict = {
        "pool_pre_ping": True,
        "connect_args": connect_args,
    }

    # Supabase transaction pooler (port 6543) — PgBouncer manages pooling
    if settings.use_supabase_pooler:
        engine_kwargs["poolclass"] = NullPool
    else:
        engine_kwargs["pool_size"] = settings.database_pool_size
        engine_kwargs["max_overflow"] = settings.database_max_overflow

    return create_engine(url, **engine_kwargs)


engine = _build_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
