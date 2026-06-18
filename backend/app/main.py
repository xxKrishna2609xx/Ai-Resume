import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# 1. LOAD ENVIRONMENT VARIABLES
load_dotenv()

# 2. INITIALIZE FASTAPI
app = FastAPI(title="AI Resume Analyzer")

# 3. ENABLE CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",  # Vite dev server on port 8080
        "http://127.0.0.1:8080",
        "http://localhost:5173",  # Vite default dev server
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. SERVE FRONTEND (Optional)
if os.path.exists("../frontend"):
    app.mount("/static", StaticFiles(directory="../frontend", html=True), name="static")

# 5. INITIALIZE FIREBASE (Runs the initialization code inside firebase_config)
from app.core.firebase_config import db

# 6. REGISTER ROUTES
from app.api.routes import router as api_router
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)