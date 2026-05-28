import { AppShell } from "@/components/AppShell";
import { Search, Sparkles, Loader2, ExternalLink, FileText, Copy, Check, X } from "lucide-react";
import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import type { JobItem } from "@shared/api";
import { generateCoverLetter, matchJobsToResume, searchJobs } from "@/lib/api";
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
const coverLetterVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  show: { opacity: 1, height: "auto", marginTop: 16, transition: { duration: 0.35, ease: "easeOut" as const } },
  exit: { opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.25, ease: "easeIn" as const } },
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

  // Per-job cover letter state
  const [coverLetterLoading, setCoverLetterLoading] = useState<Record<string, boolean>>({});
  const [coverLetters, setCoverLetters] = useState<Record<string, string>>({});
  const [coverLetterErrors, setCoverLetterErrors] = useState<Record<string, string>>({});
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);

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
      setCoverLetters({});
      setCoverLetterErrors({});
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
      setCoverLetters({});
      setCoverLetterErrors({});
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

  const handleGenerateCoverLetter = useCallback(
    async (job: JobItem) => {
      const resumeId = profile?.resumeId;
      if (!resumeId) {
        setCoverLetterErrors((prev) => ({
          ...prev,
          [job.id]: "Please upload your resume first from the Analyzer page.",
        }));
        return;
      }

      const token = await getIdToken();
      if (!token) {
        setCoverLetterErrors((prev) => ({
          ...prev,
          [job.id]: "Authentication token missing. Please sign in again.",
        }));
        return;
      }

      setCoverLetterLoading((prev) => ({ ...prev, [job.id]: true }));
      setCoverLetterErrors((prev) => ({ ...prev, [job.id]: "" }));
      // Clear existing letter so we show a fresh generation
      setCoverLetters((prev) => ({ ...prev, [job.id]: "" }));

      try {
        const response = await generateCoverLetter(
          {
            resume_id: resumeId,
            job_title: job.title,
            company_name: job.company,
            job_description: job.description ?? "",
          },
          token,
        );
        setCoverLetters((prev) => ({ ...prev, [job.id]: response.cover_letter }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to generate cover letter";
        setCoverLetterErrors((prev) => ({ ...prev, [job.id]: msg }));
      } finally {
        setCoverLetterLoading((prev) => ({ ...prev, [job.id]: false }));
      }
    },
    [profile, getIdToken],
  );

  const handleCopy = useCallback(async (jobId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedJobId(jobId);
      setTimeout(() => setCopiedJobId(null), 2500);
    } catch {
      // Fallback for browsers that block clipboard access
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedJobId(jobId);
      setTimeout(() => setCopiedJobId(null), 2500);
    }
  }, []);

  const handleDismissCoverLetter = useCallback((jobId: string) => {
    setCoverLetters((prev) => ({ ...prev, [jobId]: "" }));
    setCoverLetterErrors((prev) => ({ ...prev, [jobId]: "" }));
  }, []);

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
              {jobs.map((job) => {
                const isGenerating = coverLetterLoading[job.id] ?? false;
                const coverLetter = coverLetters[job.id] ?? "";
                const clError = coverLetterErrors[job.id] ?? "";
                const isCopied = copiedJobId === job.id;

                return (
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

                    {/* Action row: Open listing + Generate Cover Letter */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-border/40">
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

                      {/* Generate Cover Letter button */}
                      <button
                        type="button"
                        id={`cover-letter-btn-${job.id}`}
                        onClick={() => handleGenerateCoverLetter(job)}
                        disabled={isGenerating}
                        className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg
                                   bg-emerald-500/10 border border-emerald-500/30 text-emerald-400
                                   hover:bg-emerald-500/20 hover:border-emerald-500/60
                                   disabled:opacity-50 disabled:cursor-not-allowed
                                   transition-all duration-200"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="w-3 h-3" />
                            {coverLetter ? "Regenerate Cover Letter" : "Generate Cover Letter"}
                          </>
                        )}
                      </button>
                    </div>

                    {/* Cover Letter Error */}
                    {clError && (
                      <p className="text-xs text-red-400 font-mono">⚠ {clError}</p>
                    )}

                    {/* Cover Letter Output */}
                    <AnimatePresence>
                      {coverLetter && (
                        <motion.div
                          key={`cl-${job.id}`}
                          variants={coverLetterVariants}
                          initial="hidden"
                          animate="show"
                          exit="exit"
                          style={{ overflow: "hidden" }}
                        >
                          <div
                            className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 space-y-3"
                            style={{
                              boxShadow: "0 0 20px rgba(16,185,129,0.08)",
                            }}
                          >
                            {/* Cover letter header */}
                            <div className="flex items-center justify-between">
                              <p className="section-label text-[10px] text-emerald-400">
                                ✦ AI-GENERATED COVER LETTER
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  {coverLetter.length} chars
                                </span>
                                {/* Copy button */}
                                <button
                                  type="button"
                                  id={`copy-cover-letter-${job.id}`}
                                  onClick={() => handleCopy(job.id, coverLetter)}
                                  className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-md
                                    border transition-all duration-200
                                    ${isCopied
                                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                      : "bg-secondary/10 border-border text-muted-foreground hover:text-foreground hover:border-secondary/40"
                                    }`}
                                >
                                  {isCopied ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      Copy
                                    </>
                                  )}
                                </button>
                                {/* Dismiss button */}
                                <button
                                  type="button"
                                  id={`dismiss-cover-letter-${job.id}`}
                                  onClick={() => handleDismissCoverLetter(job.id)}
                                  className="inline-flex items-center justify-center w-6 h-6 rounded-md
                                    text-muted-foreground hover:text-foreground hover:bg-secondary/20
                                    border border-transparent hover:border-border transition-all duration-200"
                                  title="Dismiss"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Cover letter text area */}
                            <textarea
                              id={`cover-letter-text-${job.id}`}
                              readOnly
                              value={coverLetter}
                              rows={12}
                              className="w-full bg-transparent text-sm text-foreground/90 font-mono leading-relaxed
                                         resize-y rounded-lg p-0 border-none outline-none
                                         placeholder:text-muted-foreground"
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: "0.78rem",
                                lineHeight: "1.65",
                              }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </AppShell>
  );
}
