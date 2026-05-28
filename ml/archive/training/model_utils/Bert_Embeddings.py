import torch
import numpy as np

from transformers import AutoModel, AutoTokenizer

MAX_LEN = 150

tokenizer = AutoTokenizer.from_pretrained("bhadresh-savani/bert-base-go-emotion")


def encode(input_text):
    if isinstance(input_text, str):
        input_text = input_text.lower()
    else:
        input_text = [text.lower() for text in input_text]
    return tokenizer(
        input_text,
        padding="max_length",
        truncation=True,
        return_tensors="pt",
        max_length=MAX_LEN,
    )

# Bert Embeddings
bert_model = AutoModel.from_pretrained("bhadresh-savani/bert-base-go-emotion").to('cuda') # For v6
# bert_model = BertModel.from_pretrained("bert-base-uncased").to('cuda') # For v5
bert_model.eval()
    
def get_embeddings(input_text, max_len=MAX_LEN):
    tokens_ids = encode(input_text)
    tokens_ids = {k: v.to("cuda") for k, v in tokens_ids.items()}

    with torch.no_grad():
        outputs = bert_model(**tokens_ids)
        last_hidden_state = outputs.last_hidden_state  # shape: (1, seq_len, 768)

    return last_hidden_state.cpu().numpy()
