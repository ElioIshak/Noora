# Classifier loading and prediction helpers.
"""Emotion classifier prediction service."""

from __future__ import annotations

from functools import lru_cache

from ..constants import get_settings
from .embeddings import get_embeddings
from ..metrics import keras_custom_objects

# Lazily load and cache the Keras classifier model.
@lru_cache(maxsize=1)
def load_classifier_model():
    import tensorflow as tf

    settings = get_settings()
    return tf.keras.models.load_model(
        str(settings.classifier_model_path),
        custom_objects=keras_custom_objects(),
    )

# Predict class probabilities for one input message.
def predict_emotions(text: str):
    model = load_classifier_model()
    embeddings = get_embeddings(text)
    prediction = model.predict(embeddings, verbose=0)
    return prediction[0]
