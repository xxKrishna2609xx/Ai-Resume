import { TopNav } from "@/components/TopNav";
import { MobileActionBar } from "@/components/MobileActionBar";
import { Link } from "react-router-dom";
import { RefreshCw, Filter, Users } from "lucide-react";
import { useState } from "react";

// Mock candidate data
const mockCandidates = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Senior Software Engineer",
    experience: 7,
    skills: ["React", "Node.js", "TypeScript"],
    resumeUploaded: true,
    openToWork: true,
  },
  {
    id: 2,
    name: "Marcus Johnson",
    title: "Full Stack Developer",
    experience: 4,
    skills: ["Vue.js", "Python", "PostgreSQL"],
    resumeUploaded: true,
    openToWork: true,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    title: "Product Designer",
    experience: 5,
    skills: ["UI/UX", "Figma", "User Research"],
    resumeUploaded: true,
    openToWork: false,
  },
  {
    id: 4,
    name: "David Park",
    title: "DevOps Engineer",
    experience: 6,
    skills: ["Kubernetes", "AWS", "Docker"],
    resumeUploaded: true,
    openToWork: true,
  },
  {
    id: 5,
    name: "Jessica Brown",
    title: "Data Scientist",
    experience: 3,
    skills: ["Python", "ML", "TensorFlow"],
    resumeUploaded: false,
    openToWork: true,
  },
];

export default function CompanyDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [candidates, setCandidates] = useState(mockCandidates);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const openToCandidates = candidates.filter((c) => c.openToWork);

  return (
    <>
      <TopNav isAuthenticated userName="Acme Corp" userRole="company" />
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Welcome section */}
          <div className="mb-8 fade-in">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-2">
              Find Your Next Hire 🎯
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse and connect with top talent
            </p>
          </div>

          {/* Stats and controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Total candidates card */}
            <div className="bg-card rounded-xl border border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Candidates</p>
              <h3 className="text-3xl font-bold text-foreground">{candidates.length}</h3>
              <p className="text-xs text-muted-foreground mt-2">
                {openToCandidates.length} open to work
              </p>
            </div>

            {/* Refresh button */}
            <div className="flex items-center justify-center">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full px-6 py-3 rounded-xl bg-secondary text-white font-semibold hover:shadow-lg hover:shadow-secondary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Refreshing..." : "Refresh Candidates"}
              </button>
            </div>

            {/* Filter toggle */}
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

          {/* Filter panel */}
          {filterOpen && (
            <div className="bg-card rounded-xl border border-border p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="React, TypeScript..."
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Min Experience (years)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 rounded" defaultChecked />
                    <span className="text-sm font-medium text-foreground">
                      Open to work only
                    </span>
                  </label>
                </div>
                <div className="flex items-end gap-2">
                  <button className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:shadow-lg transition-shadow text-sm">
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Candidates table/grid */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase">
                      Experience
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase">
                      Skills
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase">
                      Resume
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate, index) => (
                    <tr
                      key={candidate.id}
                      className={`border-b border-border hover:bg-muted/50 transition-colors ${
                        index % 2 === 0 ? "bg-muted/30" : "bg-muted/10"
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        {candidate.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {candidate.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {candidate.experience} yrs
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills.map((skill) => (
                            <span
                              key={skill}
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
                            candidate.resumeUploaded
                              ? "text-green-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {candidate.resumeUploaded ? "✓ Uploaded" : "- No resume"}
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
                        <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/20">
              <p className="text-sm text-muted-foreground">
                Showing {candidates.length} candidates
              </p>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm font-medium">
                  Previous
                </button>
                <button className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm font-medium">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileActionBar isAuthenticated userRole="company" />
    </>
  );
}
