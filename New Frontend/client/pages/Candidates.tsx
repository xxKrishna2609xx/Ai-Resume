import { TopNav } from "@/components/TopNav";
import { MobileActionBar } from "@/components/MobileActionBar";
import { Users } from "lucide-react";

export default function Candidates() {
  return (
    <>
      <TopNav isAuthenticated userName="Acme Corp" userRole="company" />
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4 pb-20 md:pb-0">
        <div className="text-center max-w-2xl">
          <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-secondary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Find Candidates</h1>
          <p className="text-lg text-muted-foreground mb-8">
            This is a placeholder page. Continue prompting to build the Candidate Search with filters,
            candidate cards/table, and detailed candidate profiles.
          </p>
          <div className="bg-card rounded-xl p-6 border border-border space-y-3">
            <p className="text-sm text-muted-foreground">
              👥 Features coming soon:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Filter by skills, experience, and availability</li>
              <li>• View candidate resumes and profiles</li>
              <li>• Contact and messaging functionality</li>
              <li>• Batch candidate evaluation</li>
            </ul>
          </div>
        </div>
      </div>
      <MobileActionBar isAuthenticated userRole="company" />
    </>
  );
}
