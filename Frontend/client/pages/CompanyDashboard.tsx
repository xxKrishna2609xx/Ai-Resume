import { AppShell } from "@/components/AppShell";
import { Link } from "react-router-dom";
import {
  RefreshCw,
  Filter,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchCandidates } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface CandidateFilters {
  skills: string;
  minExperience?: number;
  openToWorkOnly: boolean;
  limit: number;
  // Fix #11: Added real page field for proper pagination
  page: number;
}

/* ── Animation Variants ──────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ── Avatar gradient helper ──────────────────────────────────────── */
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(268 80% 45%) 100%)",
  "linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(195 100% 35%) 100%)",
  "linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(142 70% 35%) 100%)",
  "linear-gradient(135deg, hsl(268 90% 62%) 0%, hsl(195 100% 50%) 100%)",
];

/* ── Component ───────────────────────────────────────────────────── */
export default function CompanyDashboard() {
  const { getIdToken } = useAuth();
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftSkills, setDraftSkills] = useState("");
  const [draftMinExperience, setDraftMinExperience] = useState("");
  const [draftOpenOnly, setDraftOpenOnly] = useState(true);
  const [filters, setFilters] = useState<CandidateFilters>({
    skills: "",
    minExperience: undefined,
    openToWorkOnly: true,
    limit: 20,
    page: 1,
  });

  const candidatesQuery = useQuery({
    queryKey: ["company-candidates", filters],
    queryFn: async () => {
      const token = await getIdToken();
      if (!token) throw new Error("Authentication token missing.");
      return searchCandidates(
        {
          skills: filters.skills,
          min_experience: filters.minExperience,
          open_to_work_only: filters.openToWorkOnly,
          limit: filters.limit,
          page: filters.page,
        },
        token,
      );
    },
  });

  const candidates = candidatesQuery.data?.candidates ?? [];

  const openToCandidates = useMemo(
    () => candidates.filter((candidate) => candidate.openToWork).length,
    [candidates],
  );

  const activeFilterCount =
    (filters.skills ? 1 : 0) + (filters.minExperience !== undefined ? 1 : 0);

  const handleApplyFilters = () => {
    setFilters((previous) => ({
      ...previous,
      skills: draftSkills.trim(),
      minExperience: draftMinExperience ? Number(draftMinExperience) : undefined,
      openToWorkOnly: draftOpenOnly,
      page: 1,
    }));
    setFilterOpen(false);
  };

  const handleRefresh = async () => {
    await candidatesQuery.refetch();
  };

  const handleNext = () => {
    // Fix #11: Increment real page number instead of just increasing the limit
    setFilters((previous) => ({ ...previous, page: previous.page + 1 }));
  };

  const handlePrevious = () => {
    // Fix #11: Decrement page, never going below page 1
    setFilters((previous) => ({
      ...previous,
      page: Math.max(1, previous.page - 1),
    }));
  };

  return (
    <AppShell>
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-1"
        >
          <p className="section-label">MODULE 03 // TALENT POOL</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Find Your{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, hsl(var(--secondary)), hsl(var(--primary)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Next Hire
            </span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Browse and connect with top talent from your live candidate pool.
          </p>
        </motion.div>

        {/* ── Stats Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Tile 1 — Total Candidates */}
          <div className="bento-tile space-y-1">
            <p className="section-label">TOTAL CANDIDATES</p>
            <p
              className="stat-number text-5xl text-foreground"
              style={{
                filter:
                  candidates.length > 0
                    ? "drop-shadow(0 0 10px hsl(var(--primary)/0.5))"
                    : undefined,
              }}
            >
              {candidates.length}
            </p>
            <p className="text-muted-foreground text-xs">
              open to work:{" "}
              <span className="text-accent font-semibold">
                {openToCandidates}
              </span>
            </p>
          </div>

          {/* Tile 2 — Refresh */}
          <div className="bento-tile flex items-center justify-center">
            <button
              onClick={handleRefresh}
              disabled={candidatesQuery.isFetching}
              className="btn-neon-cyan w-full flex items-center justify-center gap-2 py-3"
            >
              <RefreshCw
                className={`w-5 h-5 ${candidatesQuery.isFetching ? "animate-spin" : ""}`}
              />
              {candidatesQuery.isFetching
                ? "Refreshing..."
                : "Refresh Candidates"}
            </button>
          </div>

          {/* Tile 3 — Filter toggle */}
          <div className="bento-tile flex items-center justify-center">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="btn-ghost-cyber w-full flex items-center justify-center gap-2 py-3 relative"
            >
              <Filter className="w-5 h-5" />
              Filters
              {activeFilterCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                  style={{
                    background: "hsl(var(--primary))",
                    boxShadow: "0 0 8px hsl(var(--primary)/0.7)",
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* ── Filter Panel ── */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div
              key="filter-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="bento-tile border-primary/20 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="section-label">FILTER OPTIONS</p>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="btn-ghost-cyber p-1.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Skills */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="section-label">
                      Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={draftSkills}
                      onChange={(e) => setDraftSkills(e.target.value)}
                      placeholder="React, TypeScript, Python"
                      className="cyber-input"
                    />
                  </div>

                  {/* Min Experience */}
                  <div className="space-y-1.5">
                    <label className="section-label">Min Experience (yrs)</label>
                    <input
                      type="number"
                      value={draftMinExperience}
                      onChange={(e) => setDraftMinExperience(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="cyber-input"
                    />
                  </div>

                  {/* Open to work checkbox */}
                  <div className="flex flex-col justify-end space-y-1.5">
                    <label className="section-label">Availability</label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                          draftOpenOnly
                            ? "border-primary bg-primary"
                            : "border-border bg-transparent"
                        }`}
                        style={
                          draftOpenOnly
                            ? { boxShadow: "0 0 8px hsl(var(--primary)/0.5)" }
                            : {}
                        }
                        onClick={() => setDraftOpenOnly(!draftOpenOnly)}
                      >
                        {draftOpenOnly && (
                          <svg
                            width="10"
                            height="8"
                            viewBox="0 0 10 8"
                            fill="none"
                          >
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
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={draftOpenOnly}
                        onChange={(e) => setDraftOpenOnly(e.target.checked)}
                      />
                      <span className="text-sm text-foreground">
                        Open to work only
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleApplyFilters}
                  className="btn-neon-purple flex items-center gap-2"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error State ── */}
        {candidatesQuery.error && (
          <div className="bento-tile border-destructive/30">
            <p
              className="text-sm"
              style={{ color: "hsl(var(--destructive))" }}
            >
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
              className="w-12 h-12 text-muted-foreground/40"
              style={{
                filter: "drop-shadow(0 0 8px hsl(var(--primary)/0.2))",
              }}
            />
            <p className="section-label">No candidates found for your filters</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search parameters.
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
                  className="bento-tile space-y-4"
                >
                  {/* Header row */}
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
                        {candidate.currentTitle ?? "Role not specified"}
                      </p>
                    </div>
                    {/* Open to work badge */}
                    <div className="ml-auto flex-shrink-0">
                      {candidate.openToWork ? (
                        <span className="cyber-badge-green">OPEN</span>
                      ) : (
                        <span className="cyber-badge">NOT OPEN</span>
                      )}
                    </div>
                  </div>

                  {/* Stats row */}
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
                      <span className="text-muted-foreground text-xs">yrs</span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    {candidate.resumeId ? (
                      <span className="cyber-badge-green">Uploaded</span>
                    ) : (
                      <span className="section-label">No resume</span>
                    )}
                  </div>

                  {/* Skills */}
                  {(candidate.skills ?? []).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {(candidate.skills ?? []).slice(0, 6).map((skill) => (
                        <span
                          key={`${candidate.uid}-${skill}`}
                          className="cyber-badge"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="section-label">No skills listed</p>
                  )}

                  {/* View Profile link */}
                  <div className="pt-1">
                    <Link
                      to="/candidates"
                      className="text-secondary text-sm font-medium hover:underline flex items-center gap-1 transition-opacity hover:opacity-80"
                    >
                      View Profile
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ── Pagination ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between pt-2"
        >
          <button
            onClick={handlePrevious}
            disabled={filters.page <= 1}
            className="btn-ghost-cyber flex items-center gap-2 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <p className="section-label">
            Page {filters.page} · {filters.limit} per page
          </p>

          <button
            onClick={handleNext}
            disabled={candidates.length < filters.limit}
            className="btn-ghost-cyber flex items-center gap-2 disabled:opacity-40"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AppShell>
  );
}
