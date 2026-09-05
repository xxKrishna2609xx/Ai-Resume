import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getHomeRouteByRole } from "@/lib/routes";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Zap, Mail, Lock, Sparkles, ArrowRight, Loader2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, refreshProfile } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePostAuth = async () => {
    const latestProfile = await refreshProfile();
    onClose();
    if (latestProfile?.needsProfileSetup) {
      navigate("/profile-setup", { replace: true });
    } else {
      navigate(getHomeRouteByRole(latestProfile?.role), { replace: true });
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      toast.success("Successfully signed in with Google!");
      await handlePostAuth();
    } catch (err: any) {
      console.error("Google sign in error", err);
      if (err?.code === "auth/popup-closed-by-user") {
        toast.info("Google Sign-In popup closed.");
      } else {
        toast.error(err?.message || "Google Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      if (mode === "signin") {
        await signInWithEmail(email, password);
        toast.success("Welcome back! Signed in successfully.");
      } else {
        await signUpWithEmail(email, password);
        toast.success("Account created successfully!");
      }
      await handlePostAuth();
    } catch (err: any) {
      console.error("Email auth error", err);
      if (err?.code === "auth/user-not-found" || err?.code === "auth/wrong-password") {
        toast.error("Invalid email or password.");
      } else if (err?.code === "auth/email-already-in-use") {
        toast.error("An account with this email already exists. Try signing in.");
      } else {
        toast.error(err?.message || "Authentication failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/80 text-foreground p-6 shadow-2xl rounded-2xl">
        <DialogHeader className="space-y-3 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/30">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span
              className="font-mono text-lg font-bold tracking-widest text-foreground"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              RESUME<span className="text-primary"> AI</span>
            </span>
          </div>

          <DialogTitle className="text-2xl font-bold text-foreground">
            {mode === "signin" ? "Sign In to Your Workspace" : "Create Your Account"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {mode === "signin"
              ? "Access your AI resume score, job matches, and recruiter portal."
              : "Start scoring resumes and matching top jobs with Gemini AI."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Google Sign In CTA */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)",
              boxShadow: "0 0 20px hsl(var(--primary) / 0.35)",
            }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
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
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-border/60 w-full" />
            <span className="bg-card px-3 text-[11px] font-mono text-muted-foreground uppercase tracking-widest absolute">
              Or with Email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="cyber-input pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cyber-input pl-9"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-ghost-cyber py-3 flex items-center justify-center gap-2 hover:border-primary/50 text-foreground font-semibold"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? "Sign In with Email" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="text-center pt-2">
            {mode === "signin" ? (
              <p className="text-xs text-muted-foreground">
                Don't have an account yet?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-primary hover:underline font-semibold"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={() => setMode("signin")}
                  className="text-primary hover:underline font-semibold"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
