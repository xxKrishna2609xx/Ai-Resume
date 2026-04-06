import { TopNav } from "@/components/TopNav";
import { MobileActionBar } from "@/components/MobileActionBar";
import { Link } from "react-router-dom";
import { Upload, Briefcase, Star, ToggleRight } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const [openToWork, setOpenToWork] = useState(true);

  return (
    <>
      <TopNav isAuthenticated userName="John Doe" userRole="seeker" />
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Welcome section */}
          <div className="mb-12 fade-in">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-2">
              Welcome back, John! 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              Let's find your next great opportunity
            </p>
          </div>

          {/* Status bar with Open to Work toggle */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-foreground mb-1">Profile Status</h2>
              <p className="text-sm text-muted-foreground">
                {openToWork
                  ? "✨ You're visible to employers"
                  : "🔒 Your profile is hidden from employers"}
              </p>
            </div>
            <button
              onClick={() => setOpenToWork(!openToWork)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all ${
                openToWork
                  ? "bg-primary text-white hover:shadow-lg hover:shadow-primary/30"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              <ToggleRight className="w-5 h-5" />
              Open to Work
            </button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Resume stats */}
            <div className="slide-up bg-card rounded-2xl border border-border p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  Latest
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Resume Score</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Last updated 2 days ago
              </p>
              <div className="text-4xl font-bold text-primary mb-2">8.5/10</div>
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div className="bg-gradient-to-r from-primary to-primary/60 h-2 rounded-full" style={{ width: "85%" }} />
              </div>
              <Link
                to="/analyzer"
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                View detailed analysis →
              </Link>
            </div>

            {/* Matches stats */}
            <div className="slide-up bg-card rounded-2xl border border-border p-8 hover:shadow-lg transition-shadow" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-secondary" />
                </div>
                <span className="px-3 py-1 rounded-full bg-secondary/10 text-xs font-semibold text-secondary">
                  This week
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Job Matches</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Based on your profile
              </p>
              <div className="text-4xl font-bold text-secondary mb-2">24</div>
              <p className="text-xs text-muted-foreground mb-4">
                +8 new matches since yesterday
              </p>
              <Link
                to="/jobs"
                className="text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors"
              >
                Explore matches →
              </Link>
            </div>
          </div>

          {/* Action cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Upload resume card */}
            <Link
              to="/analyzer"
              className="slide-up group bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8 hover:shadow-lg hover:border-primary/40 transition-all cursor-pointer"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Upload Resume</h3>
              <p className="text-sm text-muted-foreground">
                Keep your resume fresh with the latest version
              </p>
              <div className="mt-6 text-sm font-semibold text-primary group-hover:gap-2 flex items-center gap-1 transition-all">
                Get Started <span>→</span>
              </div>
            </Link>

            {/* Find jobs card */}
            <Link
              to="/jobs"
              className="slide-up group bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 rounded-2xl p-8 hover:shadow-lg hover:border-secondary/40 transition-all cursor-pointer"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Find Jobs</h3>
              <p className="text-sm text-muted-foreground">
                Browse and match with positions tailored for you
              </p>
              <div className="mt-6 text-sm font-semibold text-secondary group-hover:gap-2 flex items-center gap-1 transition-all">
                Explore <span>→</span>
              </div>
            </Link>

            {/* View profile card */}
            <div
              className="slide-up group bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-2xl p-8 hover:shadow-lg hover:border-accent/40 transition-all cursor-pointer"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Viewed Profile</h3>
              <p className="text-sm text-muted-foreground">
                See how recruiters view your profile
              </p>
              <div className="mt-6 text-sm font-semibold text-accent">
                Coming soon
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileActionBar isAuthenticated userRole="seeker" />
    </>
  );
}
