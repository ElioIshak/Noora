from __future__ import annotations

from functools import lru_cache

from ..constants import EMBEDDING_MODEL_NAME, MAX_LEN


@lru_cache(maxsize=1)
def load_tokenizer():
    from transformers import AutoTokenizer

    return AutoTokenizer.from_pretrained(EMBEDDING_MODEL_NAME)


def encode(input_text: str | list[str], max_len: int | None = None):
    tokenizer = load_tokenizer()
    sequence_len = max_len or MAX_LEN

    return tokenizer(
        input_text,
        padding="max_length",
        truncation=True,
        return_tensors="pt",
        max_length=sequence_len,
    )
