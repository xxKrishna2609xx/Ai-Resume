import { Zap, Upload, Building2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { createOrUpdateProfile } from "@/lib/api";
import { writeProfileCache } from "@/lib/profileCache";
import { getHomeRouteByRole } from "@/lib/routes";
import type { UserRole } from "@shared/api";
import { motion } from "framer-motion";

// ─── Animation Variants ───────────────────────────────────────────────────────
const pageVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProfileSetup() {
  const navigate = useNavigate();
  const { profile, getIdToken, refreshProfile } = useAuth();
  const [role, setRole] = useState<UserRole>("job_seeker");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Job Seeker fields ──
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [currentTitle, setCurrentTitle] = useState(profile?.currentTitle ?? "");
  const [experienceYears, setExperienceYears] = useState(profile?.experienceYears ?? 0);
  const [skills, setSkills] = useState((profile?.skills ?? []).join(", "));

  // ── Company fields ──
  const [companyName, setCompanyName] = useState(profile?.companyName ?? "");
  const [industry, setIndustry] = useState(profile?.industry ?? "");
  const [companySize, setCompanySize] = useState(profile?.companySize ?? "11-50");

  const parsedSkills = useMemo(
    () =>
      skills
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    [skills],
  );

  const submitProfile = async () => {
    setError(null);
    setIsSaving(true);

    try {
      const token = await getIdToken();
      if (!token) throw new Error("Authentication token missing. Please sign in again.");

      const payload =
        role === "job_seeker"
          ? {
              role,
              displayName,
              currentTitle,
              experienceYears,
              skills: parsedSkills,
              openToWork: true,
            }
          : {
              role,
              displayName,
              companyName,
              industry,
              companySize,
            };

      const response = await createOrUpdateProfile(payload, token);
      const optimisticProfile = {
        uid: profile?.uid ?? "",
        email: profile?.email,
        photoURL: profile?.photoURL,
        ...response.profile,
        needsProfileSetup: false,
      };
      if (optimisticProfile.uid) {
        writeProfileCache(optimisticProfile);
      }
      const updated = await refreshProfile();
      navigate(getHomeRouteByRole(updated?.role), { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save your profile.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Shared input class ──
  const inputCls = "cyber-input w-full";
  const selectCls =
    "cyber-input w-full appearance-none cursor-pointer";

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center px-4 py-12">
      {/* bg-dot pattern */}
      <div
        className="bg-dot absolute inset-0 opacity-[0.04] pointer-events-none"
        aria-hidden="true"
      />

      {/* Glow orbs */}
      <div
        className="absolute top-0 left-1/4 w-[480px] h-[320px] rounded-full pointer-events-none -translate-y-1/2"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.14) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-1/4 w-[400px] h-[280px] rounded-full pointer-events-none translate-y-1/2"
        style={{
          background: "radial-gradient(circle, hsl(var(--secondary) / 0.10) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-3xl w-full space-y-8"
        variants={pageVariants}
        initial="hidden"
        animate="show"
      >
        {/* ── Header ── */}
        <motion.div variants={fadeUp} className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/30 mb-2">
            <Zap className="w-6 h-6 text-primary" style={{ filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.8))" }} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Complete Your Profile
          </h1>
          <p
            className="section-label"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            STEP 01 // CHOOSE YOUR ROLE
          </p>
        </motion.div>

        {/* ── Role Selector Cards ── */}
        <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-5">
          {/* Job Seeker */}
          <button
            type="button"
            onClick={() => setRole("job_seeker")}
            className={`bento-tile text-left cursor-pointer p-7 transition-all duration-300 ${
              role === "job_seeker"
                ? "glow-border-purple bg-primary/5"
                : "hover:border-primary/30"
            }`}
          >
            <div
              className={`flex items-center justify-center w-11 h-11 rounded-lg mb-5 transition-all duration-300 ${
                role === "job_seeker"
                  ? "bg-primary/15 border border-primary/40"
                  : "bg-primary/10 border border-primary/20"
              }`}
            >
              <Upload
                className="w-5 h-5 text-primary"
                style={
                  role === "job_seeker"
                    ? { filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.8))" }
                    : {}
                }
              />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Job Seeker</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Looking for your next opportunity? Upload your resume and get matched with
              perfect jobs.
            </p>
            {role === "job_seeker" && (
              <div className="mt-4 flex items-center gap-2">
                <span
                  className="text-xs font-mono text-primary"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  // SELECTED
                </span>
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
            )}
          </button>

          {/* Company */}
          <button
            type="button"
            onClick={() => setRole("company")}
            className={`bento-tile text-left cursor-pointer p-7 transition-all duration-300 ${
              role === "company"
                ? "glow-border-cyan bg-secondary/5"
                : "hover:border-secondary/30"
            }`}
          >
            <div
              className={`flex items-center justify-center w-11 h-11 rounded-lg mb-5 transition-all duration-300 ${
                role === "company"
                  ? "bg-secondary/15 border border-secondary/40"
                  : "bg-secondary/10 border border-secondary/20"
              }`}
            >
              <Building2
                className="w-5 h-5 text-secondary"
                style={
                  role === "company"
                    ? { filter: "drop-shadow(0 0 6px hsl(var(--secondary) / 0.8))" }
                    : {}
                }
              />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Company / Recruiter</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hiring? Find the best candidates from our talent pool with AI-powered matching.
            </p>
            {role === "company" && (
              <div className="mt-4 flex items-center gap-2">
                <span
                  className="text-xs font-mono text-secondary"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  // SELECTED
                </span>
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              </div>
            )}
          </button>
        </motion.div>

        {/* ── Profile Form ── */}
        <motion.div variants={fadeUp} className="bento-tile p-6 md:p-8 space-y-6">
          <div>
            <p
              className="section-label mb-4"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {role === "job_seeker" ? "// PERSONAL INFO" : "// COMPANY INFO"}
            </p>

            {/* Row 1: Display Name + role-specific second field */}
            <div className="grid md:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span
                  className="section-label text-xs"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  DISPLAY NAME
                </span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className={inputCls}
                />
              </label>

              {role === "job_seeker" ? (
                <label className="space-y-2">
                  <span
                    className="section-label text-xs"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    CURRENT TITLE
                  </span>
                  <input
                    type="text"
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value)}
                    placeholder="Software Engineer"
                    className={inputCls}
                  />
                </label>
              ) : (
                <label className="space-y-2">
                  <span
                    className="section-label text-xs"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    COMPANY NAME
                  </span>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Corp"
                    className={inputCls}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Row 2: role-specific fields */}
          <div>
            <p
              className="section-label text-xs mb-4"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {role === "job_seeker" ? "// EXPERIENCE & SKILLS" : "// ORGANIZATION DETAILS"}
            </p>

            {role === "job_seeker" ? (
              <div className="grid md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span
                    className="section-label text-xs"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    EXPERIENCE YEARS
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value || 0))}
                    className={inputCls}
                  />
                </label>

                <label className="space-y-2">
                  <span
                    className="section-label text-xs"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    SKILLS (COMMA SEPARATED)
                  </span>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="React, TypeScript, Python"
                    className={inputCls}
                  />
                </label>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span
                    className="section-label text-xs"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    INDUSTRY
                  </span>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="SaaS, Healthcare, Finance"
                    className={inputCls}
                  />
                </label>

                <label className="space-y-2">
                  <span
                    className="section-label text-xs"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    COMPANY SIZE
                  </span>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className={selectCls}
                  >
                    <option value="1-10">1 – 10</option>
                    <option value="11-50">11 – 50</option>
                    <option value="51-200">51 – 200</option>
                    <option value="201-1000">201 – 1,000</option>
                    <option value="1000+">1,000+</option>
                  </select>
                </label>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-400 font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              ⚠ {error}
            </p>
          )}

          {/* Submit button */}
          <button
            type="button"
            onClick={submitProfile}
            disabled={isSaving}
            className="btn-neon-purple w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Saving profile…
              </>
            ) : (
              "Save & Continue"
            )}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
