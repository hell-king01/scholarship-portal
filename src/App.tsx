import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/lib/i18n";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import ScholarshipsPage from "./pages/ScholarshipsPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { MentorDashboard } from "./pages/MentorDashboard";
import { EligibilityPage } from "./pages/EligibilityPage";
import ScholarshipDetailsPage from "./pages/ScholarshipDetailsPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import DocumentsPage from "./pages/DocumentsPage";
import FAQPage from "./pages/FAQPage";
import StudentAnalyticsPage from "./pages/StudentAnalyticsPage";
import ActivityPage from "./pages/ActivityPage";
import Chatbot from "./components/Chatbot";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Chatbot userId="guest" />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents"
              element={
                <ProtectedRoute>
                  <DocumentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/scholarships" element={<ScholarshipsPage />} />
            <Route path="/scholarship/:id" element={<ScholarshipDetailsPage />} />
            <Route
              path="/applications"
              element={
                <ProtectedRoute>
                  <ApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route path="/eligibility" element={<EligibilityPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <StudentAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity"
              element={
                <ProtectedRoute>
                  <ActivityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor"
              element={
                <ProtectedRoute requiredRole="mentor">
                  <MentorDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
