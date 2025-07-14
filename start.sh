#!/bin/bash

# Website Downloader Startup Script

echo "🚀 Starting Website Downloader..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

echo "📦 Installing Node.js dependencies..."
npm install

echo "🔧 Starting Flask backend..."
python3 app.py &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 3

echo "🎨 Starting React frontend..."
npm start &
FRONTEND_PID=$!

echo "✅ Website Downloader is starting up!"
echo "📱 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend API is available at: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handler
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait 