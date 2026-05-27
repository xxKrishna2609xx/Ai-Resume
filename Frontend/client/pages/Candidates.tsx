import { AppShell } from "@/components/AppShell";
import { Search, Users } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchCandidates } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

/* ── Animation Variants ──────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ── Avatar Gradient Array ───────────────────────────────────────── */
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(268 80% 45%) 100%)",
  "linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(195 100% 35%) 100%)",
  "linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(142 70% 35%) 100%)",
  "linear-gradient(135deg, hsl(268 90% 62%) 0%, hsl(195 100% 50%) 100%)",
];

export default function Candidates() {
  const { getIdToken } = useAuth();
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [openOnly, setOpenOnly] = useState(true);
  const [submitted, setSubmitted] = useState({
    skills: "",
    minExperience: undefined as number | undefined,
    openOnly: true,
  });

  const candidatesQuery = useQuery({
    queryKey: ["candidates-page", submitted],
    queryFn: async () => {
      const token = await getIdToken();
      if (!token) throw new Error("Authentication token missing.");
      return searchCandidates(
        {
          skills: submitted.skills,
          min_experience: submitted.minExperience,
          open_to_work_only: submitted.openOnly,
          limit: 50,
        },
        token,
      );
    },
  });

  const candidates = candidatesQuery.data?.candidates ?? [];

  const applyFilters = () => {
    setSubmitted({
      skills: skills.trim(),
      minExperience: experience ? Number(experience) : undefined,
      openOnly,
    });
  };

  return (
    <AppShell>
      <div className="p-6 space-y-8 max-w-6xl mx-auto">
        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-1"
        >
          <p className="section-label">MODULE 03 // CANDIDATE SEARCH</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Find{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Candidates
            </span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Search job seekers by skill, experience, and availability using our live neural pool.
          </p>
        </motion.div>

        {/* ── Search Bar / Filter Panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="bento-tile grid md:grid-cols-4 gap-4 items-end"
        >
          <div className="space-y-2 md:col-span-2">
            <span className="section-label">Skills (comma separated)</span>
            <input
              type="text"
              value={skills}
              onChange={(event) => setSkills(event.target.value)}
              placeholder="React, Python, AWS"
              className="cyber-input w-full"
            />
          </div>

          <div className="space-y-2">
            <span className="section-label">Min experience (years)</span>
            <input
              type="number"
              min={0}
              value={experience}
              onChange={(event) => setExperience(event.target.value)}
              placeholder="e.g. 2"
              className="cyber-input w-full"
            />
          </div>

          <div className="flex flex-col space-y-2 pb-2">
            <span className="section-label">Availability</span>
            <label className="flex items-center gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                className="sr-only"
                checked={openOnly}
                onChange={(event) => setOpenOnly(event.target.checked)}
              />
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                  openOnly
                    ? "border-primary bg-primary"
                    : "border-border bg-transparent"
                }`}
                style={
                  openOnly
                    ? { boxShadow: "0 0 8px hsl(var(--primary)/0.5)" }
                    : {}
                }
              >
                {openOnly && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                Open to work only
              </span>
            </label>
          </div>

          <div className="md:col-span-4 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-border/30">
            <button
              type="button"
              onClick={applyFilters}
              className="btn-neon-purple flex items-center justify-center gap-2 py-3 px-6"
            >
              <Search className="w-4 h-4" />
              Search Candidates
            </button>

            <p className="section-label text-sm">
              {candidatesQuery.isFetching
                ? "SEARCHING CORE DATABASE..."
                : `${candidates.length} CANDIDATE(S) MATCHED`}
            </p>
          </div>
        </motion.div>

        {/* ── Error State ── */}
        {candidatesQuery.error && (
          <div className="bento-tile border-destructive/30">
            <p className="text-sm text-destructive">
              {candidatesQuery.error instanceof Error
                ? candidatesQuery.error.message
                : "Could not load candidates"}
            </p>
          </div>
        )}

        {/* ── Empty State ── */}
        {candidates.length === 0 && !candidatesQuery.isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bento-tile py-16 flex flex-col items-center gap-4"
          >
            <Users
              className="w-12 h-12 text-muted-foreground/30"
              style={{
                filter: "drop-shadow(0 0 8px hsl(var(--primary)/0.2))",
              }}
            />
            <p className="section-label">No candidates found for your filters</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search parameters or query keywords.
            </p>
          </motion.div>
        )}

        {/* ── Candidate Cards Grid ── */}
        {candidates.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid md:grid-cols-2 gap-4"
          >
            {candidates.map((candidate, idx) => {
              const avatarGradient =
                AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
              const initial = (
                candidate.displayName ?? candidate.currentTitle ?? "?"
              )
                .charAt(0)
                .toUpperCase();

              return (
                <motion.div
                  key={candidate.uid}
                  variants={itemVariants}
                  className="bento-tile space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                        style={{ background: avatarGradient }}
                      >
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {candidate.displayName ?? "Unnamed Candidate"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {candidate.currentTitle ?? "Role not provided"}
                        </p>
                      </div>
                      
                      <div className="ml-auto flex-shrink-0">
                        {candidate.openToWork ? (
                          <span className="cyber-badge-green">OPEN</span>
                        ) : (
                          <span className="cyber-badge">NOT OPEN</span>
                        )}
                      </div>
                    </div>

                    {/* Stats info */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="stat-number text-xl text-secondary"
                          style={{
                            filter:
                              "drop-shadow(0 0 6px hsl(var(--secondary)/0.6))",
                          }}
                        >
                          {candidate.experienceYears ?? 0}
                        </span>
                        <span className="text-muted-foreground text-xs">yrs exp</span>
                      </div>
                      <div className="h-4 w-px bg-border" />
                      {candidate.resumeId ? (
                        <span className="cyber-badge-green">Resume Uploaded</span>
                      ) : (
                        <span className="section-label">No resume</span>
                      )}
                    </div>

                    {/* Skills list */}
                    <div className="flex flex-wrap gap-1.5">
                      {(candidate.skills ?? []).length > 0 ? (
                        candidate.skills?.map((skill) => (
                          <span
                            key={`${candidate.uid}-${skill}`}
                            className="cyber-badge"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="section-label text-xs">No skills listed</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
