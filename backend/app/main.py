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
    from app.services.job_aggregator import job_aggregator
except ImportError:
    try:
        # Fallback for running as a module
        from services.pdf_parser import extract_text_from_pdf
        from services.ai_matcher import analyze_resume_with_gemini
        from services.job_aggregator import job_aggregator
    except ImportError:
        print("⚠️ Warning: Could not import services. Check your folder structure.")
        def extract_text_from_pdf(bytes_data): return ""
        def analyze_resume_with_gemini(text): return {"error": "AI Module Missing"}
        job_aggregator = None

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

class JobFilterRequest(BaseModel):
    """Model for job filtering request"""
    location: str = "US"
    job_title: Optional[str] = ""
    min_salary: Optional[int] = None
    max_salary: Optional[int] = None
    job_types: Optional[List[str]] = []
    required_skills: Optional[List[str]] = []
    location_keywords: Optional[List[str]] = []
    results_per_page: int = 10
    page: int = 1

class JobMatchRequest(BaseModel):
    """Model for matching jobs to a resume"""
    resume_id: str
    job_title: str = ""
    location: str = "US"
    results_per_page: int = 10
    page: int = 1

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

# --- JOB AGGREGATION ROUTES (MODULE 4) ---

@app.post("/jobs/search")
async def search_jobs(request: JobFilterRequest):
    """
    🔹 MODULE 4: Fetch jobs from Adzuna API
    
    Fetches real-time job listings based on search criteria and filters them
    by user preferences (salary, job type, required skills, location)
    """
    if not job_aggregator:
        raise HTTPException(status_code=503, detail="Job aggregator service not available")
    
    try:
        # Step A: Fetch jobs from Adzuna API
        jobs = job_aggregator.fetch_jobs_from_adzuna(
            location=request.location,
            job_title=request.job_title,
            results_per_page=request.results_per_page,
            page=request.page
        )
        
        if not jobs:
            return {"jobs": [], "total": 0, "message": "No jobs found matching your criteria"}
        
        # Step B: Apply filters
        filters = {
            "min_salary": request.min_salary,
            "max_salary": request.max_salary,
            "job_types": request.job_types,
            "required_skills": request.required_skills,
            "location_keywords": request.location_keywords,
        }
        
        filtered_jobs = job_aggregator.filter_jobs(jobs, filters)
        
        print(f"✅ Found {len(filtered_jobs)} jobs after filtering")
        
        return {
            "jobs": filtered_jobs,
            "total": len(filtered_jobs),
            "message": f"Found {len(filtered_jobs)} relevant jobs"
        }
        
    except Exception as e:
        print(f"❌ Error searching jobs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/jobs/match-resume")
async def match_jobs_to_resume(request: JobMatchRequest):
    """
    🔹 MODULE 4: Match jobs to candidate's resume
    
    Fetches jobs and ranks them based on how well they match the candidate's
    skills, experience level, and preferences. Returns jobs sorted by relevance.
    """
    if not job_aggregator:
        raise HTTPException(status_code=503, detail="Job aggregator service not available")
    
    if db is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    
    try:
        # Step A: Get resume data from Firebase
        doc = db.collection("resumes").document(request.resume_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        resume_data = doc.to_dict()
        ai_analysis = resume_data.get("full_ai_response", {})
        
        resume_skills = ai_analysis.get("skills", [])
        experience_years = ai_analysis.get("experience_years", 0)
        
        print(f"👤 Matching jobs for candidate with {len(resume_skills)} skills and {experience_years} years experience")
        
        # Step B: Fetch jobs from Adzuna
        jobs = job_aggregator.fetch_jobs_from_adzuna(
            location="US",
            job_title=request.job_title,
            results_per_page=request.results_per_page,
            page=request.page
        )
        
        if not jobs:
            return {"jobs": [], "total": 0, "message": "No jobs found"}
        
        # Step C: Score and rank jobs based on resume match
        matched_jobs = job_aggregator.match_jobs_to_resume(
            jobs,
            resume_skills,
            experience_years
        )
        
        print(f"✅ Ranked {len(matched_jobs)} jobs for resume match")
        
        return {
            "candidate_name": ai_analysis.get("candidate_name", "Unknown"),
            "candidate_skills": resume_skills,
            "candidate_experience_years": experience_years,
            "jobs": matched_jobs,
            "total": len(matched_jobs),
            "message": f"Found {len(matched_jobs)} matching job opportunities"
        }
        
    except Exception as e:
        print(f"❌ Error matching jobs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/jobs/locations")
async def get_supported_locations():
    """
    Get list of supported job search locations (Adzuna supported countries)
    """
    locations = {
        "US": "United States",
        "GB": "United Kingdom",
        "AU": "Australia",
        "CA": "Canada",
        "FR": "France",
        "DE": "Germany",
        "NL": "Netherlands",
        "IN": "India",
        "SG": "Singapore",
    }
    return {"locations": locations}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
    