import json
import os
from typing import AsyncIterator

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from functools import lru_cache
from openai import AsyncOpenAI
from pydantic import BaseModel

from app.rate_limit import check_rate_limit
from app.rag.embed import embed_text
from app.rag.retrieve import retrieve
from app.rag.system_prompt import build_system_prompt

router = APIRouter()
MODEL = "gpt-4o-mini"


@lru_cache(maxsize=1)
def _openai() -> AsyncOpenAI:
    return AsyncOpenAI()
CONFIDENCE_THRESHOLD = 0.45


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]


async def _stream(
    messages: list[Message],
    chunks: list[dict],
    low_confidence: bool,
) -> AsyncIterator[str]:
    system_prompt = build_system_prompt(chunks)

    # First frame: metadata (sources + confidence)
    sources = [
        {"title": c["title"], "category": c["category"], "score": round(c["score"], 3)}
        for c in chunks
    ]
    meta = {"type": "meta", "sources": sources, "low_confidence": low_confidence}
    yield f"data: {json.dumps(meta)}\n\n"

    # Retrieval status frame
    yield 'data: {"type":"status","text":"Searching experience..."}\n\n'
    yield f'data: {{"type":"status","text":"Found {len(chunks)} relevant sections"}}\n\n'

    openai_messages = [{"role": "system", "content": system_prompt}]
    for m in messages:
        openai_messages.append({"role": m.role, "content": m.content})

    try:
        stream = await _openai().chat.completions.create(
            model=MODEL,
            messages=openai_messages,
            stream=True,
            temperature=0.7,
            max_tokens=1024,
        )
        async for event in stream:
            delta = event.choices[0].delta
            if delta.content:
                payload = {"type": "token", "text": delta.content}
                yield f"data: {json.dumps(payload)}\n\n"
    except Exception as e:  # noqa: BLE001 — surface any AI failure as a friendly message
        print(f"[chat] OpenAI error: {e}")
        err = {"type": "error", "text": "I'm having trouble reaching my AI right now — please try again shortly, or email me at kushagra.2198@gmail.com."}
        yield f"data: {json.dumps(err)}\n\n"

    yield 'data: {"type":"done"}\n\n'


@router.post("/chat")
async def chat(request: Request, body: ChatRequest):
    ip = request.headers.get("x-forwarded-for", request.client.host or "unknown")
    ip = ip.split(",")[0].strip()

    allowed, reset_in = check_rate_limit(ip)
    if not allowed:
        async def rate_limit_stream():
            msg = {
                "type": "error",
                "text": f"I've hit my hourly message limit (keeps API costs sane). Try again in {reset_in // 60} min, or email me at kushagra.2198@gmail.com.",
            }
            yield f"data: {json.dumps(msg)}\n\n"
            yield 'data: {"type":"done"}\n\n'

        return StreamingResponse(rate_limit_stream(), media_type="text/event-stream")

    # Build the retrieval query from the recent conversation, not just the last
    # message — so vague follow-ups ("give the repo for this", "tell me more")
    # still retrieve the topic established earlier in the chat.
    last_user = next(
        (m.content for m in reversed(body.messages) if m.role == "user"), ""
    )
    recent = " \n ".join(m.content for m in body.messages[-4:])
    retrieval_query = f"{last_user}\n{recent}"[:1500]

    try:
        query_embedding = await embed_text(retrieval_query)
        chunks = retrieve(query_embedding, k=7)
    except Exception as e:  # noqa: BLE001 — embeddings/KB failure → friendly message
        print(f"[chat] retrieval/embed error: {e}")
        async def kb_error_stream():
            yield 'data: {"type":"error","text":"I\'m having trouble reaching my AI right now — please try again shortly, or email me at kushagra.2198@gmail.com."}\n\n'
            yield 'data: {"type":"done"}\n\n'
        return StreamingResponse(kb_error_stream(), media_type="text/event-stream")

    top_score = chunks[0]["score"] if chunks else 0.0
    low_confidence = top_score < CONFIDENCE_THRESHOLD

    return StreamingResponse(
        _stream(body.messages, chunks, low_confidence),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
