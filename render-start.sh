#!/bin/bash

# Start the mock backend in the background
echo "Starting mock backend..."
node mock-backend.js &
MOCK_PID=$!

# Wait a moment for the mock backend to start
sleep 2

# Start the frontend server
echo "Starting frontend server..."
node server.js

# If the frontend server exits, kill the mock backend
kill $MOCK_PID 