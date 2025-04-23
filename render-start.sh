#!/bin/bash
# render-start.sh - Start script for Render deployment

# Immediately exit if a command fails
set -e

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

# Start the mock backend first
echo "Starting mock backend on port $MOCK_PORT..."
node mock-backend.js &
MOCK_PID=$!
echo "Mock backend started with PID: $MOCK_PID"

# Wait a moment for the mock backend to initialize
sleep 3

# Check if mock backend is running
if ! kill -0 $MOCK_PID 2>/dev/null; then
  echo "ERROR: Mock backend failed to start!"
  exit 1
fi

# Check if mock backend is responsive
echo "Testing mock backend health..."
HEALTH_RESPONSE=$(curl -s "http://localhost:$MOCK_PORT/health" || echo "Connection failed")
if [[ $HEALTH_RESPONSE == *"ok"* ]]; then
  echo "Mock backend is healthy: $HEALTH_RESPONSE"
else
  echo "WARNING: Mock backend health check failed: $HEALTH_RESPONSE"
  echo "Will attempt to continue anyway..."
fi

# Start the main server
echo "Starting main server on port $MAIN_PORT..."
node server.js &
MAIN_PID=$!
echo "Main server started with PID: $MAIN_PID"

# Wait a moment for the main server to initialize
sleep 3

# Check if main server is running
if ! kill -0 $MAIN_PID 2>/dev/null; then
  echo "ERROR: Main server failed to start!"
  # Attempt to show logs
  echo "Last server logs:"
  cat /var/log/render/app.log 2>/dev/null || echo "No logs available"
  exit 1
fi

# Monitor both processes
echo "All services started. Monitoring for failures..."
echo "Press Ctrl+C to stop all services"

# Wait for either process to exit
wait -n

# If we get here, one of the processes exited
echo "A process has exited. Shutting down all services..."
exit 1 