
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PersonaProvider } from "@/contexts/PersonaContext";
import CloudShader from "./components/CloudShader";
import NoiseTexture from "./components/ui/NoiseTexture";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glassmorphic p-8 rounded-xl animate-pulse-subtle">
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PersonaProvider>
      <TooltipProvider>
        {/* Updated layout structure for proper z-indexing */}
        <div className="app-container relative min-h-screen overflow-hidden">
          {/* Background layer with CloudShader */}
          <div className="fixed inset-0 z-0">
            <CloudShader />
          </div>
          
          {/* Content layer */}
          <div className="relative z-10 min-h-screen">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Index />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/onboarding"
                  element={
                    <PrivateRoute>
                      <OnboardingPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <DashboardPage />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </div>
      </TooltipProvider>
    </PersonaProvider>
  </QueryClientProvider>
);

export default App;
