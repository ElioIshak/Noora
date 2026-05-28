# End-to-end orchestration of inference, prompting, and generation.
"""End-to-end Noora runtime pipeline."""

from __future__ import annotations

from .generation import generate_response
from .inference.classifier import predict_emotions
from .prompting import check_complex_emotions, generate_prompt, top_emotions


# Run the full runtime pipeline for one user message.
def run_pipeline(input: str, user: str, conversation_history: str | None = None) -> dict[str, object]:
    prediction = predict_emotions(input)
    detected_top_emotions = top_emotions(prediction, top_k=3)
    complex_emotion = check_complex_emotions(prediction)
    prompt = generate_prompt(
        user,
        input,
        prediction,
        complex_emotion,
        conversation_history=conversation_history,
    )
    response = generate_response(prompt)

    return {
        "emotions": detected_top_emotions,
        "complex_emotion": complex_emotion,
        "response": response,
    }
