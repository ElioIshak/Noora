# Shared constants and runtime settings used across Noora.
"""Project-wide constants and settings."""

from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

EMOTION_LABELS = [
    "admiration",
    "amusement",
    "anger",
    "annoyance",
    "approval",
    "caring",
    "confusion",
    "curiosity",
    "desire",
    "disappointment",
    "disapproval",
    "disgust",
    "embarrassment",
    "excitement",
    "fear",
    "gratitude",
    "grief",
    "joy",
    "love",
    "nervousness",
    "optimism",
    "pride",
    "realization",
    "relief",
    "remorse",
    "sadness",
    "surprise",
    "neutral",
]

DEFAULT_TOP_K = 3


# Resolve the ML project root folder.
def project_root() -> Path:
    return Path(__file__).resolve().parents[2]


# Store all runtime settings in one typed object.
@dataclass(frozen=True)
class Settings:
    classifier_model_path: Path
    complex_emotions_path: Path
    embedding_model_name: str
    ollama_model_name: str
    ollama_host: str | None
    device_preference: str
    max_sequence_length: int
    gemini_api_key: str | None
    gemini_model_name: str


# Read settings from environment variables with safe defaults.
@lru_cache(maxsize=1)
def get_settings() -> Settings:
    root = project_root()

    classifier_model_path = Path(
        os.getenv("NOORA_CLASSIFIER_MODEL_PATH", root / "saved_models" / "Noora_v7.keras")
    )
    complex_emotions_path = Path(
        os.getenv("NOORA_COMPLEX_EMOTIONS_PATH", root / "data" / "complex_emotions.pkl")
    )

    return Settings(
        classifier_model_path=classifier_model_path,
        complex_emotions_path=complex_emotions_path,
        embedding_model_name=os.getenv("NOORA_EMBEDDING_MODEL", "bhadresh-savani/bert-base-go-emotion"),
        ollama_model_name=os.getenv("NOORA_OLLAMA_MODEL", "Noora"),
        ollama_host=os.getenv("NOORA_OLLAMA_HOST"),
        device_preference=os.getenv("NOORA_DEVICE", "auto").lower(),
        max_sequence_length=int(os.getenv("NOORA_MAX_LEN", "150")),
        gemini_api_key=os.getenv("GEMINI_API_KEY", "AIzaSyBe2z5Do-nARFgC-6R4s8gYavfsfRaUccE"),
        gemini_model_name=os.getenv("GEMINI_MODEL_NAME", "gemini-2.5-flash"),
    )
