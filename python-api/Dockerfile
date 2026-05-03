# BUILD
FROM python:3.13-slim AS deps

WORKDIR /app
 
# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files and sync into a local .venv
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# RUNTIME
FROM python:3.13-slim AS runtime

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy the venv from the deps stage
COPY --from=deps /app/.venv /app/.venv

# Copy application source
COPY --exclude=.venv --exclude=.env . .

# Non-root user for security
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# Use the venv's Python/binaries directly
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

CMD ["fastapi", "run", "main.py", "--port", "8000"]
