#!/bin/bash
# ==============================================================================
# ResearchForge — 1-Click Launch Script
# Starts Ollama, FastAPI Backend, and Next.js Frontend together.
# ==============================================================================

set -e

# Project root directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "============================================================"
echo "          ResearchForge — Local Research Assistant          "
echo "============================================================"
echo ""

# 1. Check Ollama
echo "[1/4] Checking Local AI (Ollama)..."
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "  -> Ollama is not running. Starting Ollama in background..."
    if command -v ollama > /dev/null 2>&1; then
        ollama serve > /dev/null 2>&1 &
        sleep 2
    else
        echo "  [WARNING] Ollama command not found in PATH."
        echo "  Please make sure Ollama is installed from https://ollama.com and running."
    fi
else
    echo "  -> Ollama is running and ready."
fi

# 2. Check Python Environment
echo "[2/4] Checking Backend Environment..."
if [ ! -d ".venv" ]; then
    echo "  -> Creating Python virtual environment (.venv)..."
    python3 -m venv .venv
    echo "  -> Installing Python dependencies..."
    .venv/bin/pip install --upgrade pip
    .venv/bin/pip install -r backend/requirements.txt
fi

# 3. Check Frontend Dependencies
echo "[3/4] Checking Frontend Dependencies..."
if [ ! -d "frontend/node_modules" ]; then
    echo "  -> Installing frontend packages (this only runs once)..."
    cd frontend && npm install && cd ..
fi

# 4. Clean up any previous stale instances on port 8000 or 3000
echo "[4/4] Starting Services..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Trap Ctrl+C (SIGINT) and SIGTERM to kill all background jobs cleanly
cleanup() {
    echo ""
    echo "Shutting down ResearchForge services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "All services stopped. Goodbye!"
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Start Backend in background
echo "  -> Starting FastAPI Backend on http://localhost:8000..."
PYTHONPATH=. .venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000 > /tmp/researchforge_backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend healthcheck (up to 10 seconds)
for i in {1..10}; do
    if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
        echo "  -> Backend is online!"
        break
    fi
    sleep 1
done

# Start Frontend in background
echo "  -> Starting Next.js Frontend on http://localhost:3000..."
cd frontend
npm run dev > /tmp/researchforge_frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend
sleep 3

echo ""
echo "============================================================"
echo "  ResearchForge is live and ready!"
echo ""
echo "  Web Interface:   http://localhost:3000"
echo "  Backend API:     http://localhost:8000"
echo "  API Docs:        http://localhost:8000/docs"
echo "============================================================"
echo ""
echo "Press Ctrl+C at any time to stop the application."
echo ""

# Automatically open browser if supported
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:3000" || true
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "http://localhost:3000" 2>/dev/null || true
fi

# Keep script running to monitor processes and catch Ctrl+C
wait $FRONTEND_PID

