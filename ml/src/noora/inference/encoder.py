# Text tokenizer and encoding utilities.
"""Tokenizer and encoding helpers."""

from __future__ import annotations

from functools import lru_cache

from ..constants import get_settings

# Lazily load and cache the tokenizer.
@lru_cache(maxsize=1)
def load_tokenizer():
    from transformers import AutoTokenizer

    settings = get_settings()
    return AutoTokenizer.from_pretrained(settings.embedding_model_name)

# Encode input text into framework-specific token tensors.
def encode(text: str | list[str], max_len: int | None = None, tokenizer=None, tensor_type: str = "tf"):
    settings = get_settings()
    tokenizer = tokenizer or load_tokenizer()
    sequence_len = max_len or settings.max_sequence_length

    return tokenizer(
        text,
        padding="max_length",
        truncation=True,
        return_tensors=tensor_type,
        max_length=sequence_len,
    )
