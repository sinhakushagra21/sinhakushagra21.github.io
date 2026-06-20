import json
from pathlib import Path
from functools import lru_cache

import numpy as np

DATA_PATH = Path(__file__).parent.parent.parent / "data" / "knowledge_base.json"


@lru_cache(maxsize=1)
def _load_kb() -> tuple[list[dict], np.ndarray]:
    if not DATA_PATH.exists():
        raise RuntimeError(
            f"knowledge_base.json not found at {DATA_PATH}. "
            "Run: cd backend && make embed"
        )
    with open(DATA_PATH) as f:
        chunks = json.load(f)
    embeddings = np.array([c["embedding"] for c in chunks], dtype=np.float32)
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    normalized = embeddings / np.maximum(norms, 1e-10)
    return chunks, normalized


def retrieve(query_embedding: list[float], k: int = 5) -> list[dict]:
    chunks, normalized_kb = _load_kb()
    q = np.array(query_embedding, dtype=np.float32)
    q = q / max(np.linalg.norm(q), 1e-10)
    scores = normalized_kb @ q
    top_indices = np.argsort(scores)[::-1][:k]
    results = []
    for idx in top_indices:
        chunk = dict(chunks[idx])
        chunk["score"] = float(scores[idx])
        chunk.pop("embedding", None)
        results.append(chunk)
    return results
