# CLI entrypoint for running the Noora ML API service.
"""Run Noora ML API with `python -m noora.api`."""

from __future__ import annotations

import os

import uvicorn

from .app import app


# Start the HTTP server process.
def main() -> None:
    host = os.getenv("NOORA_API_HOST", "127.0.0.1").strip() or "127.0.0.1"
    port = int(os.getenv("NOORA_API_PORT", "8000"))
    uvicorn.run(app, host=host, port=port, reload=False)


if __name__ == "__main__":
    main()
