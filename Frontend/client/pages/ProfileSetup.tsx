import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { createOrUpdateProfile } from "@/lib/api";
import { writeProfileCache } from "@/lib/profileCache";
import { getHomeRouteByRole } from "@/lib/routes";
import type { UserRole } from "@shared/api";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { profile, getIdToken, refreshProfile } = useAuth();
  const [role, setRole] = useState<UserRole>("job_seeker");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [currentTitle, setCurrentTitle] = useState(profile?.currentTitle ?? "");
  const [experienceYears, setExperienceYears] = useState(profile?.experienceYears ?? 0);
  const [skills, setSkills] = useState((profile?.skills ?? []).join(", "));

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center px-4">
      <div className="max-w-3xl w-full py-8">
        <div className="text-center space-y-6 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Complete Your Profile</h1>
          <p className="text-lg text-muted-foreground">
            Choose your role and save your profile details to unlock your dashboard.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Job Seeker Option */}
          <button
            type="button"
            onClick={() => setRole("job_seeker")}
            className={`text-left bg-card rounded-2xl border-2 p-8 hover:shadow-lg transition-all cursor-pointer group ${
              role === "job_seeker"
                ? "border-primary"
                : "border-primary/20 hover:border-primary/40"
            }`}
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
              <span className="text-2xl">JS</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Job Seeker</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Looking for your next opportunity? Upload your resume and get matched with perfect jobs.
            </p>
            <div className="text-xs text-primary font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
              Continue <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Company Option */}
          <button
            type="button"
            onClick={() => setRole("company")}
            className={`text-left bg-card rounded-2xl border-2 p-8 hover:shadow-lg transition-all cursor-pointer group ${
              role === "company"
                ? "border-secondary"
                : "border-secondary/20 hover:border-secondary/40"
            }`}
          >
            <div className="w-12 h-12 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 flex items-center justify-center mb-4 transition-colors">
              <span className="text-2xl">CO</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Company / Recruiter</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Hiring? Find the best candidates from our talent pool with AI-powered matching.
            </p>
            <div className="text-xs text-secondary font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
              Continue <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-foreground">Display Name</span>
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              />
            </label>

            {role === "job_seeker" ? (
              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">Current Title</span>
                <input
                  type="text"
                  value={currentTitle}
                  onChange={(event) => setCurrentTitle(event.target.value)}
                  placeholder="Software Engineer"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </label>
            ) : (
              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">Company Name</span>
                <input
                  type="text"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  placeholder="Acme Corp"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </label>
            )}
          </div>

          {role === "job_seeker" ? (
            <div className="grid md:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">Experience (Years)</span>
                <input
                  type="number"
                  min={0}
                  value={experienceYears}
                  onChange={(event) => setExperienceYears(Number(event.target.value || 0))}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">Skills (comma separated)</span>
                <input
                  type="text"
                  value={skills}
                  onChange={(event) => setSkills(event.target.value)}
                  placeholder="React, TypeScript, Python"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </label>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">Industry</span>
                <input
                  type="text"
                  value={industry}
                  onChange={(event) => setIndustry(event.target.value)}
                  placeholder="SaaS, Healthcare, Finance"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">Company Size</span>
                <select
                  value={companySize}
                  onChange={(event) => setCompanySize(event.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-1000">201-1000</option>
                  <option value="1000+">1000+</option>
                </select>
              </label>
            </div>
          )}

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}

          <button
            type="button"
            onClick={submitProfile}
            disabled={isSaving}
            className="w-full md:w-auto px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:shadow-lg transition-shadow disabled:opacity-60"
          >
            {isSaving ? "Saving profile..." : "Save and continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
