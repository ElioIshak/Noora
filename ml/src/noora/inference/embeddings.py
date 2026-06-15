from __future__ import annotations

from functools import lru_cache

from ..constants import EMBEDDING_MODEL_NAME
from .encoder import encode


@lru_cache(maxsize=1)
def load_embedding_model():
    import torch
    from transformers import AutoModel

    model = AutoModel.from_pretrained(EMBEDDING_MODEL_NAME)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)
    model.eval()
    return model, device


def get_embeddings(input_text: str | list[str], max_len: int | None = None):
    import torch

    model, device = load_embedding_model()
    tokens_ids = encode(input_text, max_len=max_len)
    tokens_ids = {key: value.to(device) for key, value in tokens_ids.items()}

    with torch.no_grad():
        outputs = model(**tokens_ids)
        last_hidden_state = outputs.last_hidden_state

    return last_hidden_state.cpu().numpy()
