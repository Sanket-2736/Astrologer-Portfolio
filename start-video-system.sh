#!/bin/bash

# Video Consultation System Startup Script
# This script starts both the signaling server and Next.js app

echo "🚀 Starting Video Consultation System..."
echo ""

# Check if signaling-server directory exists
if [ ! -d "signaling-server" ]; then
    echo "❌ Error: signaling-server directory not found"
    exit 1
fi

# Check if node_modules exists in signaling-server
if [ ! -d "signaling-server/node_modules" ]; then
    echo "📦 Installing signaling server dependencies..."
    cd signaling-server
    npm install
    cd ..
fi

# Start signaling server in background
echo "🔌 Starting signaling server on port 4000..."
cd signaling-server
node index.js &
SIGNAL_PID=$!
cd ..

# Wait for signaling server to start
sleep 2

# Check if signaling server is running
if curl -s http://localhost:4000/room-status?bookingId=test > /dev/null; then
    echo "✅ Signaling server is running (PID: $SIGNAL_PID)"
else
    echo "❌ Failed to start signaling server"
    kill $SIGNAL_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🌐 Starting Next.js application..."
echo ""
echo "📝 Note: Press Ctrl+C to stop both servers"
echo ""

# Start Next.js (this will run in foreground)
npm run dev

# Cleanup: Kill signaling server when Next.js stops
echo ""
echo "🛑 Stopping signaling server..."
kill $SIGNAL_PID 2>/dev/null
echo "✅ All servers stopped"
