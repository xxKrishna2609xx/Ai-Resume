import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProfileSetup() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center space-y-6 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Complete Your Profile</h1>
          <p className="text-lg text-muted-foreground">
            Choose your role and set up your profile to get started.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Job Seeker Option */}
          <div className="bg-card rounded-2xl border-2 border-primary/20 p-8 hover:shadow-lg hover:border-primary transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
              <span className="text-2xl">👤</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Job Seeker</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Looking for your next opportunity? Upload your resume and get matched with perfect jobs.
            </p>
            <div className="text-xs text-primary font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
              Continue <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Company Option */}
          <div className="bg-card rounded-2xl border-2 border-secondary/20 p-8 hover:shadow-lg hover:border-secondary transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 flex items-center justify-center mb-4 transition-colors">
              <span className="text-2xl">🏢</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Company / Recruiter</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Hiring? Find the best candidates from our talent pool with AI-powered matching.
            </p>
            <div className="text-xs text-secondary font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
              Continue <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Continue prompting to build the full profile setup flow with forms and validation.
        </p>
      </div>
    </div>
  );
}
