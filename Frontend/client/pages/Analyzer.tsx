import { AppShell } from "@/components/AppShell";
import { Upload, Loader2, FileText, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { uploadResume, getResumeById } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

/* ── Circular Score Ring ─────────────────────────────────────────── */
function ScoreRing({
  score,
  max = 10,
  color = "primary",
}: {
  score: number;
  max?: number;
  color?: "primary" | "cyan";
}) {
  const r = 50;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / max);
  return (
    <svg width="140" height="140" className="rotate-[-90deg]">
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth="7"
      />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke={
          color === "cyan"
            ? "hsl(var(--secondary))"
            : "hsl(var(--primary))"
        }
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{
          filter: `drop-shadow(0 0 10px hsl(var(--${color === "cyan" ? "secondary" : "primary"})))`,
          transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </svg>
  );
}

/* ── Experience Level Helper ─────────────────────────────────────── */
function getLevel(years: number): string {
  if (years < 1) return "Entry Level";
  if (years < 3) return "Junior";
  if (years < 6) return "Mid Level";
  if (years < 10) return "Senior";
  return "Principal";
}

/* ── Animation Variants ──────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

/* ── Component ───────────────────────────────────────────────────── */
export default function Analyzer() {
  const { getIdToken, refreshProfile, profile } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resumeQuery = useQuery({
    queryKey: ["resume", profile?.resumeId],
    queryFn: async () => {
      const token = await getIdToken();
      if (!token) throw new Error("Missing authentication token");
      return getResumeById(profile?.resumeId as string, token);
    },
    enabled: Boolean(profile?.resumeId),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const token = await getIdToken();
      if (!token)
        throw new Error("Authentication token missing. Please sign in again.");
      return uploadResume(file, token);
    },
    onSuccess: async () => {
      await refreshProfile();
      await resumeQuery.refetch();
    },
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please choose a PDF file first.");
      return;
    }
    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Only PDF files are supported.");
      return;
    }
    setError(null);
    try {
      await uploadMutation.mutateAsync(selectedFile);
    } catch (err: any) {
      setError(err?.message || "Upload and analysis failed. Please try again.");
    }
  };

  const analysis =
    uploadMutation.data?.ai_analysis ?? resumeQuery.data?.full_ai_response;

  const skills: string[] = analysis?.skills ?? [];
  const score: number = analysis?.resume_quality_score ?? 0;
  const experienceYears: number = analysis?.experience_years ?? 0;
  const scorePercent = Math.round((score / 10) * 100);

  return (
    <AppShell>
      <div className="p-6 space-y-8 max-w-5xl mx-auto">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-1"
        >
          <p className="section-label">MODULE 01 // RESUME ANALYZER</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Resume{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Analyzer
            </span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Upload your latest resume and receive deep AI-powered analysis from
            the pipeline.
          </p>
        </motion.div>

        {/* ── Upload Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bento-tile space-y-5"
        >
          {/* Dropzone */}
          <div
            className={`dropzone min-h-[220px] flex flex-col items-center justify-center gap-4 p-10 relative overflow-hidden ${
              uploadMutation.isPending ? "dropzone-analyzing" : ""
            }`}
            onClick={() => {
              if (!uploadMutation.isPending) fileInputRef.current?.click();
            }}
          >
            {uploadMutation.isPending ? (
              /* Analyzing state */
              <>
                {/* Scan line */}
                <div
                  className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary to-transparent opacity-60"
                  style={{ animation: "scan-line 2s linear infinite" }}
                />
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="flex flex-col items-center gap-3"
                >
                  <Loader2
                    className="w-14 h-14 text-secondary animate-spin"
                    style={{
                      filter: "drop-shadow(0 0 12px hsl(var(--secondary)))",
                    }}
                  />
                  <p
                    className="text-secondary font-semibold text-base"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Analyzing with AI...
                  </p>
                  <p className="section-label">
                    Processing document · Please wait
                  </p>
                </motion.div>
              </>
            ) : (
              /* Idle state */
              <>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(var(--primary)/0.15) 0%, hsl(var(--primary)/0.05) 100%)",
                    boxShadow: "0 0 24px hsl(var(--primary)/0.2)",
                  }}
                >
                  <Upload
                    className="w-8 h-8 text-primary"
                    style={{
                      filter: "drop-shadow(0 0 8px hsl(var(--primary)))",
                    }}
                  />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-foreground text-lg font-semibold">
                    Drop your resume here
                  </h3>
                  <p className="section-label">or click to browse</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    PDF files only · Max 10 MB
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              setSelectedFile(e.target.files?.[0] ?? null);
              setError(null);
            }}
          />

          {/* Selected file badge */}
          {selectedFile && (
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent flex-shrink-0" />
              <span className="section-label">Selected:</span>
              <span className="cyber-badge-green truncate max-w-xs">
                {selectedFile.name}
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <p
              className="text-sm"
              style={{ color: "hsl(var(--destructive))" }}
            >
              {error}
            </p>
          )}
          {uploadMutation.error && (
            <p
              className="text-sm"
              style={{ color: "hsl(var(--destructive))" }}
            >
              {uploadMutation.error instanceof Error
                ? uploadMutation.error.message
                : "Upload failed"}
            </p>
          )}

          {/* Upload button */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            className="btn-neon-purple w-full flex items-center justify-center gap-2 py-3"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Upload & Analyze Resume
              </>
            )}
          </button>
        </motion.div>

        {/* ── Results Grid ── */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-3 gap-4"
            >
              {/* Tile A — Status (col-span-1) */}
              <motion.div
                variants={itemVariants}
                className="bento-tile md:col-span-1 space-y-4"
              >
                <p className="section-label">AI ANALYSIS STATUS</p>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className="w-5 h-5 text-accent"
                    style={{
                      filter: "drop-shadow(0 0 6px hsl(var(--accent)))",
                    }}
                  />
                  <span className="text-foreground font-semibold text-sm">
                    Analysis Complete
                  </span>
                </div>
                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, hsl(var(--accent)), hsl(142 70% 60%))",
                        boxShadow: "0 0 10px hsl(var(--accent)/0.6)",
                      }}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.2, delay: 0.3 }}
                    />
                  </div>
                  <p className="section-label text-accent/70">
                    100% Completed
                  </p>
                </div>
                <button className="btn-ghost-cyber w-full flex items-center justify-between">
                  <span>View Full Report</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>

              {/* Tile B — Score (col-span-2) */}
              <motion.div
                variants={itemVariants}
                className="bento-tile md:col-span-2 flex flex-col items-center justify-center gap-4 py-8"
              >
                <p className="section-label w-full text-left">
                  OVERALL MATCH SCORE
                </p>
                <div className="relative">
                  <ScoreRing score={score} max={10} color="primary" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="stat-number text-4xl text-primary"
                      style={{
                        filter: "drop-shadow(0 0 12px hsl(var(--primary)))",
                      }}
                    >
                      {scorePercent}%
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  Your resume scored{" "}
                  <span className="text-primary font-semibold">
                    {score}/10
                  </span>
                </p>
                <button className="btn-ghost-cyber flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Improve Score
                </button>
              </motion.div>

              {/* Tile C — Experience (col-span-1) */}
              <motion.div
                variants={itemVariants}
                className="bento-tile md:col-span-1 space-y-3"
              >
                <p className="section-label">EXPERIENCE LEVEL</p>
                <div className="flex flex-col gap-2">
                  <span
                    className="stat-number text-5xl text-secondary"
                    style={{
                      filter: "drop-shadow(0 0 14px hsl(var(--secondary)/0.7))",
                    }}
                  >
                    {experienceYears}
                  </span>
                  <span className="text-muted-foreground text-sm">Years</span>
                </div>
                <span className="cyber-badge-purple">
                  {getLevel(experienceYears)}
                </span>
              </motion.div>

              {/* Tile D — Skills (col-span-2) */}
              <motion.div
                variants={itemVariants}
                className="bento-tile md:col-span-2 space-y-4"
              >
                <p className="section-label">EXTRACTED SKILLS</p>
                {skills.length > 0 ? (
                  <div
                    className="space-y-2 text-sm overflow-y-auto max-h-52 pr-1"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {skills.map((skill, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span
                          className="text-muted-foreground w-6 text-right flex-shrink-0"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-secondary">{"[\""}</span>
                        <span className="text-foreground">{skill}</span>
                        <span className="text-secondary">{"\"]"}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No skills extracted yet.
                  </p>
                )}
              </motion.div>

              {/* Tile E — Summary (full-width) */}
              <motion.div
                variants={itemVariants}
                className="bento-tile md:col-span-3 space-y-3"
              >
                <p className="section-label">AI SUMMARY</p>
                {analysis?.summary ? (
                  <p className="text-muted-foreground text-sm italic leading-relaxed">
                    {analysis.summary}
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm italic">
                    No summary available.
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
