#!/bin/bash

# Start script for Curriculum Manager
echo "Starting Curriculum Manager Backend..."

# Change to the curriculamgmt directory
cd "$(dirname "$0")"

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "Using Python 3..."
    python3 backend.py
elif command -v python &> /dev/null; then
    echo "Using Python..."
    python backend.py
else
    echo "Error: Python is not installed or not in PATH"
    echo "Please install Python 3 to run the backend server"
    exit 1
fi
