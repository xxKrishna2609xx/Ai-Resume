import { TopNav } from "@/components/TopNav";
import { MobileActionBar } from "@/components/MobileActionBar";
import { Search } from "lucide-react";

export default function Jobs() {
  return (
    <>
      <TopNav isAuthenticated userName="John Doe" userRole="seeker" />
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4 pb-20 md:pb-0">
        <div className="text-center max-w-2xl">
          <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-secondary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Find Jobs</h1>
          <p className="text-lg text-muted-foreground mb-8">
            This is a placeholder page. Continue prompting to build the Job Matcher with filters, search,
            match scores, and detailed job information modals.
          </p>
          <div className="bg-card rounded-xl p-6 border border-border space-y-3">
            <p className="text-sm text-muted-foreground">
              🔍 Features coming soon:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Filter by country, job title, type, and salary</li>
              <li>• AI match scores for jobs based on your resume</li>
              <li>• One-click apply functionality</li>
              <li>• Detailed job information with company details</li>
            </ul>
          </div>
        </div>
      </div>
      <MobileActionBar isAuthenticated userRole="seeker" />
    </>
  );
}
