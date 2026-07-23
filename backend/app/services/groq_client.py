import json
from collections.abc import Generator
from typing import Any

from groq import Groq

from app.agents.prompts import CHAT_SYSTEM_PROMPT
from app.config import settings


def get_groq_client() -> Groq:
    if not settings.groq_api_key or settings.groq_api_key == "your_groq_api_key_here":
        raise ValueError("GROQ_API_KEY is not configured. Add it to backend/.env")
    return Groq(api_key=settings.groq_api_key)


def _build_chat_messages(
    message: str,
    complaint_context: dict[str, Any],
    conversation_history: list[dict[str, str]],
) -> list[dict[str, str]]:
    system = CHAT_SYSTEM_PROMPT.format(
        context=json.dumps(complaint_context, indent=2, default=str)
    )
    messages: list[dict[str, str]] = [{"role": "system", "content": system}]
    for turn in conversation_history[-10:]:
        role = turn.get("role")
        content = turn.get("content", "")
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": message})
    return messages


def run_chat(
    message: str,
    complaint_context: dict[str, Any],
    conversation_history: list[dict[str, str]],
    *,
    model: str | None = None,
    temperature: float = 0.5,
    max_completion_tokens: int = 2048,
) -> str:
    client = get_groq_client()
    messages = _build_chat_messages(message, complaint_context, conversation_history)

    completion = client.chat.completions.create(
        model=model or settings.chat_model,
        messages=messages,
        temperature=temperature,
        max_completion_tokens=max_completion_tokens,
        top_p=1,
        stream=False,
    )
    return (completion.choices[0].message.content or "").strip()


def stream_chat(
    message: str,
    complaint_context: dict[str, Any],
    conversation_history: list[dict[str, str]],
    *,
    model: str | None = None,
    temperature: float = 0.5,
    max_completion_tokens: int = 2048,
) -> Generator[str, None, None]:
    client = get_groq_client()
    messages = _build_chat_messages(message, complaint_context, conversation_history)

    completion = client.chat.completions.create(
        model=model or settings.chat_model,
        messages=messages,
        temperature=temperature,
        max_completion_tokens=max_completion_tokens,
        top_p=1,
        stream=True,
        stop=None,
    )

    for chunk in completion:
        content = chunk.choices[0].delta.content or ""
        if content:
            yield content
