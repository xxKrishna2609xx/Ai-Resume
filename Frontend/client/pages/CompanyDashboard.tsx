import { TopNav } from "@/components/TopNav";
import { MobileActionBar } from "@/components/MobileActionBar";
import { Link } from "react-router-dom";
import { RefreshCw, Filter, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchCandidates } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface CandidateFilters {
  skills: string;
  minExperience?: number;
  openToWorkOnly: boolean;
  limit: number;
  // Fix #11: Added real page field for proper pagination
  page: number;
}

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

  const handleApplyFilters = () => {
    setFilters((previous) => ({
      ...previous,
      skills: draftSkills.trim(),
      minExperience: draftMinExperience ? Number(draftMinExperience) : undefined,
      openToWorkOnly: draftOpenOnly,
    }));
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
    setFilters((previous) => ({ ...previous, page: Math.max(1, previous.page - 1) }));
  };

  return (
    <>
      <TopNav />
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-8 fade-in">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-2">Find Your Next Hire</h1>
            <p className="text-lg text-muted-foreground">Browse and connect with top talent from your live candidate pool</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-card rounded-xl border border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Candidates</p>
              <h3 className="text-3xl font-bold text-foreground">{candidates.length}</h3>
              <p className="text-xs text-muted-foreground mt-2">{openToCandidates} open to work</p>
            </div>

            <div className="flex items-center justify-center">
              <button
                onClick={handleRefresh}
                disabled={candidatesQuery.isFetching}
                className="w-full px-6 py-3 rounded-xl bg-secondary text-white font-semibold hover:shadow-lg hover:shadow-secondary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-5 h-5 ${candidatesQuery.isFetching ? "animate-spin" : ""}`} />
                {candidatesQuery.isFetching ? "Refreshing..." : "Refresh Candidates"}
              </button>
            </div>

            <div className="flex items-center justify-center">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="w-full px-6 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-semibold hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
            </div>
          </div>

          {filterOpen && (
            <div className="bg-card rounded-xl border border-border p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={draftSkills}
                    onChange={(event) => setDraftSkills(event.target.value)}
                    placeholder="React, TypeScript"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Min Experience (years)</label>
                  <input
                    type="number"
                    value={draftMinExperience}
                    onChange={(event) => setDraftMinExperience(event.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded"
                      checked={draftOpenOnly}
                      onChange={(event) => setDraftOpenOnly(event.target.checked)}
                    />
                    <span className="text-sm font-medium text-foreground">Open to work only</span>
                  </label>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    onClick={handleApplyFilters}
                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:shadow-lg transition-shadow text-sm"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase">Title</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase">Experience</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase">Skills</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase">Resume</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate, index) => (
                    <tr
                      key={candidate.uid}
                      className={`border-b border-border hover:bg-muted/50 transition-colors ${
                        index % 2 === 0 ? "bg-muted/30" : "bg-muted/10"
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-foreground">{candidate.displayName ?? "Unnamed candidate"}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{candidate.currentTitle ?? "Not specified"}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{candidate.experienceYears ?? 0} yrs</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {(candidate.skills ?? []).slice(0, 6).map((skill) => (
                            <span
                              key={`${candidate.uid}-${skill}`}
                              className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 text-xs font-semibold ${
                            candidate.resumeId ? "text-green-600" : "text-muted-foreground"
                          }`}
                        >
                          {candidate.resumeId ? "Uploaded" : "No resume"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            candidate.openToWork
                              ? "bg-green-100 text-green-700"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {candidate.openToWork ? "Open" : "Not Open"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to="/candidates"
                          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {candidatesQuery.error ? (
              <div className="px-6 py-4 border-t border-border">
                <p className="text-sm text-destructive">
                  {candidatesQuery.error instanceof Error
                    ? candidatesQuery.error.message
                    : "Could not load candidates"}
                </p>
              </div>
            ) : null}

            {candidates.length === 0 && !candidatesQuery.isLoading ? (
              <div className="px-6 py-8 text-center text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-3" />
                No candidates found for your filters.
              </div>
            ) : null}

            <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/20">
              <p className="text-sm text-muted-foreground">
                Page {filters.page} — showing up to {filters.limit} candidates
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm font-medium"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileActionBar />
    </>
  );
}
