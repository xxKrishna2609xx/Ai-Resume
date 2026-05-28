export type UserRole = "job_seeker" | "company";

export interface UserProfile {
  uid: string;
  email?: string;
  role?: UserRole;
  displayName?: string;
  photoURL?: string;
  currentTitle?: string;
  experienceYears?: number;
  skills?: string[];
  openToWork?: boolean;
  companyName?: string;
  industry?: string;
  companySize?: string;
  resumeId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthMeResponse extends UserProfile {
  needsProfileSetup?: boolean;
}

export interface CreateOrUpdateProfileRequest {
  role: UserRole;
  displayName?: string;
  photoURL?: string;
  currentTitle?: string;
  experienceYears?: number;
  skills?: string[];
  openToWork?: boolean;
  companyName?: string;
  industry?: string;
  companySize?: string;
}

export interface OpenToWorkRequest {
  openToWork: boolean;
}

export interface OpenToWorkResponse {
  message: string;
  openToWork: boolean;
}

export interface ResumeAiAnalysis {
  candidate_name?: string;
  skills?: string[];
  experience_years?: number;
  resume_quality_score?: number;
  summary?: string;
  [key: string]: unknown;
}

export interface UploadResumeResponse {
  id: string;
  filename: string;
  extracted_text_preview: string;
  ai_analysis: ResumeAiAnalysis;
  message: string;
}

export interface ResumeDetails {
  id: string;
  user_id?: string;
  filename?: string;
  full_ai_response?: ResumeAiAnalysis;
  [key: string]: unknown;
}

export interface JobItem {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
  description?: string;
  job_type?: string;
  posted_date?: string;
  source?: string;
  url?: string;
  requirements?: string[];
  match_score?: number;
  matching_skills?: string[];
}

export interface JobSearchRequest {
  location?: string;
  job_title?: string;
  min_salary?: number | null;
  max_salary?: number | null;
  job_types?: string[];
  required_skills?: string[];
  location_keywords?: string[];
  results_per_page?: number;
  page?: number;
}

export interface JobSearchResponse {
  jobs: JobItem[];
  total: number;
  message: string;
}

export interface JobMatchRequest {
  resume_id: string;
  job_title?: string;
  location?: string;
  results_per_page?: number;
  page?: number;
}

export interface JobMatchResponse {
  candidate_name?: string;
  candidate_skills?: string[];
  candidate_experience_years?: number;
  jobs: JobItem[];
  total: number;
  message: string;
}

export interface CandidateItem {
  uid: string;
  role?: UserRole;
  displayName?: string;
  currentTitle?: string;
  experienceYears?: number;
  skills?: string[];
  openToWork?: boolean;
  resumeId?: string;
}

export interface CandidateSearchResponse {
  candidates: CandidateItem[];
  total: number;
  message: string;
}

export interface CoverLetterRequest {
  resume_id: string;
  job_title: string;
  company_name: string;
  job_description: string;
}

export interface CoverLetterResponse {
  cover_letter: string;
  job_title: string;
  company_name: string;
  message: string;
}

export interface DemoResponse {
  message: string;
}
