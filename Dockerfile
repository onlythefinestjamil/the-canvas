# The Canvas — Backend Dockerfile
# For deploying the FastAPI backend to cloud (RunPod, Railway, etc.)
FROM python:3.11-slim

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir fastapi uvicorn websockets

# App code
COPY . .

# Expose API port
EXPOSE 8787

# Run
CMD ["python", "web_ui.py"]
