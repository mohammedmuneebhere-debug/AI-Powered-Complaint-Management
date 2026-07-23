# AIVOA — AI-Powered Customer Complaint Management System

**Pharmaceutical-grade complaint intake, triage, and resolution — powered by LangGraph and Groq.**

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![LangGraph](https://img.shields.io/badge/LangGraph-1C3C3C?style=flat)](https://langchain-ai.github.io/langgraph/)
[![Groq](https://img.shields.io/badge/Groq-F55036?style=flat)](https://groq.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## Goal

Pharmaceutical manufacturers receive customer complaints through unstructured channels — emails, PDF letters, phone notes, and regulatory correspondence. Manual intake is slow, error-prone, and delays critical quality actions.

**AIVOA** automates the entire complaint lifecycle: from document upload to structured data extraction, risk assessment, workflow management, and AI-assisted investigation — in a single, production-ready platform built for QA teams.

---

## Objective & Outcome

| Objective | Outcome |
|-----------|---------|
| Reduce manual data entry | AI auto-populates 14+ complaint fields from documents in seconds |
| Accelerate triage | Instant risk classification, severity scoring, and completeness checks |
| Standardize QA workflow | Status pipeline: Pending Triage → Inspection → Confirmed → Action Taken → Resolved |
| Enable audit-ready documentation | Timestamped action notes with CAPA and investigation tracking |
| Support regulatory readiness | Structured complaint records with batch traceability and AI-generated summaries |

**End result:** QA staff spend less time typing and more time investigating — with every complaint traceable, documented, and actionable from day one.

---

## What Makes AIVOA Unique

### 1. Multi-Stage LangGraph AI Pipeline
Unlike simple "paste text → get JSON" tools, AIVOA runs a **7-node LangGraph workflow** on every document:

```
Extract → Completeness → Risk → Summary → Root Cause → CAPA → Duplicate Check
```

Each node builds on the previous one, producing a full QA intelligence package — not just form fields.

### 2. Dual-Model Strategy for Speed + Depth
| Model | Role | Why |
|-------|------|-----|
| `gemma2-9b-it` | Extraction, risk, completeness | Fast, low-latency structured output |
| `llama-3.3-70b-versatile` | Chat, root cause, CAPA | Deeper reasoning for complex analysis |

This split keeps intake snappy while reserving heavy reasoning for investigation tasks.

### 3. Full Complaint Lifecycle — Not Just Intake
Most complaint tools stop at logging. AIVOA includes:
- **Dashboard** with real-time analytics and severity breakdowns
- **Kanban management board** with status workflow and action notes
- **Streaming AI chat** with complaint context for investigator Q&A
- **Duplicate detection** against existing complaints in the database

### 4. Pharma-Specific by Design
Field schema, prompts, and workflows are tailored for pharmaceutical QA — batch/lot numbers, CAPA recommendations, manufacturing dates, regulatory risk tiers — not a generic ticketing system with AI bolted on.

---

## Why It's the Most Efficient Approach

| Challenge | AIVOA Solution | Efficiency Gain |
|-----------|------------------|-----------------|
| Unstructured complaint documents | Upload PDF, DOCX, TXT, or EML → auto-extract | **~80% less manual typing** |
| Slow triage decisions | Instant AI risk + severity classification | **Minutes → seconds** |
| Scattered investigation notes | Unified timeline with action types | **Single source of truth** |
| Repeated complaints | AI duplicate detection vs. database | **Early pattern recognition** |
| LLM cost & latency | Groq LPU inference + small model for extraction | **Sub-second responses** |
| Complex orchestration | LangGraph state machine vs. ad-hoc prompts | **Reliable, repeatable pipeline** |

Groq's inference speed combined with LangGraph's structured orchestration means the system processes a full complaint document — extraction, risk, CAPA, and duplicate check — in one pipeline run, not five separate API calls.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Redux Toolkit, React Router, Vite |
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy, Pydantic |
| **AI Orchestration** | LangGraph (multi-node state machine) |
| **LLM Provider** | Groq API (`gemma2-9b-it`, `llama-3.3-70b-versatile`) |
| **Database** | PostgreSQL (production) / SQLite (local dev) |
| **Document Parsing** | pdfplumber, python-docx, native EML parser |
| **Typography** | Google Inter |

---

## Features

### Core
- Biomedical-themed landing page with guided navigation
- 4-section structured complaint form (Origin, Product/Batch, Details, Assessment)
- AI document intake — drag-and-drop or paste text/email
- Real-time extraction progress with form auto-population
- Save complaints to database with full audit metadata

### AI Intelligence
- Structured field extraction from unstructured documents
- Completeness scoring with missing-field detection
- AI risk classification with rationale
- Executive complaint summary
- Root cause suggestions (5-Why / fishbone style)
- CAPA (Corrective & Preventive Action) recommendations
- Duplicate complaint detection against existing records
- Streaming AI chat assistant with complaint context

### Management
- QA Dashboard — stats, charts, recent complaints, completeness ring
- Complaint Management board — list + Kanban views
- Status workflow with one-click advancement
- Search, sort, and severity filtering
- Action notes timeline with investigation documentation
- JSON export per complaint

---

## Architecture

```mermaid
flowchart TB
    subgraph Frontend["React + Redux"]
        LP[Landing Page]
        LC[Log Complaint]
        DB[Dashboard]
        MG[Management Board]
    end

    subgraph Backend["FastAPI"]
        API[REST API]
        DP[Document Parser]
        GC[Groq Client - Streaming Chat]
    end

    subgraph AI["LangGraph Pipeline"]
        E[Extract Fields]
        C[Check Completeness]
        R[Classify Risk]
        S[Summarize]
        RC[Root Cause]
        CP[CAPA]
        D[Duplicate Check]
        E --> C --> R --> S --> RC --> CP --> D
    end

    subgraph Data["Database"]
        PG[(PostgreSQL / SQLite)]
    end

    LC --> API
    DB --> API
    MG --> API
    API --> DP
    API --> AI
    API --> GC
    AI --> Groq[Groq API]
    GC --> Groq
    API --> PG
```

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Groq API key → [console.groq.com/keys](https://console.groq.com/keys)
- PostgreSQL 14+ (optional — SQLite works out of the box for local dev)

### 1. Clone & configure

```bash
git clone https://github.com/YOUR_USERNAME/aivoa-complaint-management.git
cd aivoa-complaint-management
```

### 2. Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # then edit .env with your GROQ_API_KEY
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

### 4. PostgreSQL (production)

```bash
docker compose up -d
```

Update `backend/.env`:

```env
DATABASE_URL=postgresql://complaint_user:complaint_pass@localhost:5432/complaints_db
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GROQ_API_KEY` | Groq API key (**required**) | — |
| `DATABASE_URL` | Database connection string | `sqlite:///./complaints.db` |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:5173` |

---

## Demo Workflow

1. Land on the **AIVOA homepage** → click **Start Complaint Intake**
2. Upload a sample from `sample-data/` (or paste complaint text)
3. Watch AI extract and populate all form fields automatically
4. Review **AI Insights** — risk, completeness, root cause, CAPA
5. **Save Complaint** → navigate to **Management** to track status
6. Advance through the workflow and add investigation notes
7. Use the **streaming chat assistant** to ask questions about the complaint

### Sample Data

| File | Scenario |
|------|----------|
| `sample-data/complaint_email.eml` | Metformin discoloration — high severity |
| `sample-data/complaint_letter.txt` | Amoxicillin packaging defect |
| `sample-data/complaint_labeling.eml` | Ibuprofen labeling error — critical |

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check + Groq/DB status |
| `GET` | `/api/stats` | Dashboard analytics |
| `POST` | `/api/complaints/extract` | Upload document for AI extraction |
| `POST` | `/api/complaints/extract-text` | Extract from pasted text |
| `POST` | `/api/complaints` | Create complaint |
| `GET` | `/api/complaints` | List complaints (search & filter) |
| `PATCH` | `/api/complaints/{id}/status` | Update workflow status |
| `GET/POST` | `/api/complaints/{id}/notes` | Action notes |
| `POST` | `/api/chat` | AI chat (full response) |
| `POST` | `/api/chat/stream` | AI chat (streaming) |

Full interactive docs: **http://localhost:8000/docs**

---

## Project Structure

```
aivoa-complaint-management/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── config.py            # Environment settings
│   │   ├── agents/              # LangGraph AI pipeline
│   │   ├── api/                 # REST route handlers
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   └── services/            # Document parser, Groq client
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   └── src/
│       ├── pages/               # Landing, Dashboard, Log, Management
│       ├── components/          # UI components
│       └── store/               # Redux state management
├── sample-data/                 # Demo complaint documents
├── docker-compose.yml           # PostgreSQL for production
└── README.md
```

---

## License

This project is built as a pharmaceutical QA demonstration platform. See repository license for details.

---

<p align="center">
  <strong>AIVOA</strong> — Quality Assurance Module for Pharmaceutical Manufacturing<br/>
  <em>Built with LangGraph · Groq · FastAPI · React</em>
</p>
