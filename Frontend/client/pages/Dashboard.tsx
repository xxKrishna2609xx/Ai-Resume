import { AppShell } from "@/components/AppShell";
import { Link } from "react-router-dom";
import { Upload, Search, User, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getResumeById, searchJobs, updateOpenToWork } from "@/lib/api";
import { motion } from "framer-motion";

/* ─── Framer Motion Variants ─── */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

/* ─── Circular Score Ring ─── */
function ScoreRing({ score }: { score: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r; // ≈ 238.76
  const offset = circ * (1 - Math.min(10, Math.max(0, score)) / 10);
  return (
    <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
      <svg
        width="96"
        height="96"
        className="rotate-[-90deg] absolute inset-0"
      >
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="6"
        />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            filter: "drop-shadow(0 0 8px hsl(var(--primary)))",
            transition: "stroke-dashoffset 1.2s ease",
          }}
        />
      </svg>
      <span className="stat-number text-lg text-primary relative z-10">{score}</span>
    </div>
  );
}

export default function Dashboard() {
  const { profile, getIdToken, refreshProfile } = useAuth();
  const [openToWork, setOpenToWork] = useState(Boolean(profile?.openToWork));

  useEffect(() => {
    setOpenToWork(Boolean(profile?.openToWork));
  }, [profile?.openToWork]);

  const resumeQuery = useQuery({
    queryKey: ["resume", profile?.resumeId],
    queryFn: async () => {
      const token = await getIdToken();
      if (!token) throw new Error("Missing authentication token");
      return getResumeById(profile?.resumeId as string, token);
    },
    enabled: Boolean(profile?.resumeId),
  });

  const jobsQuery = useQuery({
    queryKey: ["dashboard-jobs", profile?.currentTitle],
    queryFn: () =>
      searchJobs({
        location: "US",
        job_title: profile?.currentTitle ?? "",
        results_per_page: 20,
        page: 1,
      }),
    // Only run after profile has loaded so currentTitle is available
    enabled: Boolean(profile),
  });

  const openToWorkMutation = useMutation({
    mutationFn: async (nextOpenToWork: boolean) => {
      const token = await getIdToken();
      if (!token) throw new Error("Missing authentication token");
      return updateOpenToWork({ openToWork: nextOpenToWork }, token);
    },
    onSuccess: async (_, nextOpenToWork) => {
      setOpenToWork(nextOpenToWork);
      await refreshProfile();
    },
  });

  const resumeScore = Number(
    resumeQuery.data?.full_ai_response?.resume_quality_score ?? 0,
  );
  const welcomeName = profile?.displayName ?? profile?.email ?? "there";
  const jobsTotal = jobsQuery.data?.total ?? 0;

  const handleToggleOpenToWork = async () => {
    const nextValue = !openToWork;
    setOpenToWork(nextValue);
    try {
      await openToWorkMutation.mutateAsync(nextValue);
    } catch {
      setOpenToWork(!nextValue);
    }
  };

  /* ─── Derived role label ─── */
  const roleLabel = profile?.currentTitle
    ? profile.currentTitle.toUpperCase()
    : "PROFESSIONAL";

  return (
    <AppShell>
      <div className="p-6 lg:p-8 space-y-6 max-w-6xl">

        {/* ── Welcome Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="section-label mb-2">DASHBOARD // {roleLabel}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Welcome back,{" "}
            <span className="text-primary" style={{ filter: "drop-shadow(0 0 12px hsl(var(--primary) / 0.6))" }}>
              {welcomeName}
            </span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-mono">
            Your AI-powered career hub
          </p>
        </motion.div>

        {/* ── Top Bento Row: 3 columns ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Tile 1 — Resume Score */}
          <motion.div variants={itemVariants} className="bento-tile flex flex-col gap-4">
            <p className="section-label">RESUME SCORE</p>
            <div className="flex items-center gap-5 flex-1">
              <ScoreRing score={resumeScore} />
              <div>
                <div className="stat-number text-3xl text-primary">{resumeScore}<span className="text-lg text-muted-foreground">/10</span></div>
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  {profile?.resumeId ? "Based on latest resume" : "Upload resume to score"}
                </p>
              </div>
            </div>
            <Link
              to="/analyzer"
              className="text-xs font-mono text-primary hover:text-primary/70 transition-colors flex items-center gap-1 mt-auto"
            >
              View detailed analysis <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>

          {/* Tile 2 — Job Matches */}
          <motion.div variants={itemVariants} className="bento-tile flex flex-col gap-4">
            <p className="section-label">JOB MATCHES</p>
            <div className="flex-1 flex flex-col justify-center">
              <div className="stat-number text-5xl text-secondary" style={{ filter: "drop-shadow(0 0 10px hsl(var(--secondary) / 0.5))" }}>
                {jobsQuery.isLoading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-secondary" />
                ) : (
                  jobsTotal
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-2">
                {jobsQuery.isLoading ? "Fetching live data..." : "Synced live"}
              </p>
            </div>
            <Link
              to="/jobs"
              className="text-xs font-mono text-secondary hover:text-secondary/70 transition-colors flex items-center gap-1 mt-auto"
            >
              Explore matches <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>

          {/* Tile 3 — Availability / Open To Work */}
          <motion.div variants={itemVariants} className="bento-tile flex flex-col gap-4">
            <p className="section-label">AVAILABILITY</p>
            <div className="flex-1 flex flex-col justify-center gap-3">
              <p className="text-xs text-muted-foreground font-mono">
                {openToWork
                  ? "Profile visible to employers"
                  : "Profile hidden from employers"}
              </p>
              <button
                onClick={handleToggleOpenToWork}
                disabled={openToWorkMutation.isPending}
                className={`relative flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg font-mono text-sm font-semibold transition-all duration-300 ${
                  openToWork
                    ? "bg-accent/10 border border-accent text-accent"
                    : "bg-muted/30 border border-border text-muted-foreground"
                }`}
                style={
                  openToWork
                    ? { boxShadow: "0 0 16px hsl(var(--accent) / 0.35), inset 0 0 12px hsl(var(--accent) / 0.08)" }
                    : {}
                }
              >
                {openToWorkMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span
                      className={`w-2 h-2 rounded-full ${openToWork ? "bg-accent animate-pulse" : "bg-muted-foreground"}`}
                    />
                    {openToWork ? "OPEN TO WORK" : "NOT AVAILABLE"}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Bottom Bento Row: Quick Actions ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Card 1 — Upload Resume → /analyzer */}
          <motion.div variants={itemVariants}>
            <Link
              to="/analyzer"
              className="bento-tile group flex flex-col gap-4 cursor-pointer hover:border-primary/50 transition-all duration-300 block"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div
                className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                style={{ boxShadow: "0 0 0 0 hsl(var(--primary) / 0)" }}
              >
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground text-base mb-1">Upload Resume</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Keep your resume fresh with the latest version and get AI-powered scoring.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono text-primary group-hover:gap-2 transition-all">
                Get started <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          </motion.div>

          {/* Card 2 — Find Jobs → /jobs */}
          <motion.div variants={itemVariants}>
            <Link
              to="/jobs"
              className="bento-tile group flex flex-col gap-4 cursor-pointer hover:border-secondary/50 transition-all duration-300 block"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div className="w-11 h-11 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Search className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground text-base mb-1">Find Jobs</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Browse and match positions tailored for you using live search and resume ranking.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono text-secondary group-hover:gap-2 transition-all">
                Explore <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          </motion.div>

          {/* Card 3 — Edit Profile → /profile-setup */}
          <motion.div variants={itemVariants}>
            <Link
              to="/profile-setup"
              className="bento-tile group flex flex-col gap-4 cursor-pointer hover:border-accent/50 transition-all duration-300 block"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div className="w-11 h-11 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <User className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground text-base mb-1">Edit Profile</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Update your skills, title, and availability status to attract the right opportunities.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono text-accent group-hover:gap-2 transition-all">
                Go to profile <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          </motion.div>
        </motion.div>

      </div>
    </AppShell>
  );
}
