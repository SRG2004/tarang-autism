#!/bin/bash

# Start Celery worker in the background
# -c 1 limits concurrency to save memory on free tier
celery -A app.worker worker --loglevel=info --concurrency=1 &

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000
