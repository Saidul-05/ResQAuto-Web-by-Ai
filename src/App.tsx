import { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import AdminRoute from "./components/admin/AdminRoute";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import MechanicDashboard from "./components/mechanic/MechanicDashboard";
import AuthProvider from "./components/auth/AuthProvider";
import { FeatureProvider } from "./contexts/FeatureContext";
import routes from "tempo-routes";
import NotificationCenter from "./components/notifications/NotificationCenter";
import AnalyticsTracker from "./components/analytics/AnalyticsTracker";

function App() {
  // Check for dark mode preference on initial load
  useEffect(() => {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem("theme");

    // If user has selected dark mode or has no preference but system is dark
    if (
      savedTheme === "dark" ||
      (savedTheme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches) ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <AuthProvider>
      <FeatureProvider>
        <Suspense fallback={<p>Loading...</p>}>
          <div className="transition-colors duration-200">
            <AnalyticsTracker />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/mechanic" element={<MechanicDashboard />} />
              <Route path="/admin/*" element={<AdminRoute />} />
            </Routes>
            {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
            <Toaster />
          </div>
        </Suspense>
      </FeatureProvider>
    </AuthProvider>
  );
}

export default App;
