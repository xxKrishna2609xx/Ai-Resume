import { Upload, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toNavUserRole } from "@/lib/routes";

interface MobileActionBarProps {
  isAuthenticated?: boolean;
  userRole?: "seeker" | "company";
}

export function MobileActionBar({
  isAuthenticated,
  userRole,
}: MobileActionBarProps) {
  const { isAuthenticated: sessionAuthenticated, profile } = useAuth();
  const resolvedAuth = isAuthenticated ?? sessionAuthenticated;
  const resolvedRole = userRole ?? toNavUserRole(profile?.role);

  if (!resolvedAuth) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden bg-card border-t border-border">
      <div className="flex items-center justify-around px-4 py-3 gap-2">
        {resolvedRole === "seeker" ? (
          <>
            <Link
              to="/analyzer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:shadow-lg transition-shadow text-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Resume</span>
            </Link>
            <Link
              to="/jobs"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-secondary text-white font-semibold hover:shadow-lg transition-shadow text-sm"
            >
              <Search className="w-4 h-4" />
              <span>Find Jobs</span>
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/candidates"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-secondary text-white font-semibold hover:shadow-lg transition-shadow text-sm"
            >
              <Search className="w-4 h-4" />
              <span>Find Candidates</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
