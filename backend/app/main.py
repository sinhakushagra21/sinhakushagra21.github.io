import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.api.chat import router as chat_router
from app.api.tailor import router as tailor_router
from app.api.notes import router as notes_router

load_dotenv()

app = FastAPI(title="Kushagra Portfolio API")

allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = [o.strip() for o in allowed_origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")
app.include_router(tailor_router, prefix="/api")
app.include_router(notes_router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
