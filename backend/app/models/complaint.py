import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, JSON, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status: Mapped[str] = mapped_column(String(50), default="pending_triage")

    complaint_source: Mapped[str | None] = mapped_column(String(255), nullable=True)
    customer_name: Mapped[str | None] = mapped_column(String(255), nullable=True)

    product_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    product_strength: Mapped[str | None] = mapped_column(String(100), nullable=True)
    batch_lot_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    manufacturing_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    quantity_affected: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    quantity_unit: Mapped[str] = mapped_column(String(20), default="kg")

    complaint_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    complaint_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    initial_severity: Mapped[str | None] = mapped_column(String(50), nullable=True)
    priority: Mapped[str | None] = mapped_column(String(50), nullable=True)

    source_document: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_confidence: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    risk_classification: Mapped[str | None] = mapped_column(String(50), nullable=True)
    completeness_score: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    ai_insights: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    notes = relationship("ComplaintNote", back_populates="complaint", cascade="all, delete-orphan")
