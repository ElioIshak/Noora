# TensorFlow-compatible macro F1 metric for multilabel outputs.
"""TensorFlow macro F1 metric for multilabel classification."""

from __future__ import annotations

import tensorflow as tf

# Compute macro F1 by averaging per-label F1 scores.
@tf.keras.utils.register_keras_serializable()
class MultiLabelF1Score(tf.keras.metrics.Metric):
    def __init__(
        self,
        num_labels: int | None = None,
        name: str = "f1_score_macro",
        threshold: float = 0.5,
        **kwargs,
    ):
        super().__init__(name=name, **kwargs)
        self.threshold = threshold
        self.num_labels = 28 if num_labels is None else num_labels

        self.tp = self.add_weight(name="tp", shape=(self.num_labels,), initializer="zeros")
        self.fp = self.add_weight(name="fp", shape=(self.num_labels,), initializer="zeros")
        self.fn = self.add_weight(name="fn", shape=(self.num_labels,), initializer="zeros")

    def update_state(self, y_true, y_pred, sample_weight=None):
        y_pred = tf.cast(y_pred > self.threshold, tf.float32)
        y_true = tf.cast(y_true, tf.float32)

        self.tp.assign_add(tf.reduce_sum(y_true * y_pred, axis=0))
        self.fp.assign_add(tf.reduce_sum((1 - y_true) * y_pred, axis=0))
        self.fn.assign_add(tf.reduce_sum(y_true * (1 - y_pred), axis=0))

    def result(self):
        precision = self.tp / (self.tp + self.fp + tf.keras.backend.epsilon())
        recall = self.tp / (self.tp + self.fn + tf.keras.backend.epsilon())
        f1 = 2 * precision * recall / (precision + recall + tf.keras.backend.epsilon())
        return tf.reduce_mean(f1)

    def reset_states(self):
        self.tp.assign(tf.zeros_like(self.tp))
        self.fp.assign(tf.zeros_like(self.fp))
        self.fn.assign(tf.zeros_like(self.fn))

    def get_config(self):
        config = super().get_config()
        config.update({"num_labels": self.num_labels, "threshold": self.threshold})
        return config
