from functools import lru_cache
from openai import AsyncOpenAI

MODEL = "text-embedding-3-small"


@lru_cache(maxsize=1)
def _client() -> AsyncOpenAI:
    return AsyncOpenAI()


async def embed_text(text: str) -> list[float]:
    response = await _client().embeddings.create(model=MODEL, input=text)
    return response.data[0].embedding
