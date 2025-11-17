#!/bin/bash

# NoteHive Backend Server Manager
# This script helps manage the backend server

PORT=3000
SERVER_DIR="$(cd "$(dirname "$0")" && pwd)"

# Function to check if port is in use
check_port() {
    if lsof -ti :$PORT > /dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    echo "🛑 Stopping server on port $PORT..."
    lsof -ti :$PORT | xargs kill -9 2>/dev/null
    sleep 1
    if ! check_port; then
        echo "✅ Port $PORT is now free"
        return 0
    else
        echo "❌ Failed to free port $PORT"
        return 1
    fi
}

# Function to start server
start_server() {
    if check_port; then
        echo "⚠️  Port $PORT is already in use"
        read -p "Kill existing process and start new server? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kill_port
        else
            echo "❌ Server not started"
            exit 1
        fi
    fi
    
    echo "🚀 Starting NoteHive backend server..."
    cd "$SERVER_DIR"
    npm start
}

# Function to stop server
stop_server() {
    if check_port; then
        kill_port
        echo "✅ Server stopped"
    else
        echo "ℹ️  No server running on port $PORT"
    fi
}

# Function to restart server
restart_server() {
    echo "🔄 Restarting server..."
    stop_server
    sleep 1
    start_server
}

# Function to check server status
status_server() {
    if check_port; then
        echo "✅ Server is running on port $PORT"
        if curl -s http://localhost:$PORT/health > /dev/null 2>&1; then
            echo "✅ Server is responding to requests"
            curl -s http://localhost:$PORT/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:$PORT/health
        else
            echo "⚠️  Server is running but not responding"
        fi
    else
        echo "❌ Server is not running"
    fi
}

# Main script logic
case "$1" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    status)
        status_server
        ;;
    *)
        echo "NoteHive Backend Server Manager"
        echo ""
        echo "Usage: $0 {start|stop|restart|status}"
        echo ""
        echo "Commands:"
        echo "  start    - Start the backend server"
        echo "  stop     - Stop the backend server"
        echo "  restart  - Restart the backend server"
        echo "  status   - Check server status"
        echo ""
        exit 1
        ;;
esac

