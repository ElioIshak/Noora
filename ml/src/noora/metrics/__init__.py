# Metric exports and custom-object mapping for Keras model loading.
"""Custom Keras metrics used by saved models."""

from __future__ import annotations

# Return the metric mapping required by tf.keras.models.load_model.
def keras_custom_objects() -> dict[str, object]:
    from .f1_score import F1Score
    from .multi_label_f1 import MultiLabelF1Score

    return {
        "F1Score": F1Score,
        "MultiLabelF1Score": MultiLabelF1Score,
    }


__all__ = ["keras_custom_objects"]
