import { Sparkles, BarChart3, Zap } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getHomeRouteByRole } from "@/lib/routes";

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
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex flex-col overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      {/* Content */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* Left side - Hero text */}
        <div className="flex-1 flex flex-col justify-center items-center lg:items-start p-6 sm:p-8 md:p-12 text-center lg:text-left">
          <div className="max-w-xl space-y-8 fade-in">
            {/* Brand/Logo area */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 w-fit mx-auto lg:mx-0">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Talent Platform</span>
            </div>

            {/* Main heading */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
                Your <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Perfect Match</span> Awaits
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Connect with opportunities tailored to your skills. For job seekers and companies alike, find your ideal match with AI-powered intelligence.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex gap-3 items-start">
                <div className="mt-1 p-2 rounded-lg bg-primary/10">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground text-sm">Smart Matching</h3>
                  <p className="text-xs text-muted-foreground">AI analyzes resumes and requirements</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="mt-1 p-2 rounded-lg bg-secondary/10">
                  <BarChart3 className="w-5 h-5 text-secondary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground text-sm">Instant Insights</h3>
                  <p className="text-xs text-muted-foreground">Resume scores and match percentages</p>
                </div>
              </div>
            </div>

            {/* Primary CTA */}
            <div className="pt-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn || isLoading}
                className="w-full sm:w-fit px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
              >
                {isSigningIn || isLoading ? (
                  <>
                    <div className="animate-spin">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <p className="text-xs text-muted-foreground mt-4">
                Choose your role after signing in — Job Seeker or Company
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Visual element */}
        <div className="flex-1 hidden lg:flex items-center justify-center p-12">
          <div className="relative w-full h-full max-w-md">
            {/* Floating cards animation concept */}
            <div className="space-y-6">
              {/* Card 1 */}
              <div className="slide-up" style={{ animationDelay: "0.1s" }}>
                <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Smart Resume Analysis</h3>
                      <p className="text-sm text-muted-foreground mt-1">Upload and get instant insights</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-secondary/10">
                      <BarChart3 className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Find Perfect Matches</h3>
                      <p className="text-sm text-muted-foreground mt-1">Get jobs tailored to you</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="slide-up" style={{ animationDelay: "0.3s" }}>
                <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-accent/10">
                      <Zap className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">One-Click Apply</h3>
                      <p className="text-sm text-muted-foreground mt-1">Apply to positions instantly</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
