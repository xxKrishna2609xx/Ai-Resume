import { TopNav } from "@/components/TopNav";
import { MobileActionBar } from "@/components/MobileActionBar";
import { Search, Users } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchCandidates } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

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
    <>
      <TopNav />
      <div className="min-h-screen bg-gradient-subtle px-4 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto py-10 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-secondary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Find Candidates</h1>
            <p className="text-lg text-muted-foreground">Search job seekers by skill, experience, and availability.</p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border grid md:grid-cols-4 gap-4">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-foreground">Skills (comma separated)</span>
              <input
                type="text"
                value={skills}
                onChange={(event) => setSkills(event.target.value)}
                placeholder="React, Python, AWS"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-foreground">Min experience</span>
              <input
                type="number"
                min={0}
                value={experience}
                onChange={(event) => setExperience(event.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                placeholder="2"
              />
            </label>

            <div className="space-y-2">
              <span className="text-sm font-semibold text-foreground">Status</span>
              <label className="flex items-center gap-2 text-sm text-foreground h-10">
                <input
                  type="checkbox"
                  checked={openOnly}
                  onChange={(event) => setOpenOnly(event.target.checked)}
                />
                Open to work only
              </label>
            </div>

            <div className="md:col-span-4 flex items-center gap-3">
              <button
                type="button"
                onClick={applyFilters}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
              >
                <Search className="w-4 h-4" />
                Search Candidates
              </button>

              <p className="text-sm text-muted-foreground">
                {candidatesQuery.isFetching
                  ? "Loading candidates..."
                  : `${candidates.length} candidate(s) found`}
              </p>
            </div>
          </div>

          {candidatesQuery.error ? (
            <div className="bg-card rounded-2xl p-6 border border-border">
              <p className="text-sm text-destructive">
                {candidatesQuery.error instanceof Error
                  ? candidatesQuery.error.message
                  : "Could not load candidates"}
              </p>
            </div>
          ) : null}

          {candidates.length === 0 && !candidatesQuery.isLoading ? (
            <div className="bg-card rounded-2xl p-6 border border-border">
              <p className="text-sm text-muted-foreground">No candidates match the current filters.</p>
            </div>
          ) : null}

          <div className="grid md:grid-cols-2 gap-4">
            {candidates.map((candidate) => (
              <div key={candidate.uid} className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{candidate.displayName ?? "Unnamed candidate"}</h2>
                  <p className="text-sm text-muted-foreground">{candidate.currentTitle ?? "Role not provided"}</p>
                </div>

                <div className="text-sm text-foreground space-y-1">
                  <p>Experience: {candidate.experienceYears ?? 0} years</p>
                  <p>Status: {candidate.openToWork ? "Open to work" : "Not open"}</p>
                  <p>Resume: {candidate.resumeId ? "Uploaded" : "Not uploaded"}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(candidate.skills ?? []).length > 0 ? (
                    candidate.skills?.map((skill) => (
                      <span
                        key={`${candidate.uid}-${skill}`}
                        className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No skills listed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <MobileActionBar />
    </>
  );
}
