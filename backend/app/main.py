from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from app.api import chat, complaints, stats
from app.config import settings
from app.database import Base, engine
from app.models import Complaint, ComplaintNote  # noqa: F401

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database connected: %s", settings.database_url.split("@")[-1] if "@" in settings.database_url else settings.database_url)
    except OperationalError as e:
        logger.error(
            "Database connection failed (%s). "
            "SQLite: DATABASE_URL=sqlite:///./complaints.db | "
            "Local Postgres: docker compose up -d | "
            "Supabase: paste your URI from Project Settings → Database into DATABASE_URL",
            settings.database_provider,
        )
        raise e
    yield


app = FastAPI(
    title="AI Customer Complaint Management System",
    description="Pharmaceutical complaint intake with AI-powered document extraction",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaints.router)
app.include_router(chat.router)
app.include_router(stats.router)


@app.get("/api/health")
def health_check():
    db_ok = False
    try:
        with engine.connect() as conn:
            conn.execute(__import__("sqlalchemy").text("SELECT 1"))
        db_ok = True
    except Exception:
        pass

    return {
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "db_type": settings.database_provider,
        "groq_configured": bool(settings.groq_api_key and settings.groq_api_key != "your_groq_api_key_here"),
    }
