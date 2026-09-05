import {
  Zap,
  Search,
  Shield,
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  User,
  Building2,
  Briefcase,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getHomeRouteByRole } from "@/lib/routes";
import { motion } from "framer-motion";
import { BackendStatusBadge } from "@/components/BackendStatusBadge";

// ─── Animation Variants ──────────────────────────────────────────────────────
const leftVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const leftItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
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
    title: "Gemini AI Resume Analysis",
    desc: "Instant ATS score, formatting tips, and skill extraction powered by Google Gemini.",
  },
  {
    icon: Search,
    color: "text-secondary",
    bg: "bg-secondary/10",
    border: "border-secondary/20",
    title: "Smart Job Sourcing & Matching",
    desc: "Real-time vacancies from Adzuna automatically ranked by your candidate profile.",
  },
  {
    icon: FileText,
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
    title: "1-Click AI Cover Letters",
    desc: "Generate tailored cover letters specifically aligned with your target job description.",
  },
  {
    icon: Shield,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    title: "Recruiter Sourcing Platform",
    desc: "Companies can instantly search and match verified candidates with specific skill sets.",
  },
];

// ─── How it works steps ──────────────────────────────────────────────────────
const steps = [
  {
    number: "01",
    title: "Upload Your Resume",
    desc: "Upload standard or image-based PDF resumes. Our hybrid OCR engine cleanly parses all text.",
    icon: Upload,
    glow: "glow-border-purple",
    badge: "PDF / OCR Parsing",
  },
  {
    number: "02",
    title: "Gemini AI Evaluation",
    desc: "Google Gemini evaluates experience, extracts key technical skills, and calculates quality score.",
    icon: Sparkles,
    glow: "glow-border-cyan",
    badge: "Google Gemini 2.5",
  },
  {
    number: "03",
    title: "Match Jobs & Apply",
    desc: "Get real-time jobs ranked by match percentage and generate custom cover letters instantly.",
    icon: CheckCircle2,
    glow: "glow-green",
    badge: "Adzuna API Sourcing",
  },
];

import { AuthModal } from "@/components/auth/AuthModal";

// ─── Component ────────────────────────────────────────────────────────────────
export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, profile, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const homeRoute = getHomeRouteByRole(profile?.role);

  const openAuthModal = () => setIsAuthModalOpen(true);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background overflow-x-hidden flex flex-col text-foreground">
      {/* ── Background grid pattern ── */}
      <div
        className="bg-grid absolute inset-0 opacity-[0.03] pointer-events-none"
        aria-hidden="true"
      />

      {/* ── Atmospheric glow orbs ── */}
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/4 -right-40 w-[550px] h-[550px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--secondary) / 0.12) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
        aria-hidden="true"
      />

      {/* ════════════════ TOP NAVIGATION BAR ════════════════ */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 group-hover:border-primary/60 transition-colors">
              <Zap className="w-4 h-4 text-primary" />
              <span
                className="absolute inset-0 rounded-lg"
                style={{ boxShadow: "0 0 12px hsl(var(--primary) / 0.4)" }}
              />
            </div>
            <span
              className="font-mono text-base font-bold tracking-[0.18em] text-foreground"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              RESUME<span className="text-primary"> AI</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-foreground transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-foreground transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("job-seekers")}
              className="hover:text-foreground transition-colors"
            >
              For Job Seekers
            </button>
            <button
              onClick={() => scrollToSection("recruiters")}
              className="hover:text-foreground transition-colors"
            >
              For Recruiters
            </button>
          </nav>

          {/* Auth Controls */}
          <div className="flex items-center gap-3">
            <BackendStatusBadge />
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-foreground">
                    {profile?.displayName || "User"}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground capitalize">
                    {profile?.role === "company" ? "🏢 Recruiter" : "👤 Job Seeker"}
                  </span>
                </div>

                <button
                  onClick={() => navigate(homeRoute)}
                  className="btn-neon-purple text-xs sm:text-sm px-4 py-2 flex items-center gap-2"
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="btn-neon-purple text-xs sm:text-sm px-4 py-2.5 flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ════════════════ HERO SECTION ════════════════ */}
      <section className="relative z-10 pt-12 pb-20 md:pt-20 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Text */}
          <motion.div
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
            variants={leftVariants}
            initial="hidden"
            animate="show"
          >
            {/* Pill Badge */}
            <motion.div variants={leftItem} className="inline-flex items-center gap-2">
              <span className="cyber-badge-purple px-3 py-1 text-xs">
                ⚡ Powered by Google Gemini AI & Live Adzuna Jobs
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div variants={leftItem} className="space-y-3">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                Transform Your Career with{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  AI Resume Intelligence
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Upload your resume to get instant ATS quality scoring, skill extraction, custom AI
                cover letters, and live job matches ranked specifically for your experience.
              </p>
            </motion.div>

            {/* Feature Bullets */}
            <motion.div
              variants={leftItem}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2"
            >
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="flex items-start gap-3 p-3 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm"
                  >
                    <div
                      className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg ${f.bg} border ${f.border}`}
                    >
                      <Icon className={`w-4 h-4 ${f.color}`} />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-foreground">{f.title}</p>
                      <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Hero CTAs */}
            <motion.div
              variants={leftItem}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
            >
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate(homeRoute)}
                    className="w-full sm:w-auto btn-neon-purple px-8 py-4 text-base flex items-center justify-center gap-3"
                  >
                    Go to Your Dashboard <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigate("/analyzer")}
                    className="w-full sm:w-auto btn-ghost-cyber px-6 py-4 text-base flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-primary" /> Upload Resume PDF
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={openAuthModal}
                    className="w-full sm:w-auto btn-neon-purple px-8 py-4 text-base flex items-center justify-center gap-3"
                  >
                    Get Started <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => scrollToSection("how-it-works")}
                    className="w-full sm:w-auto btn-ghost-cyber px-6 py-4 text-base flex items-center justify-center gap-2"
                  >
                    Explore Features <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </motion.div>

            {/* Security subtext */}
            <motion.p
              variants={leftItem}
              className="text-xs text-muted-foreground font-mono"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              🔒 Enterprise-grade Firebase Auth & Secure Storage • Free to get started
            </motion.p>
          </motion.div>

          {/* Right Hero Cards Visual */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <motion.div
              className="relative w-full max-w-md space-y-4"
              variants={cardVariants}
              initial="hidden"
              animate="show"
            >
              {/* Card 1 — Resume Analysis Preview */}
              <motion.div
                variants={cardItem}
                className="bento-tile glow-border-purple p-5"
                style={{
                  animation: "float 6s ease-in-out infinite",
                  animationDelay: "0s",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/30">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">ATS Quality Score</p>
                      <p className="text-xs text-muted-foreground">Google Gemini 2.5 Evaluation</p>
                    </div>
                  </div>
                  <span className="cyber-badge-purple">EXCELLENT</span>
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="stat-number text-4xl text-primary glow-purple">8.8</span>
                  <span className="text-sm text-muted-foreground font-mono">/ 10</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-primary/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: "88%",
                      boxShadow: "0 0 10px hsl(var(--primary) / 0.8)",
                    }}
                  />
                </div>
              </motion.div>

              {/* Card 2 — Job Match Score */}
              <motion.div
                variants={cardItem}
                className="bento-tile glow-border-cyan p-5 ml-6 sm:ml-10"
                style={{
                  animation: "float 6s ease-in-out infinite",
                  animationDelay: "1s",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary/10 border border-secondary/30">
                    <Search className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Senior React Developer</p>
                    <p className="text-xs text-secondary font-mono">92% Match Score</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="cyber-badge">React 18</span>
                  <span className="cyber-badge">TypeScript</span>
                  <span className="cyber-badge">FastAPI</span>
                </div>
              </motion.div>

              {/* Card 3 — AI Cover Letter Preview */}
              <motion.div
                variants={cardItem}
                className="bento-tile p-5"
                style={{
                  border: "1px solid hsl(var(--accent) / 0.3)",
                  animation: "float 6s ease-in-out infinite",
                  animationDelay: "2s",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 border border-accent/30">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Tailored Cover Letter</p>
                    <p className="text-xs text-muted-foreground">Generated in 2 seconds</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground italic line-clamp-2">
                  "Dear Hiring Manager, I am thrilled to apply for the Senior Frontend Engineer role.
                  With 5+ years building scalable React apps..."
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS SECTION ════════════════ */}
      <section
        id="how-it-works"
        className="relative z-10 py-20 bg-card/30 border-y border-border/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="section-label">HOW IT WORKS</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              3 Simple Steps to Unlock Your Dream Job
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Our intelligent engine handles document parsing, AI skill matching, and real-time job
              discovery automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.number}
                  className={`bento-tile p-6 flex flex-col justify-between ${s.glow}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-3xl font-bold text-muted-foreground/30">
                        {s.number}
                      </span>
                      <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center border border-border">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border/40">
                    <span className="cyber-badge-purple text-[10px]">{s.badge}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ FOR JOB SEEKERS & RECRUITERS ════════════════ */}
      <section id="features" className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="section-label">DUAL ECOSYSTEM</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Tailored Experiences for Candidates and Employers
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Whether you are advancing your career or looking for top-tier talent, our platform has
            you covered.
          </p>
        </div>

        {/* Job Seekers Block */}
        <div id="job-seekers" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bento-tile p-8 sm:p-10">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-mono">
              <User className="w-4 h-4" /> For Job Seekers
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
              Optimize Your Resume & Land Interviews Faster
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Detailed Resume Scoring:</strong> Get actionable insights on formatting, impact verbs, and key skill gaps.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Real-Time Job Board:</strong> Search global vacancies with salary filtering and skill match indicators.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">AI Cover Letter Builder:</strong> Generate polished, job-specific cover letters in seconds.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Open to Work Toggle:</strong> Control your visibility to prospective recruiters directly from your dashboard.
                </span>
              </li>
            </ul>
            <div className="pt-2">
              <button
                onClick={isAuthenticated ? () => navigate("/analyzer") : openAuthModal}
                className="btn-neon-purple text-sm px-6 py-3"
              >
                Analyze Your Resume Now →
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4 bg-background/50 p-6 rounded-xl border border-border">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <span className="text-xs font-mono text-muted-foreground">JOB SEEKER PREVIEW</span>
              <span className="cyber-badge-green">ACTIVE SESSION</span>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-card border border-border/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">Frontend Software Engineer</p>
                  <p className="text-[11px] text-muted-foreground">San Francisco, CA • $130,000 - $160,000</p>
                </div>
                <span className="cyber-badge">94% Match</span>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">Full Stack Developer</p>
                  <p className="text-[11px] text-muted-foreground">Remote • $120,000 - $145,000</p>
                </div>
                <span className="cyber-badge">88% Match</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recruiters Block */}
        <div id="recruiters" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bento-tile p-8 sm:p-10">
          <div className="lg:col-span-6 space-y-4 bg-background/50 p-6 rounded-xl border border-border lg:order-1 order-2">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <span className="text-xs font-mono text-muted-foreground">RECRUITER SEARCH</span>
              <span className="cyber-badge-purple">FILTER ENGINE</span>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-card border border-border/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">Candidate #48291</p>
                  <p className="text-[11px] text-muted-foreground">5 Years Exp • React, Node, Python</p>
                </div>
                <span className="cyber-badge-green font-mono">OPEN TO WORK</span>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">Candidate #19204</p>
                  <p className="text-[11px] text-muted-foreground">3 Years Exp • TypeScript, FastAPI</p>
                </div>
                <span className="cyber-badge-green font-mono">OPEN TO WORK</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 lg:order-2 order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-secondary/10 border border-secondary/20 text-secondary text-xs font-mono">
              <Building2 className="w-4 h-4" /> For Employers & Recruiters
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
              Source Verified Candidates with Targeted Skill Filtering
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Granular Candidate Search:</strong> Search candidates by specific programming languages, frameworks, and minimum experience years.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Verified AI Profiles:</strong> Access candidate profiles pre-analyzed and structured by Google Gemini AI.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Active Talent Pool:</strong> Filter exclusively for job seekers marked as "Open to Work".
                </span>
              </li>
            </ul>
            <div className="pt-2">
              <button
                onClick={isAuthenticated ? () => navigate("/candidates") : openAuthModal}
                className="btn-neon-cyan text-sm px-6 py-3"
              >
                Find Candidates Now →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ CALL TO ACTION BANNER ════════════════ */}
      <section className="relative z-10 py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bento-tile glow-border-purple p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          <div
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />

          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Ready to Accelerate Your Career or Hiring Process?
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Join job seekers and recruiters using AI to automate resume optimization and candidate matching.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(homeRoute)}
                className="btn-neon-purple px-8 py-4 text-base flex items-center gap-2"
              >
                Go to Workspace Dashboard <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={openAuthModal}
                className="btn-neon-purple px-8 py-4 text-base flex items-center gap-3"
              >
                Get Started Now <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="relative z-10 bg-card/50 border-t border-border/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded bg-primary/10 border border-primary/30">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
            <span
              className="font-mono text-sm font-bold text-foreground"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              RESUME<span className="text-primary"> AI</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-[11px]">
            <span>FastAPI Backend</span>
            <span>•</span>
            <span>Google Gemini AI</span>
            <span>•</span>
            <span>Adzuna API</span>
            <span>•</span>
            <span>Firebase Auth</span>
          </div>

          <div className="font-mono text-[11px]">
            © {new Date().getFullYear()} AI Resume Platform. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ════════════════ AUTH MODAL DIALOG ════════════════ */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

