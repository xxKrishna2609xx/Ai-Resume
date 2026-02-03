"""
Module 4: Job Data Aggregation
Fetches real-time job listings from multiple sources
Normalizes and filters jobs based on user preferences
"""

import os
import requests
from typing import List, Dict, Any, Optional
from datetime import datetime
import json

class JobAggregator:
    """
    Aggregates job listings from multiple job APIs
    Normalizes formats and applies filters
    """
    
    def __init__(self):
        # Adzuna API credentials (set in .env)
        self.adzuna_app_id = os.getenv("ADZUNA_APP_ID", "")
        self.adzuna_app_key = os.getenv("ADZUNA_APP_KEY", "")
        self.adzuna_base_url = "https://api.adzuna.com/v1/api/jobs"
        
    def fetch_jobs_from_adzuna(
        self, 
        location: str = "US",
        job_title: str = "",
        results_per_page: int = 10,
        page: int = 1
    ) -> List[Dict[str, Any]]:
        """
        Fetch job listings from Adzuna API
        
        Args:
            location: Country/location code (e.g., "US", "GB")
            job_title: Search keyword for job title
            results_per_page: Number of results per page
            page: Page number for pagination
            
        Returns:
            List of normalized job dictionaries
        """
        if not self.adzuna_app_id or not self.adzuna_app_key:
            print("⚠️ Warning: Adzuna API credentials not set. Set ADZUNA_APP_ID and ADZUNA_APP_KEY")
            return []
        
        try:
            # Build Adzuna search URL (country code must be lowercase)
            location_lower = location.lower()
            url = f"{self.adzuna_base_url}/{location_lower}/search/{page}"
            params = {
                "app_id": self.adzuna_app_id,
                "app_key": self.adzuna_app_key,
                "results_per_page": results_per_page,
                "sort_by": "date"
            }
            
            # Add search keywords if provided
            if job_title:
                params["what"] = job_title
            
            print(f"🔍 Fetching jobs from Adzuna for '{job_title or 'all'}' in {location}...")
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            jobs = data.get("results", [])
            
            # Normalize Adzuna jobs to our standard format
            normalized_jobs = [self._normalize_adzuna_job(job) for job in jobs]
            print(f"✅ Fetched {len(normalized_jobs)} jobs from Adzuna")
            
            return normalized_jobs
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Error fetching from Adzuna: {e}")
            return []
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            return []
    
    def _normalize_adzuna_job(self, raw_job: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize Adzuna job format to our standard format
        
        Standard format:
        {
            "id": str,
            "title": str,
            "company": str,
            "location": str,
            "salary_min": int or None,
            "salary_max": int or None,
            "salary_currency": str,
            "description": str,
            "job_type": str,  # "full-time", "part-time", "contract", etc.
            "posted_date": str,
            "source": str,  # "adzuna", "indeed", etc.
            "url": str,
            "requirements": List[str],  # Extracted from description
        }
        """
        return {
            "id": raw_job.get("id", ""),
            "title": raw_job.get("title", ""),
            "company": raw_job.get("company", {}).get("display_name", ""),
            "location": raw_job.get("location", {}).get("display_name", ""),
            "salary_min": raw_job.get("salary_min"),
            "salary_max": raw_job.get("salary_max"),
            "salary_currency": raw_job.get("salary_currency", "USD"),
            "description": raw_job.get("description", ""),
            "job_type": raw_job.get("contract_type", "full-time"),
            "posted_date": raw_job.get("created", datetime.utcnow().isoformat()),
            "source": "adzuna",
            "url": raw_job.get("redirect_url", ""),
            "requirements": self._extract_requirements(raw_job.get("description", "")),
        }
    
    def _extract_requirements(self, description: str) -> List[str]:
        """
        Extract key technical requirements/skills from job description
        Simple keyword matching for common tech skills
        """
        tech_keywords = [
            "python", "javascript", "java", "c++", "c#", "ruby", "go", "rust",
            "react", "angular", "vue", "node", "django", "flask", "spring",
            "aws", "azure", "gcp", "kubernetes", "docker", "jenkins",
            "sql", "mongodb", "postgresql", "mysql", "redis",
            "machine learning", "ai", "deep learning", "nlp",
            "rest api", "graphql", "microservices", "devops",
            "git", "github", "gitlab", "agile", "scrum",
        ]
        
        desc_lower = description.lower()
        found_requirements = []
        
        for keyword in tech_keywords:
            if keyword in desc_lower:
                found_requirements.append(keyword.title())
        
        return list(set(found_requirements))  # Remove duplicates
    
    def filter_jobs(
        self,
        jobs: List[Dict[str, Any]],
        filters: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Filter jobs based on user preferences
        
        Args:
            jobs: List of normalized job dictionaries
            filters: Dictionary with filter criteria
                {
                    "min_salary": int,
                    "max_salary": int,
                    "job_types": List[str],  # ["full-time", "part-time"]
                    "required_skills": List[str],  # ["Python", "React"]
                    "location_keywords": List[str],  # ["New York", "Remote"]
                }
        
        Returns:
            Filtered list of jobs
        """
        filtered = jobs
        
        # Filter by salary range
        if "min_salary" in filters and filters["min_salary"]:
            filtered = [
                j for j in filtered 
                if j.get("salary_max") is None or j["salary_max"] >= filters["min_salary"]
            ]
        
        if "max_salary" in filters and filters["max_salary"]:
            filtered = [
                j for j in filtered 
                if j.get("salary_min") is None or j["salary_min"] <= filters["max_salary"]
            ]
        
        # Filter by job type
        if "job_types" in filters and filters["job_types"]:
            job_types = [t.lower() for t in filters["job_types"]]
            filtered = [
                j for j in filtered 
                if j.get("job_type", "").lower() in job_types
            ]
        
        # Filter by required skills (must have ALL specified skills)
        if "required_skills" in filters and filters["required_skills"]:
            required_skills = [s.lower() for s in filters["required_skills"]]
            filtered = [
                j for j in filtered
                if all(
                    any(skill.lower() in req.lower() for req in j.get("requirements", []))
                    for skill in required_skills
                )
            ]
        
        # Filter by location keywords
        if "location_keywords" in filters and filters["location_keywords"]:
            location_keywords = [l.lower() for l in filters["location_keywords"]]
            filtered = [
                j for j in filtered
                if any(
                    kw in j.get("location", "").lower()
                    for kw in location_keywords
                )
            ]
        
        return filtered
    
    def match_jobs_to_resume(
        self,
        jobs: List[Dict[str, Any]],
        resume_skills: List[str],
        resume_experience_years: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Score jobs based on resume match
        Returns jobs ranked by relevance to the candidate's profile
        
        Args:
            jobs: List of normalized job dictionaries
            resume_skills: List of skills from the resume
            resume_experience_years: Years of experience from resume
            
        Returns:
            Jobs with match scores, sorted by relevance
        """
        scored_jobs = []
        
        for job in jobs:
            score = 0
            
            # 1. Skill matching (40 points max)
            job_requirements = [r.lower() for r in job.get("requirements", [])]
            resume_skills_lower = [s.lower() for s in resume_skills]
            
            matching_skills = [
                skill for skill in resume_skills_lower
                if any(skill in req for req in job_requirements)
            ]
            
            if job_requirements:
                skill_match_ratio = len(matching_skills) / len(job_requirements)
                score += skill_match_ratio * 40
            
            # 2. Experience level match (30 points max)
            # Try to extract required experience from job description
            description = job.get("description", "").lower()
            required_years = 0
            
            # Simple extraction: look for patterns like "3 years" or "3+ years"
            for i in range(0, 20):
                if f"{i}+" in description or f"{i} years" in description or f"{i} year" in description:
                    required_years = i
                    break
            
            if required_years > 0 and resume_experience_years >= required_years:
                score += 30
            elif required_years == 0:
                score += 30  # No specific requirement, full points
            else:
                score += max(0, 30 * (resume_experience_years / required_years))
            
            # 3. Job recency (20 points max)
            posted_date = job.get("posted_date", "")
            if posted_date:
                try:
                    posted = datetime.fromisoformat(posted_date.replace("Z", "+00:00"))
                    days_old = (datetime.utcnow() - posted.replace(tzinfo=None)).days
                    # Recent jobs get more points
                    recency_score = max(0, 20 - (days_old / 10))
                    score += recency_score
                except:
                    score += 20  # Default to full points if date parsing fails
            
            # 4. Salary expectation (10 points max)
            # Assuming mid-career salary expectations
            if job.get("salary_max") and job["salary_max"] > 50000:
                score += 10
            
            job["match_score"] = round(score, 2)
            job["matching_skills"] = matching_skills
            scored_jobs.append(job)
        
        # Sort by match score descending
        scored_jobs.sort(key=lambda x: x["match_score"], reverse=True)
        return scored_jobs


# Initialize the aggregator
job_aggregator = JobAggregator()
