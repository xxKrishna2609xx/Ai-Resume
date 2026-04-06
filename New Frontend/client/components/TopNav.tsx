import { Link } from "react-router-dom";
import { Menu, X, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface TopNavProps {
  isAuthenticated?: boolean;
  userName?: string;
  userRole?: "seeker" | "company";
  onLogout?: () => void;
}

export function TopNav({
  isAuthenticated = false,
  userName = "User",
  userRole = "seeker",
  onLogout = () => {},
}: TopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    {
      label: userRole === "seeker" ? "Find Jobs" : "Candidates",
      href: userRole === "seeker" ? "/jobs" : "/candidates",
    },
    { label: "Analyzer", href: "/analyzer" },
  ];

  const roleColor = userRole === "seeker" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary";

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:block group-hover:text-primary transition-colors">
              Matchify
            </span>
          </Link>

          {/* Desktop nav links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* User menu and auth */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Role badge */}
                <div className={`hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-semibold ${roleColor}`}>
                  {userRole === "seeker" ? "Job Seeker" : "Company"}
                </div>

                {/* User avatar and menu */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold cursor-pointer hover:shadow-lg transition-shadow">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-foreground">{userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {userRole === "seeker" ? "Job Seeker" : "Recruiter"}
                    </p>
                  </div>
                </div>

                {/* Logout button */}
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : null}

            {/* Mobile menu toggle */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className={`px-4 py-2 rounded-lg text-xs font-semibold ${roleColor} w-fit`}>
              {userRole === "seeker" ? "Job Seeker" : "Company"}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
