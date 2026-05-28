# Noora ML Runtime

This folder contains Noora's Python ML service. It exposes a FastAPI API used by the TypeScript backend.

## What It Does

- Loads the local emotion classifier from `ml/saved_models`.
- Uses emotion label data and complex-emotion assets from `ml/data`.
- Builds a Noora-specific prompt from the assistant orientation, user message, detected emotions, complex emotion, and conversation history.
- Sends the final prompt to Gemini through `google-genai`.
- Returns the generated response plus emotion metadata to the backend.

## Important Paths

- Runtime package: `ml/src/noora`
- FastAPI app: `ml/src/noora/api/app.py`
- Pipeline orchestration: `ml/src/noora/pipeline.py`
- Gemini generation wrapper: `ml/src/noora/generation.py`
- Noora assistant orientation: `ml/src/noora/noora_orientation.md`
- Prompt builder: `ml/src/noora/prompting.py`
- Classifier inference: `ml/src/noora/inference`
- Data assets: `ml/data`
- Saved models: `ml/saved_models`
- Archived training scripts: `ml/archive/training`

## Environment

Required for response generation:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL_NAME=gemini-2.0-flash
```

Common ML settings:

```env
NOORA_CLASSIFIER_MODEL_PATH=ml/saved_models/Noora_v7.keras
NOORA_COMPLEX_EMOTIONS_PATH=ml/data/complex_emotions.pkl
NOORA_EMBEDDING_MODEL=bhadresh-savani/bert-base-go-emotion
NOORA_DEVICE=auto
NOORA_MAX_LEN=150
```

No Ollama server or local response LLM is required.

## Run Locally

```bash
cd ml
pip install -r requirements.txt
python -m noora.api
```

If Python cannot find the `noora` package, set `PYTHONPATH` to `src`.

PowerShell:

```powershell
$env:PYTHONPATH = "$PWD\src"
python -m noora.api
```

## API

Health:

```http
GET /health
```

Runtime:

```http
POST /run_app
```

Request:

```json
{
  "input": "I feel overwhelmed.",
  "UserID": "42",
  "conversation_history": "User: ...\nNoora: ..."
}
```

Response:

```json
{
  "response": { "response": "You are not alone." },
  "emotions": ["sadness", "fear", "nervousness"],
  "complex_emotion": "bittersweet"
}
```

## Upcoming Work

- Add a RAG layer so Noora can retrieve project-approved context before generating a response.
- Add ingestion and retrieval utilities for documents, chunks, embeddings, and source metadata.
- Extend prompt construction so retrieved context is clearly separated from emotion guidance and conversation history.
