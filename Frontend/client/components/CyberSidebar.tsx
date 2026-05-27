import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toNavUserRole } from "@/lib/routes";
import { getHomeRouteByRole } from "@/lib/routes";
import {
  LayoutDashboard,
  Upload,
  Search,
  Users,
  LogOut,
  Zap,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";

interface NavLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function CyberSidebar() {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const role = toNavUserRole(profile?.role);

  const seekerLinks: NavLink[] = [
    { label: "Dashboard",  href: "/dashboard",  icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Analyzer",   href: "/analyzer",   icon: <Upload className="w-4 h-4" /> },
    { label: "Find Jobs",  href: "/jobs",        icon: <Search className="w-4 h-4" /> },
  ];

  const companyLinks: NavLink[] = [
    { label: "Dashboard",   href: "/dashboard/company", icon: <Building2 className="w-4 h-4" /> },
    { label: "Candidates",  href: "/candidates",         icon: <Users className="w-4 h-4" /> },
  ];

  const navLinks = role === "company" ? companyLinks : seekerLinks;
  const displayName =
    profile?.displayName ?? profile?.companyName ?? profile?.email ?? "User";

  return (
    <aside className="flex flex-col h-full w-60 border-r border-border"
      style={{ background: "hsl(var(--sidebar-background))" }}>

      {/* ── Brand ── */}
      <div className="px-5 py-5 border-b border-border">
        <Link to={getHomeRouteByRole(profile?.role)} className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 glow-purple"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(268 80% 45%) 100%)" }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              RESUME
            </p>
            <p className="text-xs font-semibold" style={{ color: "hsl(var(--primary))", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.12em" }}>
              AI
            </p>
          </div>
        </Link>
      </div>

      {/* ── Nav Links ── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="section-label px-3 mb-3">Navigation</p>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.href ||
            (link.href !== "/" && location.pathname.startsWith(link.href));
          return (
            <Link key={link.href} to={link.href}
              className={`sidebar-link ${isActive ? "active" : ""}`}>
              {link.icon}
              <span>{link.label}</span>
              {isActive && (
                <motion.div layoutId="active-pill"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                  style={{ boxShadow: "0 0 6px hsl(var(--primary))" }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Role Badge ── */}
      <div className="px-4 py-3 mx-3 mb-2 rounded-lg border border-border"
        style={{ background: "hsl(var(--primary) / 0.06)" }}>
        <p className="section-label mb-1">Role</p>
        <p className="text-xs font-semibold text-primary">
          {role === "company" ? "Company / Recruiter" : "Job Seeker"}
        </p>
      </div>

      {/* ── User & Logout ── */}
      <div className="px-3 py-3 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)" }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email ?? ""}</p>
          </div>
        </div>
        <button onClick={() => logout()}
          className="sidebar-link w-full text-destructive hover:text-destructive hover:bg-destructive/10 mt-1">
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
