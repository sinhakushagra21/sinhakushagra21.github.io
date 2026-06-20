#!/usr/bin/env python3
"""
Build the RAG knowledge base from the curated markdown files in data/knowledge/.

These hand-written files (knowledge-base.md, project-details.md,
project-deep-dives.md) are the source of truth — far richer and more accurate
than the résumé, which led the model to hallucinate. We chunk them by section
and STRIP interview-prep meta (Be-ready-to-answer blocks, "(confirm…)" notes,
[placeholders], FAANG/coaching asides) so none of that ever reaches a recruiter.

Run: python scripts/build_embeddings.py   (re-run whenever the .md files change)
"""
import json
import re
import sys
from pathlib import Path

from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

ROOT = Path(__file__).parent.parent
KB_DIR = ROOT / "data" / "knowledge"
OUTPUT_PATH = ROOT / "data" / "knowledge_base.json"

client = OpenAI()
EMBED_MODEL = "text-embedding-3-small"

# per-file: which heading levels start a new chunk, and whether the level-1
# heading is a meaningful "parent" (company) to prefix onto child titles.
FILES = [
    {"name": "knowledge-base.md", "levels": {2, 3}, "use_parent": False},
    {"name": "project-deep-dives.md", "levels": {2}, "use_parent": True},
    {"name": "project-details.md", "levels": {1}, "use_parent": False},
]

# titles whose whole section is meta and must be dropped entirely
SKIP_TITLE = re.compile(
    r"boundaries|cross-cutting|ai-assisted code review|how to use|rules for any ai",
    re.I,
)
# a line that begins an interview-prep block — truncate the chunk here
TRUNCATE_AT = re.compile(r"\*{0,2}be ready to answer|cross-cutting interview", re.I)
# whole lines that are coaching/meta, not facts about Kushagra
COACH_LINE = re.compile(
    r"be ready to (answer|defend|soften)|faang|\binterviews?\b|interviewer|whiteboard|"
    r"hms? probe|lead with it|deep-dive|deep dive\b|keep (it )?off|portfolio piece|"
    r"r[ée]sum[ée] bullet|resume bullet|honest note|weakest item|resume note:|"
    r"likely (deep-?dive|trap)|that'?s the difference between a demo",
    re.I,
)
# inline meta parentheticals to remove
META_PAREN = re.compile(
    r"_?\((?:confirm|add|no metric|metric:|fill in)[^)]*\)_?", re.I
)
# parentheticals that are coaching directed at Kushagra
COACH_PAREN = re.compile(
    r"\s*\([^)]*(?:know these cold|know this cold|be ready|gold for)[^)]*\)", re.I
)
PLACEHOLDER = re.compile(r"\[[^\]]*\]")


def clean(body: str) -> str:
    out: list[str] = []
    for line in body.splitlines():
        if TRUNCATE_AT.search(line):
            break
        s = line.strip()
        if s.startswith(">") or s == "---":
            continue
        if COACH_LINE.search(line):
            continue
        line = META_PAREN.sub("", line)
        line = COACH_PAREN.sub("", line)
        line = PLACEHOLDER.sub("", line)
        line = line.replace(" :", ":")
        line = re.sub(r"[ \t]{2,}", " ", line).rstrip()
        # drop lines left as a dangling label after stripping a placeholder
        if re.fullmatch(r"[-*•\s]*[A-Za-z /&]*:?", line) and len(line.strip(" -*:")) < 3:
            continue
        out.append(line)
    text = re.sub(r"\n{3,}", "\n\n", "\n".join(out)).strip()
    return text


def categorize(title: str) -> str:
    t = title.lower()
    if any(c in t for c in ["tesla", "qualcomm", "zomato", "bluestone"]):
        return "experience"
    if any(p in t for p in ["rolloutx", "fitgen", "fitness", "fast commerce", "resume tailor", "project"]):
        return "project"
    if "education" in t or "northeastern" in t or "pes" in t:
        return "education"
    if "skill" in t:
        return "skills"
    return "about"


def slugify(title: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return s[:60] or "section"


def chunk_file(path: Path, levels: set[int], use_parent: bool) -> list[dict]:
    chunks: list[dict] = []
    parent = ""
    cur_title: str | None = None
    cur_lines: list[str] = []

    def flush():
        if cur_title is None:
            return
        if SKIP_TITLE.search(cur_title):
            return
        body = clean("\n".join(cur_lines))
        if len(body) < 40:
            return
        title = cur_title
        if use_parent and parent and parent.lower() not in title.lower():
            title = f"{parent} — {cur_title}"
        # strip coaching asides from the title (shown to recruiters as a source)
        title = re.sub(r"\s*\*\([^)]*\)\*", "", title)
        title = re.sub(r"\s*\((?:this tool)\)", "", title, flags=re.I)
        title = title.strip()
        chunks.append({"title": title, "content": body, "category": categorize(title)})

    for raw in path.read_text().splitlines():
        m = re.match(r"^(#{1,6})\s+(.*)$", raw)
        if m:
            level, heading = len(m.group(1)), m.group(2).strip()
            if level == 1 and 1 not in levels:
                flush()
                parent, cur_title, cur_lines = heading, None, []
                continue
            if level in levels:
                flush()
                cur_title, cur_lines = heading, []
                continue
        if cur_title is not None:
            cur_lines.append(raw)
    flush()
    return chunks


VISA_CHUNK = {
    "id": "visa-status",
    "title": "Visa & Work Authorization",
    "category": "about",
    "content": (
        "I'm on an F-1 student visa and will be on F-1 OPT (Optional Practical "
        "Training) around mid-2026. I'll need H1B sponsorship for full-time roles "
        "and am fully open to employers who sponsor. STEM OPT gives up to 3 years "
        "of work authorization before H1B is required. I'm not a US citizen or "
        "permanent resident."
    ),
}


RELOCATION_CHUNK = {
    "id": "relocation-location-availability",
    "title": "Relocation, Location & Availability",
    "category": "about",
    "content": (
        "I'm based in Boston, MA and I'm open to relocation anywhere in the US for "
        "the right role — remote, hybrid, or onsite all work for me. I'm available "
        "to start full-time around August 2026, after finishing my MS at "
        "Northeastern (graduating mid-2026). I'm targeting backend, "
        "distributed-systems, and cloud / AI-infrastructure engineering roles, "
        "including at top product companies. Yes — I'm happy to relocate."
    ),
}


def main():
    if not KB_DIR.exists():
        print(f"ERROR: {KB_DIR} not found.")
        sys.exit(1)

    chunks: list[dict] = []
    seen_ids: set[str] = set()
    for cfg in FILES:
        path = KB_DIR / cfg["name"]
        if not path.exists():
            print(f"WARN: {path} missing, skipping")
            continue
        for c in chunk_file(path, cfg["levels"], cfg["use_parent"]):
            cid = slugify(c["title"])
            while cid in seen_ids:
                cid += "-x"
            seen_ids.add(cid)
            c["id"] = cid
            chunks.append(c)

    chunks.append(VISA_CHUNK)
    chunks.append(RELOCATION_CHUNK)

    print(f"Built {len(chunks)} chunks:")
    for c in chunks:
        print(f"  [{c['category']}] {c['title']}  ({len(c['content'])} chars)")

    texts = [f"{c['title']}\n\n{c['content']}" for c in chunks]
    print(f"\nEmbedding {len(texts)} chunks via {EMBED_MODEL}...")
    resp = client.embeddings.create(model=EMBED_MODEL, input=texts)
    for i, c in enumerate(chunks):
        c["embedding"] = resp.data[i].embedding

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(chunks, f, indent=2)
    print(f"\nWrote {len(chunks)} chunks to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
