import { Navigate, useLocation } from "react-router-dom";
import type { UserRole } from "@shared/api";
import { useAuth } from "@/contexts/AuthContext";
import { getHomeRouteByRole } from "@/lib/routes";

function FullPageMessage({ text }: { text: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle px-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const { isAuthenticated, isLoading, profile } = useAuth();

  if (isLoading) return <FullPageMessage text="Checking your session..." />;

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }

  if (profile?.needsProfileSetup && location.pathname !== "/profile-setup") {
    return <Navigate to="/profile-setup" replace />;
  }

  return children;
}

export function RoleRoute({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles: UserRole[];
}) {
  const { profile, isLoading } = useAuth();

  if (isLoading) return <FullPageMessage text="Loading your workspace..." />;

  if (profile?.needsProfileSetup) {
    return <Navigate to="/profile-setup" replace />;
  }

  if (!profile?.role || !allowedRoles.includes(profile.role)) {
    return <Navigate to={getHomeRouteByRole(profile?.role)} replace />;
  }

  return children;
}
