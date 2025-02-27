import React from "react";
import { Navigate } from "react-router-dom";
import AdminPanel from "./AdminPanel";
import Navbar from "../navigation/Navbar";
import { auth } from "@/lib/auth";

interface AdminRouteProps {}

const AdminRoute = ({}: AdminRouteProps) => {
  // Check if the user is authenticated and is an admin
  const isAuthenticated = auth.isAuthenticated();
  const isAdmin = auth.isAdmin();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20">
        <AdminPanel />
      </div>
    </div>
  );
};

export default AdminRoute;
