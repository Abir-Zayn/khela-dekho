# --- Build Stage ---
FROM python:3.14-slim AS builder

WORKDIR /build

# Install build dependencies if needed (e.g., git, gcc)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install uv for extremely fast dependency installation
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies into a virtual environment
RUN uv venv /opt/venv && \
    . /opt/venv/bin/activate && \
    uv pip install --no-cache -r pyproject.toml

# --- Final Production Stage ---
FROM python:3.14-slim

WORKDIR /app

# Create a non-privileged user for security (never run as root in production)
RUN groupadd -g 999 appuser && \
    useradd -r -u 999 -g appuser appuser

# Copy virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy project files
COPY app ./app

# Set ownership to the non-root user
RUN chown -R appuser:appuser /app
USER appuser

# Expose port and run using Uvicorn
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
