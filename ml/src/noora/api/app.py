# FastAPI routes for the Noora ML runtime service.
"""HTTP API for stateless Noora runtime inference."""

from __future__ import annotations

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from ..pipeline import run_pipeline

# Create the FastAPI app instance.
app = FastAPI(title="Noora ML API", version="3.0.0")


# Request payload for the `/run_app` endpoint.
class RunAppRequest(BaseModel):
    input: str = Field(..., min_length=1)
    UserID: str = Field(..., min_length=1)
    conversation_history: str | None = None


# Response payload returned by the `/run_app` endpoint.
class RunAppResponse(BaseModel):
    response: str
    emotions: list[str]
    complex_emotion: str | None


# Lightweight health endpoint for container/orchestrator checks.
@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


# Run one end-to-end request through the Noora ML pipeline.
@app.post("/run_app", response_model=RunAppResponse)
def run_app(request: RunAppRequest) -> RunAppResponse:
    try:
        result = run_pipeline(
            input=request.input,
            user=request.UserID,
            conversation_history=request.conversation_history,
        )
    except Exception as exc:
        import traceback

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )

    return RunAppResponse(
        response=result["response"],
        emotions=result["emotions"],
        complex_emotion=result["complex_emotion"],
    )
