#!/usr/bin/env python3
"""
AI Resume Analyzer Launcher
Starts both backend and opens frontend in one command
"""

import subprocess
import time
import webbrowser
import os
import signal
import sys

def main():
    print("🚀 Starting AI Resume Analyzer...")
    print()

    # Change to backend directory
    backend_dir = r"D:\Projects\AI Resume\backend"
    os.chdir(backend_dir)

    # Start backend server
    print("📡 Starting backend server...")
    backend_process = subprocess.Popen([
        sys.executable, "-m", "app.main"
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # Wait for server to start
    print("⏳ Waiting for server to start...")
    time.sleep(3)

    # Open frontend in browser
    frontend_url = "http://localhost:8000/static/index.html"
    print(f"🌐 Opening frontend: {frontend_url}")
    webbrowser.open(frontend_url)

    print()
    print("✅ Backend server: http://localhost:8000")
    print("✅ Frontend: Opened in browser")
    print()
    print("Press Ctrl+C to stop...")

    try:
        # Keep running until interrupted
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping server...")
        backend_process.terminate()
        backend_process.wait()
        print("✅ Server stopped. Goodbye!")

if __name__ == "__main__":
    main()