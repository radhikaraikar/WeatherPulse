# ==============================================================================
# WeatherPulse ingestion-service (Python 3.11 Ingestion Worker)
# ==============================================================================

FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt || \
    pip install --no-cache-dir requests schedule python-dotenv

COPY . .

CMD ["python", "govDataIngestion.py"]
