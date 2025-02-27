import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import AdminRoute from "./components/admin/AdminRoute";
import LoginPage from "./components/auth/LoginPage";
import routes from "tempo-routes";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/*" element={<AdminRoute />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        <Toaster />
      </>
    </Suspense>
  );
}

export default App;
