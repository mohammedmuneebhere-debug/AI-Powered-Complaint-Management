from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.schemas.complaint import ChatRequest, ChatResponse
from app.services.groq_client import run_chat, stream_chat

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        reply = run_chat(
            message=request.message,
            complaint_context=request.complaint_context,
            conversation_history=request.conversation_history,
        )
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    return ChatResponse(reply=reply)


@router.post("/stream")
def chat_stream(request: ChatRequest):
    try:
        generator = stream_chat(
            message=request.message,
            complaint_context=request.complaint_context,
            conversation_history=request.conversation_history,
        )
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))

    def event_stream():
        for token in generator:
            yield token

    return StreamingResponse(event_stream(), media_type="text/plain; charset=utf-8")
