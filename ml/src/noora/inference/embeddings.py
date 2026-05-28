# BERT embedding generation utilities.
"""BERT embedding utilities."""

from __future__ import annotations

from functools import lru_cache

import numpy as np

from ..constants import get_settings
from .encoder import encode

# BERT-family hidden size expected by the Noora classifier.
EMBEDDING_HIDDEN_SIZE = 768

# Lazily load and cache the embedding backbone model.
@lru_cache(maxsize=1)
def load_embedding_model():
    try:
        from transformers import TFAutoModel
    except ImportError:
        return None

    settings = get_settings()

    try:
        return TFAutoModel.from_pretrained(settings.embedding_model_name)
    except Exception:
        return None

# Creates shape-compatible placeholder embeddings for workflow testing.
def build_placeholder_embeddings(text: str | list[str], max_len: int | None = None):
    settings = get_settings()
    sequence_len = max_len or settings.max_sequence_length
    batch_size = len(text) if isinstance(text, list) else 1

    return np.zeros((batch_size, sequence_len, EMBEDDING_HIDDEN_SIZE), dtype=np.float32)

# Generate embeddings for one text or a batch of texts.
def get_embeddings(text: str | list[str], max_len: int | None = None):
    model = load_embedding_model()

    if model is None:
        return build_placeholder_embeddings(text, max_len=max_len)

    encoded = encode(text, max_len=max_len, tensor_type="tf")
    outputs = model(encoded, training=False)

    return outputs.last_hidden_state.numpy()
