import { TopNav } from "@/components/TopNav";
import { MobileActionBar } from "@/components/MobileActionBar";
import { Upload, FileText } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { uploadResume, getResumeById } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function Analyzer() {
  const { getIdToken, refreshProfile, profile } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resumeQuery = useQuery({
    queryKey: ["resume", profile?.resumeId],
    queryFn: async () => {
      const token = await getIdToken();
      if (!token) throw new Error("Missing authentication token");
      return getResumeById(profile?.resumeId as string, token);
    },
    enabled: Boolean(profile?.resumeId),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const token = await getIdToken();
      if (!token) throw new Error("Authentication token missing. Please sign in again.");
      return uploadResume(file, token);
    },
    onSuccess: async () => {
      await refreshProfile();
      await resumeQuery.refetch();
    },
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please choose a PDF file first.");
      return;
    }

    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Only PDF files are supported.");
      return;
    }

    setError(null);
    try {
      await uploadMutation.mutateAsync(selectedFile);
    } catch (err: any) {
      setError(err?.message || "Upload and analysis failed. Please try again.");
    }
  };

  const analysis = uploadMutation.data?.ai_analysis ?? resumeQuery.data?.full_ai_response;

  return (
    <>
      <TopNav />
      <div className="min-h-screen bg-gradient-subtle px-4 pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto pt-10 pb-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Resume Analyzer</h1>
            <p className="text-lg text-muted-foreground mb-2">
              Upload your latest resume and get AI analysis from your backend pipeline.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
            <label className="block text-sm font-semibold text-foreground">Choose Resume (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground"
            />
            {selectedFile ? (
              <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>
            ) : null}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <button
              type="button"
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:shadow-lg transition-shadow disabled:opacity-60"
            >
              {uploadMutation.isPending ? "Analyzing resume..." : "Upload and Analyze"}
            </button>

            {uploadMutation.error ? (
              <p className="text-sm text-destructive">
                {uploadMutation.error instanceof Error
                  ? uploadMutation.error.message
                  : "Upload failed"}
              </p>
            ) : null}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Analysis Summary</h2>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold text-foreground">Candidate:</span> {analysis?.candidate_name ?? "-"}</p>
                <p><span className="font-semibold text-foreground">Experience:</span> {analysis?.experience_years ?? 0} years</p>
                <p><span className="font-semibold text-foreground">Score:</span> {analysis?.resume_quality_score ?? 0}/10</p>
                <p className="text-muted-foreground">{analysis?.summary ?? "Upload a resume to see summary insights."}</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-lg font-bold text-foreground mb-4">Extracted Skills</h2>
              <div className="flex flex-wrap gap-2">
                {(analysis?.skills ?? []).length > 0 ? (
                  analysis?.skills?.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No skills extracted yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileActionBar />
    </>
  );
}
