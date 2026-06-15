FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONPATH=/app/src \
    NOORA_API_HOST=0.0.0.0 \
    NOORA_API_PORT=8000

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files first for better layer caching
COPY requirements.txt ML_README.md ./

# Install PyTorch first so the later requirements step reuses the same build.
RUN python -m pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir \
    torch==2.4.1

# Copy app files
COPY src ./src
COPY saved_models ./saved_models

# Install remaining dependencies
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["python", "-m", "noora.api"]
