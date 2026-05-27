import firebase_admin
from firebase_admin import credentials, firestore
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
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
    from app.core.auth import verify_firebase_token, get_current_user_optional, AuthUser
except ImportError:
    try:
        # Fallback for running as a module
        from services.pdf_parser import extract_text_from_pdf
        from services.ai_matcher import analyze_resume_with_gemini
        from services.job_aggregator import job_aggregator
        from core.auth import verify_firebase_token, get_current_user_optional, AuthUser
    except ImportError:
        print("[Warning] Could not import services. Check your folder structure.")
        def extract_text_from_pdf(bytes_data): return ""
        def analyze_resume_with_gemini(text): return {"error": "AI Module Missing"}
        job_aggregator = None
        verify_firebase_token = None
        get_current_user_optional = None
        AuthUser = None

# 2. INITIALIZE FASTAPI
app = FastAPI(title="AI Resume Analyzer")



# 3. ENABLE CORS
# Fix #9: allow_origins=["*"] is incompatible with allow_credentials=True in browsers.
# Use explicit origins instead.
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
            print("[Firebase] Firebase initialized successfully.")
        else:
            print(f"[Firebase Error] Error: 'serviceAccountKey.json' not found at {service_account_path}")

    if firebase_admin._apps:
        db = firestore.client()
    else:
        print("[Firebase Warning] Firebase App not initialized. DB operations will fail.")

except Exception as e:
    print(f"[Firebase Error] Firebase Connection Error: {e}")
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

class UserProfile(BaseModel):
    """Model for user profile data"""
    role: str  # 'job_seeker' or 'company'
    displayName: Optional[str] = None
    photoURL: Optional[str] = None
    # Job seeker fields
    currentTitle: Optional[str] = None
    experienceYears: Optional[int] = None
    skills: Optional[List[str]] = []
    openToWork: Optional[bool] = True
    # Company fields
    companyName: Optional[str] = None
    industry: Optional[str] = None
    companySize: Optional[str] = None

class UpdateOpenToWorkRequest(BaseModel):
    """Model for updating open to work status"""
    openToWork: bool
    # Fix #8: Removed spurious 'page' field (was copy-pasted from JobFilterRequest)

# --- ROUTES ---

@app.get("/")
def health_check():
    return {"status": "running", "message": "AI Resume Matcher API is Online"}

# --- AUTHENTICATION & USER ROUTES ---

@app.get("/auth/me")
async def get_current_user_profile(user: AuthUser = Depends(verify_firebase_token)):
    """Get current authenticated user's profile from Firestore"""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not initialized")
        
        user_doc = db.collection("users").document(user.uid).get()
        
        if user_doc.exists:
            return {"uid": user.uid, **user_doc.to_dict()}
        else:
            # User authenticated but no profile exists yet
            return {
                "uid": user.uid,
                "email": user.email,
                "needsProfileSetup": True
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/auth/profile")
async def create_or_update_profile(
    profile: UserProfile,
    user: AuthUser = Depends(verify_firebase_token)
):
    """Create or update user profile"""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not initialized")
        
        profile_data = profile.dict(exclude_none=True)
        profile_data['uid'] = user.uid
        profile_data['email'] = user.email
        profile_data['updatedAt'] = datetime.datetime.utcnow()
        
        # Check if profile exists
        user_ref = db.collection("users").document(user.uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            profile_data['createdAt'] = datetime.datetime.utcnow()
            user_ref.set(profile_data)
            return {"message": "Profile created successfully", "profile": profile_data}
        else:
            user_ref.update(profile_data)
            return {"message": "Profile updated successfully", "profile": profile_data}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/auth/open-to-work")
async def update_open_to_work(
    request: UpdateOpenToWorkRequest,
    user: AuthUser = Depends(verify_firebase_token)
):
    """Update job seeker's 'open to work' status"""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not initialized")
        
        user_ref = db.collection("users").document(user.uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        user_data = user_doc.to_dict()
        if user_data.get('role') != 'job_seeker':
            raise HTTPException(status_code=403, detail="Only job seekers can set open to work status")
        
        user_ref.update({
            'openToWork': request.openToWork,
            'updatedAt': datetime.datetime.utcnow()
        })
        
        return {
            "message": "Open to work status updated",
            "openToWork": request.openToWork
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/candidates/search")
async def search_candidates(
    skills: Optional[str] = None,
    min_experience: Optional[int] = None,
    open_to_work_only: bool = True,
    limit: int = 20,
    page: int = 1,
    user: AuthUser = Depends(verify_firebase_token)
):
    """
    Search for job seekers (for companies)
    Requires authentication and company role.
    Supports page-based pagination via the `page` query parameter (1-indexed).
    """
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database not initialized")
        
        # Verify user is a company
        user_doc = db.collection("users").document(user.uid).get()
        if not user_doc.exists or user_doc.to_dict().get('role') != 'company':
            raise HTTPException(status_code=403, detail="Only companies can search candidates")
        
        # Clamp page to a minimum of 1
        safe_page = max(1, page)
        offset = (safe_page - 1) * limit

        # Build query
        query = db.collection("users").where('role', '==', 'job_seeker')
        
        if open_to_work_only:
            query = query.where('openToWork', '==', True)
        
        all_candidates = []
        for doc in query.stream():
            candidate_data = doc.to_dict()
            
            # Filter by skills if specified (post-query, Firestore array-contains supports only 1 value)
            if skills:
                skill_list = [s.strip().lower() for s in skills.split(',')]
                candidate_skills = [s.lower() for s in candidate_data.get('skills', [])]
                if not any(skill in candidate_skills for skill in skill_list):
                    continue
            
            # Filter by minimum experience
            if min_experience is not None:
                if candidate_data.get('experienceYears', 0) < min_experience:
                    continue
            
            # Remove sensitive data
            candidate_data.pop('email', None)
            all_candidates.append({
                'uid': doc.id,
                **candidate_data
            })
        
        # Sort all filtered candidates in memory by updatedAt descending
        def get_updated_at(c):
            val = c.get('updatedAt')
            if val is not None:
                if hasattr(val, 'tzinfo') and val.tzinfo is not None:
                    return val
                return val.replace(tzinfo=datetime.timezone.utc)
            return datetime.datetime.min.replace(tzinfo=datetime.timezone.utc)
            
        all_candidates.sort(key=get_updated_at, reverse=True)
        
        # Apply pagination slicing in memory
        total_matched = len(all_candidates)
        paginated_candidates = all_candidates[offset : offset + limit]
        
        return {
            "candidates": paginated_candidates,
            "total": total_matched,
            "page": safe_page,
            "message": f"Found {total_matched} candidates (showing page {safe_page})"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-resume", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    user: AuthUser = Depends(verify_firebase_token)
):
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
        print(f"[AI] Sending {len(extracted_text)} chars to Gemini...")
        ai_result = analyze_resume_with_gemini(extracted_text)
        
        # Step D: Prepare Data for Firebase
        # We merge the AI result directly into our database object
        resume_data = {
            "user_id": user.uid,  # Link resume to user
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
        print(f"[AI] Saved Analysis to ID: {doc_ref.id}")
        
        # Step G: Update user profile with resume ID (use set with merge=True in case user profile doesn't exist yet)
        db.collection("users").document(user.uid).set({
            'resumeId': doc_ref.id,
            'updatedAt': datetime.datetime.utcnow()
        }, merge=True)

        # Step H: Return Response to Frontend
        return {
            "id": doc_ref.id,
            "filename": file.filename,
            "extracted_text_preview": extracted_text[:100] + "...",
            "ai_analysis": ai_result,
            "message": "Resume analyzed successfully!"
        }

    except Exception as e:
        print(f"[Error] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Fix #10: Added authentication so only authenticated users can fetch resumes
@app.get("/get-resume/{resume_id}")
async def get_resume(resume_id: str, user: AuthUser = Depends(verify_firebase_token)):
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database error")

        doc = db.collection("resumes").document(resume_id).get()
        if doc.exists:
            resume_data = doc.to_dict()
            # Only allow user to access their own resume
            if resume_data.get("user_id") != user.uid:
                raise HTTPException(status_code=403, detail="Access denied")
            return {"id": doc.id, **resume_data}
        else:
            raise HTTPException(status_code=404, detail="Resume not found")
    except HTTPException:
        raise
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
        
        print(f"[Jobs] Found {len(filtered_jobs)} jobs after filtering")
        
        return {
            "jobs": filtered_jobs,
            "total": len(filtered_jobs),
            "message": f"Found {len(filtered_jobs)} relevant jobs"
        }
        
    except Exception as e:
        print(f"[Jobs Error] Error searching jobs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/jobs/match-resume")
async def match_jobs_to_resume(
    request: JobMatchRequest,
    user: AuthUser = Depends(verify_firebase_token)
):
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
        
        print(f"[Match] Matching jobs for candidate with {len(resume_skills)} skills and {experience_years} years experience")
        
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
        
        print(f"[Match] Ranked {len(matched_jobs)} jobs for resume match")
        
        return {
            "candidate_name": ai_analysis.get("candidate_name", "Unknown"),
            "candidate_skills": resume_skills,
            "candidate_experience_years": experience_years,
            "jobs": matched_jobs,
            "total": len(matched_jobs),
            "message": f"Found {len(matched_jobs)} matching job opportunities"
        }
        
    except Exception as e:
        print(f"[Match Error] Error matching jobs: {e}")
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
    