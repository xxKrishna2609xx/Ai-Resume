import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, RoleRoute } from "@/components/auth/ProtectedRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import ProfileSetup from "./pages/ProfileSetup";
import Analyzer from "./pages/Analyzer";
import Jobs from "./pages/Jobs";
import Candidates from "./pages/Candidates";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/profile-setup"
              element={
                <ProtectedRoute>
                  <ProfileSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["job_seeker"]}>
                    <Dashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/company"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["company"]}>
                    <CompanyDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analyzer"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["job_seeker"]}>
                    <Analyzer />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["job_seeker"]}>
                    <Jobs />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidates"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["company"]}>
                    <Candidates />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

let root: ReturnType<typeof createRoot> | null = null;

function initRoot() {
  const rootElement = document.getElementById("root");
  if (rootElement && !root) {
    root = createRoot(rootElement);
  }
  if (root) {
    root.render(<App />);
  }
}

initRoot();

// Handle HMR updates
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    root = null;
  });
}
