#!/bin/bash

echo "Finding and killing process on port 5000..."

PID=$(lsof -ti:5000)

if [ -z "$PID" ]; then
    echo "No process found on port 5000"
else
    echo "Killing process $PID..."
    kill -9 $PID
    echo "✅ Process killed. Port 5000 is now free."
    echo ""
    echo "You can now run: npm run server"
fi
