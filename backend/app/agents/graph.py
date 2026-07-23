import json
import re
from typing import Any

from langchain_core.messages import HumanMessage
from langchain_groq import ChatGroq
from langgraph.graph import END, StateGraph
from typing_extensions import TypedDict

from app.agents.prompts import (
    CAPA_PROMPT,
    COMPLETENESS_PROMPT,
    DUPLICATE_PROMPT,
    EXTRACTION_PROMPT,
    RISK_PROMPT,
    ROOT_CAUSE_PROMPT,
    SUMMARY_PROMPT,
)
from app.config import settings


def _parse_json_response(text: str) -> dict[str, Any]:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise


def _get_llm(model: str | None = None, temperature: float = 0) -> ChatGroq:
    return ChatGroq(
        model=model or settings.extraction_model,
        groq_api_key=settings.groq_api_key,
        temperature=temperature,
    )


class ExtractionState(TypedDict):
    raw_text: str
    extracted_fields: dict[str, Any]
    completeness_score: float
    missing_fields: list[str]
    ai_summary: str
    risk_classification: str
    risk_rationale: str
    root_cause_suggestions: list[str]
    capa_recommendations: list[str]
    duplicate_warnings: list[dict[str, Any]]
    ai_confidence: dict[str, float]
    existing_complaints: list[dict[str, Any]]


def extract_fields_node(state: ExtractionState) -> ExtractionState:
    llm = _get_llm(settings.extraction_model)
    prompt = EXTRACTION_PROMPT.format(text=state["raw_text"])
    response = llm.invoke([HumanMessage(content=prompt)])
    extracted = _parse_json_response(response.content)
    state["extracted_fields"] = extracted

    confidence: dict[str, float] = {}
    for key, value in extracted.items():
        confidence[key] = 0.9 if value is not None and value != "" else 0.0
    state["ai_confidence"] = confidence
    return state


def check_completeness_node(state: ExtractionState) -> ExtractionState:
    llm = _get_llm(settings.extraction_model)
    prompt = COMPLETENESS_PROMPT.format(data=json.dumps(state["extracted_fields"], indent=2))
    response = llm.invoke([HumanMessage(content=prompt)])
    result = _parse_json_response(response.content)
    state["completeness_score"] = float(result.get("completeness_score", 0))
    state["missing_fields"] = result.get("missing_fields", [])
    return state


def classify_risk_node(state: ExtractionState) -> ExtractionState:
    llm = _get_llm(settings.extraction_model)
    prompt = RISK_PROMPT.format(data=json.dumps(state["extracted_fields"], indent=2))
    response = llm.invoke([HumanMessage(content=prompt)])
    result = _parse_json_response(response.content)
    state["risk_classification"] = result.get("risk_classification", "medium")
    state["risk_rationale"] = result.get("rationale", "")
    return state


def summarize_node(state: ExtractionState) -> ExtractionState:
    llm = _get_llm(settings.extraction_model)
    prompt = SUMMARY_PROMPT.format(data=json.dumps(state["extracted_fields"], indent=2))
    response = llm.invoke([HumanMessage(content=prompt)])
    state["ai_summary"] = response.content.strip()
    return state


def root_cause_node(state: ExtractionState) -> ExtractionState:
    llm = _get_llm(settings.chat_model, temperature=0.3)
    prompt = ROOT_CAUSE_PROMPT.format(data=json.dumps(state["extracted_fields"], indent=2))
    response = llm.invoke([HumanMessage(content=prompt)])
    result = _parse_json_response(response.content)
    state["root_cause_suggestions"] = result.get("root_cause_suggestions", [])
    return state


def capa_node(state: ExtractionState) -> ExtractionState:
    llm = _get_llm(settings.chat_model, temperature=0.3)
    prompt = CAPA_PROMPT.format(data=json.dumps(state["extracted_fields"], indent=2))
    response = llm.invoke([HumanMessage(content=prompt)])
    result = _parse_json_response(response.content)
    state["capa_recommendations"] = result.get("capa_recommendations", [])
    return state


def duplicate_check_node(state: ExtractionState) -> ExtractionState:
    if not state.get("existing_complaints"):
        state["duplicate_warnings"] = []
        return state

    llm = _get_llm(settings.extraction_model)
    prompt = DUPLICATE_PROMPT.format(
        new_complaint=json.dumps(state["extracted_fields"], indent=2),
        existing=json.dumps(state["existing_complaints"], indent=2),
    )
    response = llm.invoke([HumanMessage(content=prompt)])
    result = _parse_json_response(response.content)
    state["duplicate_warnings"] = result.get("duplicate_warnings", [])
    return state


def build_extraction_graph():
    graph = StateGraph(ExtractionState)
    graph.add_node("extract", extract_fields_node)
    graph.add_node("completeness", check_completeness_node)
    graph.add_node("risk", classify_risk_node)
    graph.add_node("summarize", summarize_node)
    graph.add_node("root_cause", root_cause_node)
    graph.add_node("capa", capa_node)
    graph.add_node("duplicates", duplicate_check_node)

    graph.set_entry_point("extract")
    graph.add_edge("extract", "completeness")
    graph.add_edge("completeness", "risk")
    graph.add_edge("risk", "summarize")
    graph.add_edge("summarize", "root_cause")
    graph.add_edge("root_cause", "capa")
    graph.add_edge("capa", "duplicates")
    graph.add_edge("duplicates", END)

    return graph.compile()


extraction_graph = None


def get_extraction_graph():
    global extraction_graph
    if extraction_graph is None:
        extraction_graph = build_extraction_graph()
    return extraction_graph


def run_extraction(raw_text: str, existing_complaints: list[dict] | None = None) -> dict[str, Any]:
    graph = get_extraction_graph()
    initial_state: ExtractionState = {
        "raw_text": raw_text,
        "extracted_fields": {},
        "completeness_score": 0.0,
        "missing_fields": [],
        "ai_summary": "",
        "risk_classification": "",
        "risk_rationale": "",
        "root_cause_suggestions": [],
        "capa_recommendations": [],
        "duplicate_warnings": [],
        "ai_confidence": {},
        "existing_complaints": existing_complaints or [],
    }
    return graph.invoke(initial_state)
