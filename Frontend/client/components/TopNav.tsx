import { Link } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getHomeRouteByRole, toNavUserRole } from "@/lib/routes";

import { BackendStatusBadge } from "@/components/BackendStatusBadge";

interface TopNavProps {
  isAuthenticated?: boolean;
  userName?: string;
  userRole?: "seeker" | "company";
  onLogout?: () => void | Promise<void>;
}

export function TopNav({
  isAuthenticated,
  userName,
  userRole,
  onLogout,
}: TopNavProps) {
  const { profile, isAuthenticated: sessionAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const resolvedIsAuthenticated = isAuthenticated ?? sessionAuthenticated;
  const resolvedRole = userRole ?? toNavUserRole(profile?.role);
  const resolvedName =
    userName ??
    profile?.displayName ??
    profile?.companyName ??
    profile?.email ??
    "User";

  const navLinks =
    resolvedRole === "company"
      ? [
          { label: "Dashboard", href: "/dashboard/company" },
          { label: "Candidates", href: "/candidates" },
        ]
      : [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Find Jobs", href: "/jobs" },
          { label: "Analyzer", href: "/analyzer" },
        ];

  const roleColor =
    resolvedRole === "seeker"
      ? "bg-primary/10 text-primary"
      : "bg-secondary/10 text-secondary";

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link
            to={resolvedIsAuthenticated ? getHomeRouteByRole(profile?.role) : "/"}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:block group-hover:text-primary transition-colors">
              Matchify
            </span>
          </Link>

          {/* Desktop nav links */}
          {resolvedIsAuthenticated && (
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
          <div className="flex items-center gap-3">
            <BackendStatusBadge />
            {resolvedIsAuthenticated ? (
              <>
                {/* Role badge */}
                <div className={`hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-semibold ${roleColor}`}>
                  {resolvedRole === "seeker" ? "Job Seeker" : "Company"}
                </div>

                {/* User avatar and menu */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold cursor-pointer hover:shadow-lg transition-shadow">
                    {resolvedName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-foreground">{resolvedName}</p>
                    <p className="text-xs text-muted-foreground">
                      {resolvedRole === "seeker" ? "Job Seeker" : "Recruiter"}
                    </p>
                  </div>
                </div>

                {/* Logout button */}
                <button
                  onClick={async () => {
                    if (onLogout) {
                      onLogout();
                      return;
                    }
                    await logout();
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : null}

            {/* Mobile menu toggle */}
            {resolvedIsAuthenticated && (
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
        {resolvedIsAuthenticated && mobileMenuOpen && (
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
              {resolvedRole === "seeker" ? "Job Seeker" : "Company"}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
