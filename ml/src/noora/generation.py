# GEMINI response-generation client wrappers.

from __future__ import annotations

from functools import lru_cache

from .constants import get_settings

import time

from google.api_core.exceptions import ResourceExhausted
from google.api_core.exceptions import ServiceUnavailable


# Lazily load and cache the GEMINI client instance.
@lru_cache(maxsize=1)
def get_gemini_client():
    from google import genai

    settings = get_settings()
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is required for Gemini response generation.")

    return genai.Client(api_key=settings.gemini_api_key)


# Generate a plain text GEMINI response from a prompt.
def generate_response(prompt: str) -> str:
    settings = get_settings()

    retries = 3
    delay = 2

    for attempt in range(retries):
        try:
            response = get_gemini_client().models.generate_content(
                model=settings.gemini_model_name,
                contents=prompt,
            )

            if not response.text:
                raise RuntimeError("Gemini returned no response text.")

            return response.text.strip()

        except ServiceUnavailable:
            if attempt == retries - 1:
                return (
                    "Noora is currently experiencing high demand. "
                    "Please try again in a moment."
                )

            time.sleep(delay)
            delay *= 2

        except ResourceExhausted:
            return (
                "Noora has temporarily exceeded its AI quota. "
                "Please try again later."
            )
