import { TopNav } from "@/components/TopNav";
import { MobileActionBar } from "@/components/MobileActionBar";
import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { JobItem } from "@shared/api";
import { matchJobsToResume, searchJobs } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function Jobs() {
  const { profile, getIdToken } = useAuth();
  const [location, setLocation] = useState("US");
  const [jobTitle, setJobTitle] = useState(profile?.currentTitle ?? "");
  const [jobType, setJobType] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusLabel, setStatusLabel] = useState("Search jobs or match against your resume");

  const searchMutation = useMutation({
    mutationFn: () =>
      searchJobs({
        location,
        job_title: jobTitle,
        min_salary: minSalary ? Number(minSalary) : null,
        job_types: jobType ? [jobType] : [],
        results_per_page: 20,
        page: 1,
      }),
    onSuccess: (response) => {
      setJobs(response.jobs);
      setStatusLabel(`Found ${response.total} jobs from the search API`);
    },
  });

  const matchMutation = useMutation({
    mutationFn: async () => {
      const resumeId = profile?.resumeId;
      if (!resumeId) throw new Error("Upload a resume first in the Analyzer page.");
      const token = await getIdToken();
      if (!token) throw new Error("Authentication token missing. Please sign in again.");

      return matchJobsToResume(
        {
          resume_id: resumeId,
          location,
          job_title: jobTitle,
          results_per_page: 20,
          page: 1,
        },
        token,
      );
    },
    onSuccess: (response) => {
      setJobs(response.jobs);
      setStatusLabel(`Found ${response.total} jobs ranked by resume match`);
    },
  });

  const isWorking = searchMutation.isPending || matchMutation.isPending;

  const handleSearch = async () => {
    setError(null);
    try {
      await searchMutation.mutateAsync();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    }
  };

  const handleMatch = async () => {
    setError(null);
    try {
      await matchMutation.mutateAsync();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Matching failed");
    }
  };

  const formatSalary = (job: JobItem) => {
    if (job.salary_min && job.salary_max) {
      return `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max / 1000)}k`;
    }
    if (job.salary_max) return `Up to $${Math.round(job.salary_max / 1000)}k`;
    return "Salary not listed";
  };

  return (
    <>
      <TopNav />
      <div className="min-h-screen bg-gradient-subtle px-4 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto py-10 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-secondary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Find Jobs</h1>
            <p className="text-lg text-muted-foreground">Use live search filters or rank jobs against your uploaded resume.</p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border grid md:grid-cols-5 gap-4">
            <label className="space-y-2 md:col-span-1">
              <span className="text-sm font-semibold text-foreground">Location</span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                placeholder="US"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-foreground">Job Title</span>
              <input
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                placeholder="Software Engineer"
              />
            </label>

            <label className="space-y-2 md:col-span-1">
              <span className="text-sm font-semibold text-foreground">Job Type</span>
              <select
                value={jobType}
                onChange={(event) => setJobType(event.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              >
                <option value="">Any</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
              </select>
            </label>

            <label className="space-y-2 md:col-span-1">
              <span className="text-sm font-semibold text-foreground">Min Salary</span>
              <input
                type="number"
                value={minSalary}
                onChange={(event) => setMinSalary(event.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                placeholder="70000"
              />
            </label>

            <div className="md:col-span-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSearch}
                disabled={isWorking}
                className="px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold disabled:opacity-60"
              >
                {searchMutation.isPending ? "Searching..." : "Search Jobs"}
              </button>

              <button
                type="button"
                onClick={handleMatch}
                disabled={isWorking}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-60"
              >
                <Sparkles className="w-4 h-4" />
                {matchMutation.isPending ? "Matching..." : "Match with Resume"}
              </button>

              <p className="text-sm text-muted-foreground">{statusLabel}</p>
            </div>

            {error ? <p className="md:col-span-5 text-sm text-destructive">{error}</p> : null}
          </div>

          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="bg-card rounded-2xl p-6 border border-border">
                <p className="text-sm text-muted-foreground">No jobs to display yet.</p>
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="bg-card rounded-2xl p-6 border border-border space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{job.title}</h2>
                      <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                    </div>
                    {typeof job.match_score === "number" ? (
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        Match {Math.round(job.match_score)}%
                      </span>
                    ) : null}
                  </div>

                  <p className="text-sm text-foreground">{formatSalary(job)} • {job.job_type ?? "Type not listed"}</p>

                  {job.requirements?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.slice(0, 8).map((skill) => (
                        <span key={skill} className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <p className="text-sm text-muted-foreground line-clamp-3">{job.description ?? "No description available."}</p>

                  {job.url ? (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-sm font-semibold text-primary hover:text-primary/80"
                    >
                      Open listing
                    </a>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <MobileActionBar />
    </>
  );
}
