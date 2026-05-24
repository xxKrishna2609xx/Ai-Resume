#!/usr/bin/env python3
"""
AI Resume Analyzer Launcher
Starts both backend and frontend dev servers in one command.
"""

import subprocess
import time
import webbrowser
import os
import sys

def main():
    print("🚀 Starting AI Resume Analyzer...")
    print()

    # Fix #1: Corrected path — the folder is 'Backend' (capital B), not 'backend'
    base_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(base_dir, "Backend")

    if not os.path.isdir(backend_dir):
        print(f"❌ Error: Backend directory not found at: {backend_dir}")
        sys.exit(1)

    # Fix #2: Use uvicorn to launch FastAPI correctly instead of running app.main as a module
    print("📡 Starting backend server (FastAPI + Uvicorn)...")
    backend_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
        cwd=backend_dir,
    )

    # Give the backend a moment to start
    print("⏳ Waiting for backend to start...")
    time.sleep(3)

    # Fix #3: Frontend now runs on Vite dev server (port 5173), NOT served from FastAPI
    frontend_dir = os.path.join(base_dir, "Frontend")
    frontend_process = None

    if os.path.isdir(frontend_dir):
        print("🌐 Starting frontend dev server (Vite)...")
        frontend_process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=frontend_dir,
            shell=True,
        )
        time.sleep(4)
        frontend_url = "http://localhost:5173"
        print(f"🌐 Opening frontend: {frontend_url}")
        webbrowser.open(frontend_url)
    else:
        print(f"⚠️ Frontend directory not found at: {frontend_dir}")

    print()
    print("✅ Backend server:  http://localhost:8000")
    print("✅ Frontend (Vite): http://localhost:5173")
    print()
    print("Press Ctrl+C to stop all servers...")

    try:
        # Keep running until interrupted
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
        backend_process.terminate()
        backend_process.wait()
        if frontend_process:
            frontend_process.terminate()
            frontend_process.wait()
        print("✅ All servers stopped. Goodbye!")

if __name__ == "__main__":
    main()