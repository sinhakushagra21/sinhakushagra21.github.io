"""
Private activity log — records anonymous interaction events so Kushagra can see
what visitors did (questions asked, recruiter mode, calls booked, threads opened)
and roughly where from. No names, no full IPs — just type/detail/city/time.
Reading requires NOTES_VIEW_KEY. Stored as a JSON file (ephemeral on free hosts).
"""
import json
import os
import time
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()
EVENTS_PATH = Path(__file__).parent.parent.parent / "data" / "events.json"
MAX_EVENTS = 1000


class EventIn(BaseModel):
    type: str
    detail: str | None = None
    place: str | None = None


def _load() -> list[dict]:
    if EVENTS_PATH.exists():
        try:
            return json.loads(EVENTS_PATH.read_text())
        except (json.JSONDecodeError, OSError):
            return []
    return []


def _save(events: list[dict]) -> None:
    EVENTS_PATH.parent.mkdir(parents=True, exist_ok=True)
    EVENTS_PATH.write_text(json.dumps(events, indent=2))


@router.post("/events")
async def add_event(body: EventIn):
    ev = {
        "type": (body.type or "event")[:40],
        "detail": (body.detail or "")[:200],
        "place": (body.place or "")[:80],
        "ts": int(time.time()),
    }
    events = _load()
    events.append(ev)
    _save(events[-MAX_EVENTS:])
    return {"ok": True}


@router.get("/events")
async def list_events(key: str = ""):
    expected = os.getenv("NOTES_VIEW_KEY", "")
    if not expected or key != expected:
        raise HTTPException(403, "Not authorized.")
    return {"events": list(reversed(_load()))}
