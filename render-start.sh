#!/bin/bash
# render-start.sh - Start script for Render deployment

# Allow failures for better recovery
set +e

# Environment setup
echo "======== ENVIRONMENT SETUP ========"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

# Parse PORT as integer
MAIN_PORT=${PORT:-8080}
echo "MAIN_PORT: $MAIN_PORT"

# Set the mock backend port to main port + 1
export MOCK_PORT=$((MAIN_PORT + 1))
echo "MOCK_PORT: $MOCK_PORT"

# Enable mock backend
export USE_MOCK_BACKEND=true
echo "USE_MOCK_BACKEND: $USE_MOCK_BACKEND"
echo "=============================="

# Function to kill background processes on script exit
cleanup() {
  echo "Shutting down all processes..."
  # Find and kill all child processes
  pkill -P $$ || true
  exit
}

# Set up trap for script termination
trap cleanup EXIT INT TERM

# Check if mock port is already in use
if nc -z localhost $MOCK_PORT 2>/dev/null; then
  echo "WARNING: Port $MOCK_PORT is already in use. This may cause issues."
else
  echo "Port $MOCK_PORT is available for the mock backend."
fi

# Start the mock backend first
echo "Starting mock backend on port $MOCK_PORT..."
node mock-backend.js &
MOCK_PID=$!
echo "Mock backend started with PID: $MOCK_PID"

# Wait a moment for the mock backend to initialize
echo "Waiting for mock backend to initialize..."
sleep 5

# Check if mock backend is running
if ! kill -0 $MOCK_PID 2>/dev/null; then
  echo "WARNING: Mock backend process not found. It may have exited."
  # But we'll continue anyway
fi

# Start the main server
echo "Starting main server on port $MAIN_PORT..."
exec node server.js 