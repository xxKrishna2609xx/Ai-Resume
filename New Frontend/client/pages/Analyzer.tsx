import { TopNav } from "@/components/TopNav";
import { MobileActionBar } from "@/components/MobileActionBar";
import { Upload } from "lucide-react";

export default function Analyzer() {
  return (
    <>
      <TopNav isAuthenticated userName="John Doe" userRole="seeker" />
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4 pb-20 md:pb-0">
        <div className="text-center max-w-2xl">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Upload className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Resume Analyzer</h1>
          <p className="text-lg text-muted-foreground mb-8">
            This is a placeholder page. Continue prompting to build the Resume Analyzer with drag-and-drop
            PDF upload, progress tracking, and AI-powered analysis with score and insights.
          </p>
          <div className="bg-card rounded-xl p-6 border border-border">
            <p className="text-sm text-muted-foreground">
              📄 The Analyzer will show: resume score, extracted skills, experience, and matched job opportunities.
            </p>
          </div>
        </div>
      </div>
      <MobileActionBar isAuthenticated userRole="seeker" />
    </>
  );
}
