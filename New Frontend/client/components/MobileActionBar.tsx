import { Upload, Search } from "lucide-react";
import { Link } from "react-router-dom";

interface MobileActionBarProps {
  isAuthenticated?: boolean;
  userRole?: "seeker" | "company";
}

export function MobileActionBar({
  isAuthenticated = false,
  userRole = "seeker",
}: MobileActionBarProps) {
  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden bg-card border-t border-border">
      <div className="flex items-center justify-around px-4 py-3 gap-2">
        {userRole === "seeker" ? (
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
