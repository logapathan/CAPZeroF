import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProfileEdit from "./pages/ProfileEdit";
import Practice from "./pages/Practice";
import ChallengeView from "./pages/ChallengeView";
import Competitions from "./pages/Competitions";
import CompetitionDetail from "./pages/CompetitionDetail";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";
import UserSearchPage from "./pages/UserSearchPage";
import CreateChallengePage from "./pages/CreateChallengePage";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import AuthRedirect from "./components/routes/AuthRedirect";
import ManagePracticePage from "./pages/ManagePracticePage";
import ContestManagementPage from "./pages/ContestManagementPage";
import ContestJoinPage from "./pages/ContestJoinPage";
import UserProfilePage from "./pages/UserProfilePage";
import LeaderboardPage from "./pages/Leaderboard";
import ChallengeResults from "./pages/ChallengeResult";

const queryClient = new QueryClient();

const App = () => {
  // Simple auth check to redirect logged in users to dashboard
  // In a real app, this would use a proper auth context
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />

            <Route
              path="/login"
              element={
                <AuthRedirect>
                  <Login />
                </AuthRedirect>
              }
            />
            <Route
              path="/signup"
              element={
                <AuthRedirect>
                  <Signup />
                </AuthRedirect>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
            <Route path="/practice" element={<Practice />} />
            <Route path="/challenge/:id" element={<ChallengeView />} />
            <Route path="/challenge-results" element={<ChallengeResults />} />
            <Route path="/competitions" element={<Competitions />} />
            <Route path="/competitions/:id" element={<CompetitionDetail />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/search" element={<UserSearchPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/create-challenge" element={<CreateChallengePage />} />
            <Route path="/manage-practice" element={<ManagePracticePage />} />
            <Route
              path="/contest-management"
              element={<ContestManagementPage />}
            />
            <Route
              path="/contest/join/:challengeId"
              element={<ContestJoinPage />}
            />
            <Route path="/profile/:id" element={<UserProfilePage />} />

            <Route
              path="/profile/:id/followers"
              element={<UserProfilePage />}
            />
            <Route
              path="/profile/:id/following"
              element={<UserProfilePage />}
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
