#!/bin/bash

# Development script to safely restart the NestJS server
# This script kills any process on port 3001 and starts the dev server

echo "🔍 Checking for processes on port 3001..."

# Find and kill any process using port 3001
PORT_PROCESS=$(lsof -ti:3001)

if [ ! -z "$PORT_PROCESS" ]; then
    echo "🚫 Found process $PORT_PROCESS using port 3001, killing it..."
    kill -9 $PORT_PROCESS
    sleep 1
    echo "✅ Process killed successfully"
else
    echo "✅ Port 3001 is free"
fi

# Double-check the port is now free
PORT_CHECK=$(lsof -ti:3001)
if [ ! -z "$PORT_CHECK" ]; then
    echo "❌ Port 3001 still occupied, force killing all Node processes..."
    pkill -f "nest start"
    pkill -f "node.*3001"
    sleep 2
fi

echo "🚀 Starting NestJS development server..."
npm run start:dev
