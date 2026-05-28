import type {
  AuthMeResponse,
  CandidateSearchResponse,
  CoverLetterRequest,
  CoverLetterResponse,
  CreateOrUpdateProfileRequest,
  JobMatchRequest,
  JobMatchResponse,
  JobSearchRequest,
  JobSearchResponse,
  OpenToWorkRequest,
  OpenToWorkResponse,
  ResumeDetails,
  UploadResumeResponse,
} from "@shared/api";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function createHeaders(token?: string, hasJsonBody = true): HeadersInit {
  const headers: Record<string, string> = {};

  if (hasJsonBody) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = json?.detail || json?.message || response.statusText || "Request failed";
    throw new ApiError(message, response.status);
  }

  return json as T;
}

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  return parseResponse<T>(response);
}

export async function getCurrentUserProfile(token: string): Promise<AuthMeResponse> {
  return requestJson<AuthMeResponse>("/auth/me", {
    method: "GET",
    headers: createHeaders(token, false),
  });
}

export async function createOrUpdateProfile(
  payload: CreateOrUpdateProfileRequest,
  token: string,
): Promise<{ message: string; profile: AuthMeResponse }> {
  return requestJson<{ message: string; profile: AuthMeResponse }>("/auth/profile", {
    method: "POST",
    headers: createHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateOpenToWork(
  payload: OpenToWorkRequest,
  token: string,
): Promise<OpenToWorkResponse> {
  return requestJson<OpenToWorkResponse>("/auth/open-to-work", {
    method: "PATCH",
    headers: createHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function uploadResume(file: File, token: string): Promise<UploadResumeResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload-resume`, {
    method: "POST",
    headers: createHeaders(token, false),
    body: formData,
  });

  return parseResponse<UploadResumeResponse>(response);
}

export async function getResumeById(resumeId: string, token: string): Promise<ResumeDetails> {
  return requestJson<ResumeDetails>(`/get-resume/${resumeId}`, {
    method: "GET",
    headers: createHeaders(token, false),
  });
}

export async function searchJobs(payload: JobSearchRequest): Promise<JobSearchResponse> {
  return requestJson<JobSearchResponse>("/jobs/search", {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function matchJobsToResume(
  payload: JobMatchRequest,
  token: string,
): Promise<JobMatchResponse> {
  return requestJson<JobMatchResponse>("/jobs/match-resume", {
    method: "POST",
    headers: createHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function searchCandidates(
  params: {
    skills?: string;
    min_experience?: number;
    open_to_work_only?: boolean;
    limit?: number;
    page?: number;
  },
  token: string,
): Promise<CandidateSearchResponse> {
  const query = new URLSearchParams();

  if (params.skills) query.set("skills", params.skills);
  if (typeof params.min_experience === "number") query.set("min_experience", String(params.min_experience));
  if (typeof params.open_to_work_only === "boolean") query.set("open_to_work_only", String(params.open_to_work_only));
  if (typeof params.limit === "number") query.set("limit", String(params.limit));
  if (typeof params.page === "number") query.set("page", String(params.page));

  return requestJson<CandidateSearchResponse>(`/candidates/search?${query.toString()}`, {
    method: "GET",
    headers: createHeaders(token, false),
  });
}

export async function generateCoverLetter(
  payload: CoverLetterRequest,
  token: string,
): Promise<CoverLetterResponse> {
  return requestJson<CoverLetterResponse>("/jobs/cover-letter", {
    method: "POST",
    headers: createHeaders(token),
    body: JSON.stringify(payload),
  });
}
