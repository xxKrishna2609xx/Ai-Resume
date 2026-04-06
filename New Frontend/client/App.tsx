import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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

const queryClient = new QueryClient();

// Enable dark mode globally
if (typeof document !== "undefined") {
  document.documentElement.classList.add("dark");
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/company" element={<CompanyDashboard />} />
          <Route path="/analyzer" element={<Analyzer />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/candidates" element={<Candidates />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
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
