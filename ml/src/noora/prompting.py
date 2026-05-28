# Prompt construction and complex-emotion interpretation.
"""Prompt construction and emotion interpretation."""

from __future__ import annotations

import pickle
from functools import lru_cache
from pathlib import Path

import numpy as np

from .constants import get_settings
from .constants import DEFAULT_TOP_K, EMOTION_LABELS


# Load Noora's assistant identity and response rules.
@lru_cache(maxsize=1)
def load_noora_orientation() -> str:
    orientation_path = Path(__file__).with_name("noora_orientation.md")
    if not orientation_path.exists():
        return ""

    return orientation_path.read_text(encoding="utf-8").strip()


# Return top-k detected emotions from classifier probabilities.
def top_emotions(probabilities, top_k: int = DEFAULT_TOP_K) -> list[str]:
    top_indices = np.argsort(probabilities)[-top_k:][::-1]
    return [EMOTION_LABELS[index] for index in top_indices]


# Load and cache complex-emotions data from disk.
@lru_cache(maxsize=1)
def load_complex_emotions_data() -> tuple[list[list[str]], list[str]]:
    settings = get_settings()
    path = Path(settings.complex_emotions_path)
    if not path.exists():
        return [], []

    with path.open("rb") as file_handle:
        raw_data = pickle.load(file_handle)

    combinations: list[list[str]]
    resulting_emotions: list[str]

    if isinstance(raw_data, dict):
        combinations = raw_data.get("combinations", [])
        resulting_emotions = raw_data.get("resulting_emotions", [])
    elif isinstance(raw_data, tuple) and len(raw_data) == 2:
        resulting_emotions, combinations = raw_data
    else:
        return [], []

    # Legacy builder scripts sometimes include a leading empty combination.
    if (
        isinstance(combinations, list)
        and len(combinations) == len(resulting_emotions) + 1
        and combinations
        and combinations[0] == []
    ):
        combinations = combinations[1:]

    cleaned_combinations: list[list[str]] = []
    for combo in combinations:
        if isinstance(combo, (list, tuple)):
            cleaned_combinations.append([str(item).strip().lower() for item in combo])

    cleaned_resulting_emotions = [str(item).strip().lower() for item in resulting_emotions]
    return cleaned_combinations, cleaned_resulting_emotions


# Resolve complex emotion from top detected emotions.
def check_complex_emotions(emotions) -> str | None:
    top_three_emotions = top_emotions(emotions, top_k=3)
    combinations, resulting_emotions = load_complex_emotions_data()
    complex_emo = None

    if top_three_emotions in combinations:
        complex_emo = resulting_emotions[combinations.index(top_three_emotions)]

    if "joy" in top_three_emotions and "sadness" in top_three_emotions:
        complex_emo = "bittersweet"
    elif "disgust" in top_three_emotions and "anger" in top_three_emotions:
        complex_emo = "envy"
    elif "optimism" in top_three_emotions and "joy" in top_three_emotions:
        complex_emo = "hope"

    return complex_emo


# Build prompt guidance rules from detected emotions.
def rules_generator(emotions, complex_emotion=None):
    top_three_indices = np.argsort(emotions)[-3:][::-1]
    rules: list[str] = []

    if complex_emotion is None:
        for index in top_three_indices:
            if emotions[index] < 0.3:
                continue

            emotion = EMOTION_LABELS[index]

            if emotion == "admiration":
                rules.append("The user may be experiencing admiration or inspiration.")
            elif emotion == "amusement":
                rules.append("The user may be feeling amused or light-hearted.")
            elif emotion == "anger":
                rules.append("The user is likely feeling anger - consider using calm and validating language.")
            elif emotion == "annoyance":
                rules.append("The user may be annoyed or frustrated - approach with empathy.")
            elif emotion == "approval":
                rules.append("The user shows signs of approval - this could reflect agreement or support.")
            elif emotion == "caring":
                rules.append("The user expresses care - reinforce emotional connection.")
            elif emotion == "confusion":
                rules.append("The user feels confused - aim to clarify and guide gently.")
            elif emotion == "curiosity":
                rules.append("The user is curious - offer thoughtful insights.")
            elif emotion == "desire":
                rules.append("The user shows desire - help them reflect on what they truly want.")
            elif emotion == "disappointment":
                rules.append("The user is disappointed - acknowledge this and offer support.")
            elif emotion == "disapproval":
                rules.append("The user expresses disapproval - be respectful and avoid judgment.")
            elif emotion == "disgust":
                rules.append("The user is feeling disgust - keep the tone respectful and composed.")
            elif emotion == "embarrassment":
                rules.append("The user may be feeling embarrassed - respond with kindness and reassurance.")
            elif emotion == "excitement":
                rules.append("The user is excited - match their energy with positivity.")
            elif emotion == "fear":
                rules.append("The user feels fear - offer emotional safety and reassurance.")
            elif emotion == "gratitude":
                rules.append("The user feels gratitude - acknowledge it warmly.")
            elif emotion == "grief":
                rules.append("The user is experiencing grief - respond with compassion and sensitivity.")
            elif emotion == "joy":
                rules.append("The user is joyful - encourage them to embrace that feeling.")
            elif emotion == "love":
                rules.append("The user is expressing love - handle this with warmth and care.")
            elif emotion == "nervousness":
                rules.append("The user feels nervous - offer calming and encouraging support.")
            elif emotion == "optimism":
                rules.append("The user is optimistic - reinforce their hopeful mindset.")
            elif emotion == "pride":
                rules.append("The user feels pride - affirm their sense of accomplishment.")
            elif emotion == "realization":
                rules.append("The user had a realization - support their reflection process.")
            elif emotion == "relief":
                rules.append("The user feels relief - keep the tone light and supportive.")
            elif emotion == "remorse":
                rules.append("The user expresses remorse - guide them with empathy and non-judgment.")
            elif emotion == "sadness":
                rules.append("The user is sad - use a comforting and gentle tone.")
            elif emotion == "surprise":
                rules.append("The user is surprised - acknowledge the unexpected nature of their feeling.")
            elif emotion == "neutral":
                rules.append("The user feels neutral - maintain a calm and supportive tone.")

    return rules


# Build the final response-generation prompt.
def generate_prompt(user_name, message, emotions, complex_emotion=None, conversation_history: str | None = None):
    top_three_emotions = top_emotions(emotions, top_k=3)
    orientation = load_noora_orientation()
    prompt = ""

    if orientation:
        prompt += f"{orientation}\n\n"

    prompt += (
        f"Generate a short paragraph responding to the {user_name}'s message: "
        f"'{message}', knowing they are feeling: {top_three_emotions}"
    )

    if complex_emotion is not None:
        prompt = prompt + f", and can be interpreted as {complex_emotion}.\n"

    rules = rules_generator(emotions=emotions, complex_emotion=complex_emotion)
    for rule in rules:
        prompt += rule + "\n"

    if conversation_history:
        prompt += (
            "\nUse the following recent conversation history to keep continuity:\n"
            f"{conversation_history}\n"
        )

    return prompt
