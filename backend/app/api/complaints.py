from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.agents.graph import run_extraction
from app.database import get_db
from app.models.complaint import Complaint
from app.models.note import ComplaintNote
from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintResponse,
    ComplaintStatusUpdate,
    ComplaintUpdate,
    ExtractionResponse,
    ExtractedFields,
    TextExtractionRequest,
)
from app.schemas.note import NoteCreate, NoteResponse
from app.services.document_parser import extract_text_from_bytes

router = APIRouter(prefix="/api/complaints", tags=["complaints"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {"pdf", "docx", "txt", "eml"}


def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def _complaint_to_dict(c: Complaint) -> dict:
    return {
        "id": str(c.id),
        "product_name": c.product_name,
        "batch_lot_number": c.batch_lot_number,
        "customer_name": c.customer_name,
        "complaint_type": c.complaint_type,
        "description": c.description,
        "complaint_date": str(c.complaint_date) if c.complaint_date else None,
    }


@router.post("/extract", response_model=ExtractionResponse)
async def extract_from_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 10MB limit")

    try:
        raw_text = extract_text_from_bytes(contents, file.filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse document: {e}")

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="No text could be extracted from document")

    existing = [_complaint_to_dict(c) for c in db.query(Complaint).limit(50).all()]
    result = run_extraction(raw_text, existing)

    return ExtractionResponse(
        extracted_fields=ExtractedFields(**result["extracted_fields"]),
        raw_text=raw_text,
        completeness_score=result.get("completeness_score"),
        missing_fields=result.get("missing_fields", []),
        ai_summary=result.get("ai_summary"),
        risk_classification=result.get("risk_classification"),
        risk_rationale=result.get("risk_rationale"),
        root_cause_suggestions=result.get("root_cause_suggestions", []),
        capa_recommendations=result.get("capa_recommendations", []),
        duplicate_warnings=result.get("duplicate_warnings", []),
        ai_confidence=result.get("ai_confidence", {}),
    )


@router.post("/extract-text", response_model=ExtractionResponse)
async def extract_from_text(
    request: TextExtractionRequest,
    db: Session = Depends(get_db),
):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="No text provided")

    existing = [_complaint_to_dict(c) for c in db.query(Complaint).limit(50).all()]
    result = run_extraction(request.text, existing)

    return ExtractionResponse(
        extracted_fields=ExtractedFields(**result["extracted_fields"]),
        raw_text=request.text,
        completeness_score=result.get("completeness_score"),
        missing_fields=result.get("missing_fields", []),
        ai_summary=result.get("ai_summary"),
        risk_classification=result.get("risk_classification"),
        risk_rationale=result.get("risk_rationale"),
        root_cause_suggestions=result.get("root_cause_suggestions", []),
        capa_recommendations=result.get("capa_recommendations", []),
        duplicate_warnings=result.get("duplicate_warnings", []),
        ai_confidence=result.get("ai_confidence", {}),
    )


@router.post("", response_model=ComplaintResponse, status_code=201)
def create_complaint(complaint: ComplaintCreate, db: Session = Depends(get_db)):
    db_complaint = Complaint(**complaint.model_dump())
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    return db_complaint


VALID_STATUSES = {
    "pending_triage",
    "under_inspection",
    "confirmed",
    "action_taken",
    "resolved",
    "closed",
}


@router.get("", response_model=list[ComplaintResponse])
def list_complaints(
    skip: int = 0,
    limit: int = 100,
    status: str | None = None,
    q: str | None = Query(None, description="Search product, customer, batch, description"),
    db: Session = Depends(get_db),
):
    query = db.query(Complaint)
    if status:
        query = query.filter(Complaint.status == status)
    if q:
        term = f"%{q}%"
        query = query.filter(
            or_(
                Complaint.product_name.ilike(term),
                Complaint.customer_name.ilike(term),
                Complaint.batch_lot_number.ilike(term),
                Complaint.description.ilike(term),
                Complaint.complaint_type.ilike(term),
            )
        )
    return query.order_by(Complaint.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(complaint_id: UUID, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint


@router.put("/{complaint_id}", response_model=ComplaintResponse)
def update_complaint(complaint_id: UUID, update: ComplaintUpdate, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    for key, value in update.model_dump(exclude_unset=True).items():
        setattr(complaint, key, value)

    db.commit()
    db.refresh(complaint)
    return complaint


@router.patch("/{complaint_id}/status", response_model=ComplaintResponse)
def update_complaint_status(
    complaint_id: UUID, update: ComplaintStatusUpdate, db: Session = Depends(get_db)
):
    if update.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Allowed: {', '.join(sorted(VALID_STATUSES))}",
        )
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    old_status = complaint.status
    complaint.status = update.status
    if old_status != update.status:
        status_note = ComplaintNote(
            complaint_id=complaint_id,
            note_text=f"Status changed from '{old_status.replace('_', ' ')}' to '{update.status.replace('_', ' ')}'",
            action_type="Status Change",
            author="System",
        )
        db.add(status_note)
    db.commit()
    db.refresh(complaint)
    return complaint


@router.get("/{complaint_id}/notes", response_model=list[NoteResponse])
def list_notes(complaint_id: UUID, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return (
        db.query(ComplaintNote)
        .filter(ComplaintNote.complaint_id == complaint_id)
        .order_by(ComplaintNote.created_at.desc())
        .all()
    )


@router.post("/{complaint_id}/notes", response_model=NoteResponse, status_code=201)
def add_note(complaint_id: UUID, note: NoteCreate, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    db_note = ComplaintNote(complaint_id=complaint_id, **note.model_dump())
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


@router.delete("/{complaint_id}", status_code=204)
def delete_complaint(complaint_id: UUID, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    db.delete(complaint)
    db.commit()
