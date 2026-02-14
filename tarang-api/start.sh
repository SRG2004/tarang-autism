#!/bin/bash
set -e

echo "🚀 Starting TARANG API Server (Production Mode)"

# AWS App Runner uses port 8080 by default
PORT="${PORT:-8080}"
HOST="${HOST:-0.0.0.0}"

# Celery worker configuration
CELERY_CONCURRENCY="${CELERY_CONCURRENCY:-2}"
CELERY_LOGLEVEL="${CELERY_LOGLEVEL:-warning}"

# Gunicorn configuration
WORKERS="${WORKERS:-4}"
WORKER_CLASS="${WORKER_CLASS:-uvicorn.workers.UvicornWorker}"
TIMEOUT="${TIMEOUT:-120}"
KEEPALIVE="${KEEPALIVE:-5}"

echo "📊 Configuration:"
echo "  - Host: $HOST"
echo "  - Port: $PORT"
echo "  - Gunicorn Workers: $WORKERS"
echo "  - Worker Class: $WORKER_CLASS"
echo "  - Timeout: ${TIMEOUT}s"
echo "  - Celery Concurrency: $CELERY_CONCURRENCY"

# Start Celery worker in the background (if Redis is available)
if [ -n "$REDIS_URL" ]; then
    echo "🔄 Starting Celery worker..."
    celery -A app.worker worker \
        --loglevel=$CELERY_LOGLEVEL \
        --concurrency=$CELERY_CONCURRENCY \
        --max-tasks-per-child=1000 \
        --time-limit=300 \
        &
    CELERY_PID=$!
    echo "✅ Celery worker started (PID: $CELERY_PID)"
else
    echo "⚠️  REDIS_URL not set. Celery worker disabled."
fi

# Graceful shutdown handler
shutdown() {
    echo "🛑 Shutting down gracefully..."
    if [ -n "$CELERY_PID" ]; then
        echo "   Stopping Celery worker..."
        kill -TERM "$CELERY_PID" 2>/dev/null || true
        wait "$CELERY_PID" 2>/dev/null || true
    fi
    echo "   Stopping Gunicorn..."
    kill -TERM "$GUNICORN_PID" 2>/dev/null || true
    wait "$GUNICORN_PID" 2>/dev/null || true
    echo "✅ Shutdown complete"
    exit 0
}

trap shutdown SIGTERM SIGINT

# Start Gunicorn with Uvicorn workers (production-grade)
echo "🌐 Starting Gunicorn with Uvicorn workers..."
gunicorn app.main:app \
    --bind $HOST:$PORT \
    --workers $WORKERS \
    --worker-class $WORKER_CLASS \
    --timeout $TIMEOUT \
    --keepalive $KEEPALIVE \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --forwarded-allow-ips='*' \
    --proxy-protocol \
    &

GUNICORN_PID=$!
echo "✅ Gunicorn started (PID: $GUNICORN_PID)"

# Wait for Gunicorn to exit
wait "$GUNICORN_PID"
