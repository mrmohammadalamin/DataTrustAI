# =============================================================================
# DataTrust AI — Production Multi-Stage Dockerfile for Google Cloud Run / GKE
# Builds TypeScript Google Cloud Console UI + FastAPI Backend in One Container
# =============================================================================

# Stage 1: Build TypeScript Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Python FastAPI Runtime
FROM python:3.13-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

WORKDIR /app

# Create non-root enterprise user
RUN groupadd -r datatrust && useradd -r -g datatrust datatrust

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt \
    google-cloud-bigquery \
    google-cloud-spanner \
    google-cloud-storage

COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

RUN chown -R datatrust:datatrust /app
USER datatrust

EXPOSE 8080

CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
