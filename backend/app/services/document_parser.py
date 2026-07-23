import email
import io
from email import policy

import pdfplumber
from docx import Document


def extract_text_from_bytes(file_bytes: bytes, filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext == "pdf":
        return _extract_pdf(file_bytes)
    if ext == "docx":
        return _extract_docx(file_bytes)
    if ext == "txt":
        return file_bytes.decode("utf-8", errors="replace")
    if ext == "eml":
        return _extract_eml(file_bytes)

    raise ValueError(f"Unsupported file type: {ext or 'unknown'}. Supported: PDF, DOCX, TXT, EML")


def _extract_pdf(file_bytes: bytes) -> str:
    text_parts: list[str] = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n\n".join(text_parts).strip()


def _extract_docx(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def _extract_eml(file_bytes: bytes) -> str:
    msg = email.message_from_bytes(file_bytes, policy=policy.default)
    parts: list[str] = []

    if msg["subject"]:
        parts.append(f"Subject: {msg['subject']}")
    if msg["from"]:
        parts.append(f"From: {msg['from']}")
    if msg["to"]:
        parts.append(f"To: {msg['to']}")
    if msg["date"]:
        parts.append(f"Date: {msg['date']}")
    parts.append("")

    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            if content_type == "text/plain":
                payload = part.get_content()
                if payload:
                    parts.append(str(payload))
    else:
        payload = msg.get_content()
        if payload:
            parts.append(str(payload))

    return "\n".join(parts).strip()
