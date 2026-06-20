"""
Visitor sticky-notes — a private guestbook.

Anyone can POST a note; reading them back requires a secret key (NOTES_VIEW_KEY),
so notes are private to Kushagra. Stored as a JSON file on disk. NOTE: on an
ephemeral host (e.g. Render free tier) the file resets on redeploy — swap _load/
_save for a real DB if you need durable storage.
"""
import json
import os
import time
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()
NOTES_PATH = Path(__file__).parent.parent.parent / "data" / "notes.json"
MAX_NOTES = 500


class NoteIn(BaseModel):
    name: str | None = None
    message: str


def _load() -> list[dict]:
    if NOTES_PATH.exists():
        try:
            return json.loads(NOTES_PATH.read_text())
        except (json.JSONDecodeError, OSError):
            return []
    return []


def _save(notes: list[dict]) -> None:
    NOTES_PATH.parent.mkdir(parents=True, exist_ok=True)
    NOTES_PATH.write_text(json.dumps(notes, indent=2))


@router.post("/notes")
async def add_note(body: NoteIn):
    msg = (body.message or "").strip()
    if len(msg) < 2:
        raise HTTPException(400, "Write a little more.")
    if len(msg) > 1000:
        raise HTTPException(400, "Keep it under 1000 characters.")
    name = (body.name or "").strip()[:60] or "anonymous"
    notes = _load()
    notes.append({"name": name, "message": msg, "ts": int(time.time())})
    _save(notes[-MAX_NOTES:])
    return {"ok": True}


@router.get("/notes")
async def list_notes(key: str = ""):
    expected = os.getenv("NOTES_VIEW_KEY", "")
    if not expected or key != expected:
        raise HTTPException(403, "Not authorized.")
    return {"notes": list(reversed(_load()))}
