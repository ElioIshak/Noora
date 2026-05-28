# Public inference exports for runtime usage.
"""Inference services for Noora."""

from .classifier import predict_emotions

__all__ = ["predict_emotions"]
