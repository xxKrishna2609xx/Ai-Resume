import firebase_admin
from firebase_admin import credentials, firestore
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import datetime
import os
from dotenv import load_dotenv

# 1. LOAD ENVIRONMENT VARIABLES (Reads your .env file)
load_dotenv() 

# --- IMPORTS FROM YOUR CUSTOM MODULES ---
# We use try/except to handle running this script from different locations
try:
    from app.services.pdf_parser import extract_text_from_pdf
    from app.services.ai_matcher import analyze_resume_with_gemini
except ImportError:
    try:
        # Fallback for running as a module
        from services.pdf_parser import extract_text_from_pdf
        from services.ai_matcher import analyze_resume_with_gemini
    except ImportError:
        print("⚠️ Warning: Could not import services. Check your folder structure.")
        def extract_text_from_pdf(bytes_data): return ""
        def analyze_resume_with_gemini(text): return {"error": "AI Module Missing"}

# 2. INITIALIZE FASTAPI
app = FastAPI(title="AI Resume Analyzer")

# 3. ENABLE CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. SERVE FRONTEND (Optional)
# This serves your index.html at http://localhost:8000/static/index.html
if os.path.exists("../frontend"):
    app.mount("/static", StaticFiles(directory="../frontend", html=True), name="static")

# 5. INITIALIZE FIREBASE (Defensive Code)
db = None 

try:
    if not firebase_admin._apps:
        # Robust path finding for serviceAccountKey.json
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        service_account_path = os.path.join(backend_dir, "serviceAccountKey.json")
        
        if os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
            print("✅ Firebase initialized successfully.")
        else:
            print(f"❌ Error: 'serviceAccountKey.json' not found at {service_account_path}")

    if firebase_admin._apps:
        db = firestore.client()
    else:
        print("⚠️ Warning: Firebase App not initialized. DB operations will fail.")

except Exception as e:
    print(f"❌ Firebase Connection Error: {e}")
    db = None

# --- PYDANTIC MODELS ---
class ResumeResponse(BaseModel):
    id: str
    filename: str
    extracted_text_preview: str
    ai_analysis: Dict[str, Any] # Holds the full JSON from Gemini
    message: str

# --- ROUTES ---

@app.get("/")
def health_check():
    return {"status": "running", "message": "AI Resume Matcher API is Online"}

@app.post("/upload-resume", response_model=ResumeResponse)
async def upload_resume(file: UploadFile = File(...)):
    """
    Receives PDF -> Extracts Text -> Sends to Gemini -> Saves JSON to Firebase
    """
    # Safety Check: Database
    if db is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    # Safety Check: File Type
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDFs allowed.")

    try:
        # Step A: Read File
        file_content = await file.read()
        
        # Step B: Extract Text (using pdf_parser.py)
        extracted_text = extract_text_from_pdf(file_content)
        if not extracted_text:
            raise HTTPException(status_code=400, detail="Failed to extract text from PDF.")

        # Step C: CALL GEMINI API 🧠 (using ai_matcher.py)
        # Note: The API Key is loaded automatically inside ai_matcher.py or via load_dotenv() here
        print(f"🤖 Sending {len(extracted_text)} chars to Gemini...")
        ai_result = analyze_resume_with_gemini(extracted_text)
        
        # Step D: Prepare Data for Firebase
        # We merge the AI result directly into our database object
        resume_data = {
            "filename": file.filename,
            "upload_timestamp": datetime.datetime.utcnow(),
            "status": "analyzed",
            "parsed_text": extracted_text, 
            # Extract key fields for easier querying in Firebase later
            "candidate_name": ai_result.get("candidate_name", "Unknown"),
            "skills": ai_result.get("skills", []),
            "experience_years": ai_result.get("experience_years", 0),
            "resume_quality_score": ai_result.get("resume_quality_score", 0),
            # Store the full raw response too
            "full_ai_response": ai_result 
        }

        # Step E: Save to Firestore
        update_time, doc_ref = db.collection("resumes").add(resume_data)
        print(f"✅ Saved Analysis to ID: {doc_ref.id}")

        # Step F: Return Response to Frontend
        return {
            "id": doc_ref.id,
            "filename": file.filename,
            "extracted_text_preview": extracted_text[:100] + "...",
            "ai_analysis": ai_result,
            "message": "Resume analyzed successfully!"
        }

    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get-resume/{resume_id}")
def get_resume(resume_id: str):
    try:
        if db is None:
             raise HTTPException(status_code=503, detail="Database error")
             
        doc = db.collection("resumes").document(resume_id).get()
        if doc.exists:
            return {"id": doc.id, **doc.to_dict()}
        else:
            raise HTTPException(status_code=404, detail="Resume not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
    