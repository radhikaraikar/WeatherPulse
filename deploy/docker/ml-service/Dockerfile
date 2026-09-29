# ==============================================================================
# WeatherPulse ml-service (Python 3.11 + Flask + IndicBERT + OpenCV)
# ==============================================================================

FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=5000

# Install runtime dependencies for OpenCV & image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt || \
    pip install --no-cache-dir flask gunicorn requests pillow numpy imagehash

COPY services/ml-service/ /app/
COPY . /app/

EXPOSE 5000

HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["python", "services/ml-service/app.py"]
