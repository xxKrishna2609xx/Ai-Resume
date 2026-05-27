import { Link, useLocation } from "react-router-dom";
import { Menu, Zap, LogOut, LayoutDashboard, Upload, Search, Users, Building2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toNavUserRole, getHomeRouteByRole } from "@/lib/routes";
import { CyberSidebar } from "./CyberSidebar";

interface AppShellProps {
  children: React.ReactNode;
}

/** Layout wrapper for all authenticated pages.
 *  Desktop: fixed 240px left sidebar + scrollable main content.
 *  Mobile:  top header + scrollable content + bottom tab nav.
 */
export function AppShell({ children }: AppShellProps) {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const role = toNavUserRole(profile?.role);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const seekerLinks = [
    { label: "Dashboard", href: "/dashboard",  icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Analyzer",  href: "/analyzer",   icon: <Upload className="w-5 h-5" /> },
    { label: "Jobs",      href: "/jobs",         icon: <Search className="w-5 h-5" /> },
  ];
  const companyLinks = [
    { label: "Dashboard",  href: "/dashboard/company", icon: <Building2 className="w-5 h-5" /> },
    { label: "Candidates", href: "/candidates",          icon: <Users className="w-5 h-5" /> },
  ];
  const navLinks = role === "company" ? companyLinks : seekerLinks;
  const displayName = profile?.displayName ?? profile?.companyName ?? profile?.email ?? "User";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Desktop Sidebar ── */}
      <div className="hidden md:flex flex-shrink-0">
        <CyberSidebar />
      </div>

      {/* ── Right side ── */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border flex-shrink-0"
          style={{ background: "hsl(var(--sidebar-background))" }}>
          <Link to={getHomeRouteByRole(profile?.role)} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center glow-purple"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(268 80% 45%) 100%)" }}>
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
              RESUME <span style={{ color: "hsl(var(--primary))" }}>AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)" }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg btn-ghost-cyber">
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile slide-down menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div key="mobile-menu"
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="md:hidden border-b border-border overflow-hidden flex-shrink-0"
              style={{ background: "hsl(var(--sidebar-background))" }}>
              <nav className="px-4 py-3 space-y-1">
                {navLinks.map((link) => (
                  <Link key={link.href} to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`sidebar-link ${location.pathname === link.href ? "active" : ""}`}>
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
                <button onClick={() => logout()}
                  className="sidebar-link w-full text-destructive hover:text-destructive hover:bg-destructive/10 mt-2">
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="md:hidden flex items-center border-t border-border flex-shrink-0"
          style={{ background: "hsl(var(--sidebar-background))" }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href ||
              (link.href !== "/" && location.pathname.startsWith(link.href));
            return (
              <Link key={link.href} to={link.href}
                className="flex-1 flex flex-col items-center gap-1 py-3 transition-all duration-200 relative"
                style={{ color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}>
                {isActive && (
                  <motion.div layoutId="tab-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary"
                    style={{ boxShadow: "0 0 8px hsl(var(--primary))" }} />
                )}
                {link.icon}
                <span className="text-xs font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
