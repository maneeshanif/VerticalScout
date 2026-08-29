FROM python:3.12-slim

WORKDIR /app

# Install system dependencies and uv
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir uv

# Copy project dependency definition
COPY pyproject.toml ./

# Install python dependencies with uv
RUN uv sync --no-dev

# Copy application files
COPY app/ ./app/
COPY docs/ ./docs/
COPY alembic/ ./alembic/
COPY alembic.ini ./

EXPOSE 8000

# Run uvicorn server
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
