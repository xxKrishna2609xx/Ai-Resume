import { Zap, Search, Shield, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getHomeRouteByRole } from "@/lib/routes";
import { motion } from "framer-motion";

// ─── Animation Variants ──────────────────────────────────────────────────────
const leftVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const leftItem = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};
const cardVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.2 } },
};
const cardItem = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: "easeOut" as const } },
};

// ─── Feature bullets data ─────────────────────────────────────────────────────
const features = [
  {
    icon: Zap,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    title: "AI-Powered Analysis",
    desc: "Resume scored and analyzed in seconds",
  },
  {
    icon: Search,
    color: "text-secondary",
    bg: "bg-secondary/10",
    border: "border-secondary/20",
    title: "Smart Job Matching",
    desc: "Jobs ranked by your skills and experience",
  },
  {
    icon: Shield,
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
    title: "Secure & Private",
    desc: "Your data stays yours",
  },
];

// ─── Preview cards data ────────────────────────────────────────────────────────
const previewCards = [
  {
    icon: Upload,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    glowBorder: "glow-border-purple",
    title: "Smart Resume Analysis",
    stat: "8.4",
    statLabel: "/ 10",
    statColor: "text-primary",
    extra: null,
    delay: "0s",
  },
  {
    icon: Search,
    iconColor: "text-secondary",
    iconBg: "bg-secondary/10",
    glowBorder: "glow-border-cyan",
    title: "87% Match Found",
    stat: null,
    statLabel: null,
    statColor: "text-secondary",
    badges: ["React", "TypeScript", "Node.js"],
    delay: "0.8s",
  },
  {
    icon: Zap,
    iconColor: "text-accent",
    iconBg: "bg-accent/10",
    glowBorder: "",
    title: "247 New Jobs",
    stat: "247",
    statLabel: null,
    statColor: "text-accent",
    sub: "This week",
    delay: "1.6s",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, profile, signInWithGoogle, refreshProfile } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    if (profile?.needsProfileSetup) {
      navigate("/profile-setup", { replace: true });
      return;
    }

    navigate(getHomeRouteByRole(profile?.role), { replace: true });
  }, [isAuthenticated, isLoading, navigate, profile]);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
      const latestProfile = await refreshProfile();

      if (latestProfile?.needsProfileSetup) {
        navigate("/profile-setup", { replace: true });
        return;
      }

      navigate(getHomeRouteByRole(latestProfile?.role), { replace: true });
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background overflow-hidden flex flex-col">
      {/* ── Background pattern ── */}
      <div
        className="bg-grid absolute inset-0 opacity-[0.03] pointer-events-none"
        aria-hidden="true"
      />

      {/* ── Atmospheric glow orbs ── */}
      <div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.18) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--secondary) / 0.14) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--accent) / 0.10) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        aria-hidden="true"
      />

      {/* ── Main layout ── */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* ════════════════ LEFT SIDE ════════════════ */}
        <motion.div
          className="flex-1 flex flex-col justify-center items-center lg:items-start px-6 py-12 sm:px-10 md:px-16 lg:py-0"
          variants={leftVariants}
          initial="hidden"
          animate="show"
        >
          <div className="max-w-xl w-full space-y-8">
            {/* Brand */}
            <motion.div variants={leftItem} className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-primary/10 border border-primary/30">
                <Zap className="w-5 h-5 text-primary" />
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    boxShadow: "0 0 16px hsl(var(--primary) / 0.5)",
                  }}
                />
              </div>
              <span
                className="font-mono text-base font-bold tracking-[0.2em] text-foreground"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                RESUME<span className="text-primary"> AI</span>
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div variants={leftItem} className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-foreground">
                Your{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Perfect Match
                </span>{" "}
                Awaits
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Connect with opportunities tailored to your skills. For job seekers and companies
                alike — find your ideal match with AI-powered intelligence.
              </p>
            </motion.div>

            {/* Feature bullets */}
            <motion.div variants={leftItem} className="space-y-4 pt-2">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="flex items-start gap-4">
                    <div
                      className={`mt-0.5 flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg ${f.bg} border ${f.border}`}
                    >
                      <Icon className={`w-4 h-4 ${f.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{f.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* CTA */}
            <motion.div variants={leftItem} className="space-y-3 pt-2">
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn || isLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-white text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.75) 100%)",
                  boxShadow: isSigningIn || isLoading
                    ? "none"
                    : "0 0 28px hsl(var(--primary) / 0.4), 0 4px 20px hsl(var(--primary) / 0.25)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 40px hsl(var(--primary) / 0.65), 0 4px 28px hsl(var(--primary) / 0.4)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 28px hsl(var(--primary) / 0.4), 0 4px 20px hsl(var(--primary) / 0.25)";
                }}
              >
                {isSigningIn || isLoading ? (
                  <>
                    {/* Spinner */}
                    <svg
                      className="w-5 h-5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Connecting…
                  </>
                ) : (
                  <>
                    {/* Google Icon */}
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
              <p
                className="text-xs text-muted-foreground"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Choose your role after sign in — Job Seeker or Company
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* ════════════════ RIGHT SIDE ════════════════ */}
        <div className="flex-1 hidden lg:flex items-center justify-center px-8 py-16">
          <motion.div
            className="relative w-full max-w-sm space-y-5"
            variants={cardVariants}
            initial="hidden"
            animate="show"
          >
            {/* Card 1 — Purple: Smart Resume Analysis */}
            <motion.div
              variants={cardItem}
              className="bento-tile glow-border-purple p-6"
              style={{
                animation: "float 5s ease-in-out infinite",
                animationDelay: "0s",
              }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-lg bg-primary/10 border border-primary/20">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Smart Resume Analysis</p>
                  <p className="text-xs text-muted-foreground mt-0.5">AI-powered scoring</p>
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="stat-number text-3xl text-primary glow-purple">8.4</span>
                <span className="text-sm text-muted-foreground font-mono">/ 10</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-primary/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: "84%",
                    boxShadow: "0 0 8px hsl(var(--primary) / 0.7)",
                  }}
                />
              </div>
            </motion.div>

            {/* Card 2 — Cyan: 87% Match Found */}
            <motion.div
              variants={cardItem}
              className="bento-tile glow-border-cyan p-6 ml-8"
              style={{
                animation: "float 5s ease-in-out infinite",
                animationDelay: "0.8s",
              }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-lg bg-secondary/10 border border-secondary/20">
                  <Search className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">87% Match Found</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Best fit for your profile</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["React", "TypeScript", "Node.js"].map((skill) => (
                  <span key={skill} className="cyber-badge">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Card 3 — Green: 247 New Jobs */}
            <motion.div
              variants={cardItem}
              className="bento-tile p-6"
              style={{
                border: "1px solid hsl(var(--accent) / 0.3)",
                animation: "float 5s ease-in-out infinite",
                animationDelay: "1.6s",
              }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-lg bg-accent/10 border border-accent/20">
                  <Zap className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">New Jobs</p>
                  <p className="text-xs text-muted-foreground mt-0.5">This week</p>
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span
                  className="stat-number text-4xl text-accent"
                  style={{ filter: "drop-shadow(0 0 8px hsl(var(--accent) / 0.6))" }}
                >
                  247
                </span>
                <span
                  className="text-xs font-mono text-accent/70"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  listings
                </span>
              </div>
            </motion.div>

            {/* Decorative: faint grid lines behind cards */}
            <div
              className="absolute inset-0 -z-10 rounded-3xl opacity-10"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, hsl(var(--border)) 0, hsl(var(--border)) 1px, transparent 1px, transparent 48px), repeating-linear-gradient(90deg, hsl(var(--border)) 0, hsl(var(--border)) 1px, transparent 1px, transparent 48px)",
              }}
              aria-hidden="true"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
