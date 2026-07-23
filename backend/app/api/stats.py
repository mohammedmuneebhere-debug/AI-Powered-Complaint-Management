from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

from app.database import get_db
from app.models.complaint import Complaint

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("")
def get_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(Complaint.id)).scalar() or 0

    status_counts = dict(
        db.query(Complaint.status, func.count(Complaint.id))
        .group_by(Complaint.status)
        .all()
    )

    severity_counts = dict(
        db.query(Complaint.initial_severity, func.count(Complaint.id))
        .filter(Complaint.initial_severity.isnot(None))
        .group_by(Complaint.initial_severity)
        .all()
    )

    risk_counts = dict(
        db.query(Complaint.risk_classification, func.count(Complaint.id))
        .filter(Complaint.risk_classification.isnot(None))
        .group_by(Complaint.risk_classification)
        .all()
    )

    pending = status_counts.get("pending_triage", 0)
    under_inspection = status_counts.get("under_inspection", 0)
    critical = severity_counts.get("critical", 0) + risk_counts.get("critical", 0)

    recent = (
        db.query(Complaint)
        .order_by(Complaint.created_at.desc())
        .limit(5)
        .all()
    )

    avg_completeness = (
        db.query(func.avg(Complaint.completeness_score))
        .filter(Complaint.completeness_score.isnot(None))
        .scalar()
    )

    return {
        "total": total,
        "pending": pending,
        "under_inspection": under_inspection,
        "critical": critical,
        "status_breakdown": status_counts,
        "severity_breakdown": severity_counts,
        "risk_breakdown": risk_counts,
        "avg_completeness": round(float(avg_completeness), 1) if avg_completeness else None,
        "recent": [
            {
                "id": str(c.id),
                "product_name": c.product_name,
                "customer_name": c.customer_name,
                "status": c.status,
                "initial_severity": c.initial_severity,
                "risk_classification": c.risk_classification,
                "created_at": c.created_at.isoformat(),
            }
            for c in recent
        ],
    }
