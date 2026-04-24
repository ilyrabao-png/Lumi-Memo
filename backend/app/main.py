from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import flashcards, health, lessons, profile
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(title="Lumi & Memo API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(lessons.router, prefix="/lessons", tags=["lessons"])
app.include_router(flashcards.router, prefix="/flashcards", tags=["flashcards"])
app.include_router(profile.router, prefix="/profile", tags=["profile"])
