from datetime import date, datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class ComplaintBase(BaseModel):
    complaint_source: str | None = None
    customer_name: str | None = None
    product_name: str | None = None
    product_strength: str | None = None
    batch_lot_number: str | None = None
    manufacturing_date: date | None = None
    expiry_date: date | None = None
    quantity_affected: float | None = None
    quantity_unit: str = "kg"
    complaint_type: str | None = None
    complaint_date: date | None = None
    description: str | None = None
    initial_severity: str | None = None
    priority: str | None = None
    status: str = "pending_triage"


class ComplaintCreate(ComplaintBase):
    source_document: str | None = None
    ai_confidence: dict[str, Any] | None = None
    ai_summary: str | None = None
    risk_classification: str | None = None
    completeness_score: float | None = None
    ai_insights: dict[str, Any] | None = None


class ComplaintUpdate(ComplaintBase):
    pass


class ComplaintStatusUpdate(BaseModel):
    status: str


class ComplaintResponse(ComplaintBase):
    id: UUID
    source_document: str | None = None
    ai_confidence: dict[str, Any] | None = None
    ai_summary: str | None = None
    risk_classification: str | None = None
    completeness_score: float | None = None
    ai_insights: dict[str, Any] | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ExtractedFields(BaseModel):
    complaint_source: str | None = None
    customer_name: str | None = None
    product_name: str | None = None
    product_strength: str | None = None
    batch_lot_number: str | None = None
    manufacturing_date: str | None = None
    expiry_date: str | None = None
    quantity_affected: float | None = None
    quantity_unit: str = "kg"
    complaint_type: str | None = None
    complaint_date: str | None = None
    description: str | None = None
    initial_severity: str | None = None
    priority: str | None = None


class ExtractionResponse(BaseModel):
    extracted_fields: ExtractedFields
    raw_text: str
    completeness_score: float | None = None
    missing_fields: list[str] = Field(default_factory=list)
    ai_summary: str | None = None
    risk_classification: str | None = None
    risk_rationale: str | None = None
    root_cause_suggestions: list[str] = Field(default_factory=list)
    capa_recommendations: list[str] = Field(default_factory=list)
    duplicate_warnings: list[dict[str, Any]] = Field(default_factory=list)
    ai_confidence: dict[str, float] = Field(default_factory=dict)


class ChatRequest(BaseModel):
    message: str
    complaint_context: dict[str, Any] = Field(default_factory=dict)
    conversation_history: list[dict[str, str]] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str


class TextExtractionRequest(BaseModel):
    text: str
