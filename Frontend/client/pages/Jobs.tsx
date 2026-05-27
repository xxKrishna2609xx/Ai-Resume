import { AppShell } from "@/components/AppShell";
import { Search, Sparkles, Loader2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { JobItem } from "@shared/api";
import { matchJobsToResume, searchJobs } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Framer Motion Variants ─── */
const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

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
      return `$${Math.round(job.salary_min / 1000)}k – $${Math.round(job.salary_max / 1000)}k`;
    }
    if (job.salary_max) return `Up to $${Math.round(job.salary_max / 1000)}k`;
    return "Salary not listed";
  };

  return (
    <AppShell>
      <div className="p-6 lg:p-8 space-y-6 max-w-6xl">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="section-label mb-2">MODULE 04 // JOB SEARCH</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Find Jobs</h1>
          <p className="text-muted-foreground mt-1 text-sm font-mono">
            Use live search filters or rank opportunities against your uploaded resume.
          </p>
        </motion.div>

        {/* ── Search Filters Panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="bento-tile"
        >
          <p className="section-label mb-4">SEARCH FILTERS</p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">

            {/* Location */}
            <div className="md:col-span-1 space-y-1">
              <label className="section-label text-[10px]">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="cyber-input w-full"
                placeholder="US"
              />
            </div>

            {/* Job Title */}
            <div className="md:col-span-2 space-y-1">
              <label className="section-label text-[10px]">Job Title</label>
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="cyber-input w-full"
                placeholder="Software Engineer"
              />
            </div>

            {/* Job Type */}
            <div className="md:col-span-1 space-y-1">
              <label className="section-label text-[10px]">Job Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="cyber-input w-full"
              >
                {/* Values match Adzuna API contract_type field values */}
                <option value="">Any</option>
                <option value="permanent">Full Time (Permanent)</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
              </select>
            </div>

            {/* Min Salary */}
            <div className="md:col-span-1 space-y-1">
              <label className="section-label text-[10px]">Min Salary</label>
              <input
                type="number"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                className="cyber-input w-full"
                placeholder="70000"
              />
            </div>

            {/* Action Row */}
            <div className="md:col-span-5 flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleSearch}
                disabled={isWorking}
                className="btn-ghost-cyber disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {searchMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {searchMutation.isPending ? "Searching..." : "Search Jobs"}
              </button>

              <button
                type="button"
                onClick={handleMatch}
                disabled={isWorking}
                className="btn-neon-purple disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {matchMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {matchMutation.isPending ? "Matching..." : "Match with Resume"}
              </button>

              <p className="section-label text-[10px] ml-1">{statusLabel}</p>
            </div>

            {/* Error */}
            {error && (
              <p className="md:col-span-5 text-xs text-red-400 font-mono mt-1">
                ⚠ {error}
              </p>
            )}
          </div>
        </motion.div>

        {/* ── Jobs List ── */}
        <AnimatePresence mode="wait">
          {jobs.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bento-tile flex flex-col items-center justify-center py-16 gap-4"
            >
              <div className="w-16 h-16 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                <Search className="w-8 h-8 text-secondary/50" />
              </div>
              <p className="section-label">NO RESULTS YET</p>
              <p className="text-xs text-muted-foreground font-mono max-w-xs text-center">
                Use the filters above to search for jobs or match them against your uploaded resume.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="jobs"
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {jobs.map((job) => (
                <motion.div
                  key={job.id}
                  variants={cardVariants}
                  className="bento-tile space-y-3"
                >
                  {/* Top row: title + match badge */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h2 className="font-bold text-foreground text-lg leading-tight">
                      {job.title}
                    </h2>
                    {typeof job.match_score === "number" && (
                      <span className="cyber-badge-purple shrink-0">
                        Match {Math.round(job.match_score)}%
                      </span>
                    )}
                  </div>

                  {/* Company · Location */}
                  <p className="text-sm text-muted-foreground font-mono">
                    {job.company}
                    {job.location ? (
                      <>
                        <span className="mx-1.5 text-border">·</span>
                        {job.location}
                      </>
                    ) : null}
                  </p>

                  {/* Salary + Type */}
                  <p className="section-label text-[10px]">
                    {formatSalary(job)}
                    {job.job_type ? (
                      <>
                        <span className="mx-1.5">·</span>
                        {job.job_type}
                      </>
                    ) : null}
                  </p>

                  {/* Requirements */}
                  {job.requirements?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {job.requirements.slice(0, 8).map((skill) => (
                        <span key={skill} className="cyber-badge">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {/* Description */}
                  {job.description && (
                    <p
                      className="text-xs text-muted-foreground leading-relaxed line-clamp-3"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {job.description}
                    </p>
                  )}

                  {/* Open listing link */}
                  {job.url && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-mono text-secondary hover:text-secondary/70 transition-colors"
                    >
                      Open listing <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </AppShell>
  );
}
