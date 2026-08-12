import json
from typing import AsyncIterator

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from functools import lru_cache
from openai import AsyncOpenAI
from pydantic import BaseModel

from app.rate_limit import check_rate_limit
from app.rag.embed import embed_text
from app.rag.retrieve import retrieve

router = APIRouter()
MODEL = "gpt-4o-mini"


@lru_cache(maxsize=1)
def _openai() -> AsyncOpenAI:
    return AsyncOpenAI()


class TailorRequest(BaseModel):
    job_description: str


TAILOR_SYSTEM = """\
You are Kushagra Sinha. A recruiter or hiring manager pasted a job description \
below. Using ONLY the context about your real background that follows, write a \
short, honest, first-person pitch (NOT a cover letter, no "Dear hiring manager") \
on how you fit THIS specific role.

- Open with one warm line, then 2–3 short paragraphs.
- Name the 2–3 projects or roles from your background that are most relevant to \
  THIS job and say concretely why (tie to the JD's needs).
- Call out the specific overlapping skills/tech.
- Be honest about genuine gaps instead of overclaiming — it builds trust. Never \
  invent experience, tech, or metrics not in the context.
- Respect these boundaries: no production C++/C# experience; front-end is \
  limited (one Next.js project); applied LLM/RAG/agents, not ML model training; \
  no engineering-management experience.
- ~180 words. Conversational and confident, not buzzwordy. End by inviting a chat.

If the job is clearly unrelated to software engineering / your background, say so \
politely and note what you do focus on.

CONTEXT (your background):
{context}

JOB DESCRIPTION (from the recruiter):
{jd}"""


async def _stream(jd: str, chunks: list[dict]) -> AsyncIterator[str]:
    context = "\n\n---\n\n".join(f"[{c['title']}]\n{c['content']}" for c in chunks)
    system_prompt = TAILOR_SYSTEM.format(context=context, jd=jd[:4000])

    sources = [
        {"title": c["title"], "category": c["category"], "score": round(c["score"], 3)}
        for c in chunks
    ]
    yield f'data: {json.dumps({"type": "meta", "sources": sources, "low_confidence": False})}\n\n'
    yield 'data: {"type":"status","text":"Reading the job description..."}\n\n'
    yield 'data: {"type":"status","text":"Matching it to my background..."}\n\n'

    try:
        stream = await _openai().chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "Write the tailored pitch for this role."},
            ],
            stream=True,
            temperature=0.6,
            max_tokens=700,
        )
        async for event in stream:
            delta = event.choices[0].delta
            if delta.content:
                yield f'data: {json.dumps({"type": "token", "text": delta.content})}\n\n'
    except Exception as e:  # noqa: BLE001
        print(f"[tailor] OpenAI error: {e}")
        yield 'data: {"type":"error","text":"I\'m having trouble reaching my AI right now — please try again shortly, or email me at kushagra.2198@gmail.com."}\n\n'

    yield 'data: {"type":"done"}\n\n'


@router.post("/tailor")
async def tailor(request: Request, body: TailorRequest):
    ip = request.headers.get("x-forwarded-for", request.client.host or "unknown")
    ip = ip.split(",")[0].strip()

    allowed, reset_in = check_rate_limit(ip)
    if not allowed:
        async def limited():
            msg = {
                "type": "error",
                "text": f"Hit the hourly limit (keeps API costs sane). Try again in {reset_in // 60} min, or email me at kushagra.2198@gmail.com.",
            }
            yield f"data: {json.dumps(msg)}\n\n"
            yield 'data: {"type":"done"}\n\n'
        return StreamingResponse(limited(), media_type="text/event-stream")

    jd = (body.job_description or "").strip()
    if len(jd) < 30:
        async def too_short():
            yield 'data: {"type":"error","text":"Paste a bit more of the job description and I\'ll tailor my pitch to it."}\n\n'
            yield 'data: {"type":"done"}\n\n'
        return StreamingResponse(too_short(), media_type="text/event-stream")

    try:
        query_embedding = await embed_text(jd[:1500])
        chunks = retrieve(query_embedding, k=8)
    except RuntimeError as e:
        async def kb_error():
            yield f'data: {{"type":"error","text":"Knowledge base not ready: {e}"}}\n\n'
            yield 'data: {"type":"done"}\n\n'
        return StreamingResponse(kb_error(), media_type="text/event-stream")

    return StreamingResponse(
        _stream(jd, chunks),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
