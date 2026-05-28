# Device selection helpers for CPU/GPU execution.
"""Device resolution utilities."""

from __future__ import annotations

# Resolve the TensorFlow execution device based on preference and availability.
def resolve_device(preference: str = "auto", gpu_available: bool | None = None) -> str:
    normalized = preference.lower().strip()

    if gpu_available is None:
        import tensorflow as tf

        gpu_available = bool(tf.config.list_physical_devices("GPU"))

    if normalized in {"auto", "cuda"}:
        return "gpu" if gpu_available else "cpu"

    if normalized == "cpu":
        return "cpu"

    # Fallback for unknown values.
    return "gpu" if gpu_available else "cpu"
