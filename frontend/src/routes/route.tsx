import { Navigate } from "react-router-dom";
import React from "react";

interface AuthMiddlewareProps {
  children: React.ReactNode;
}

export default function AuthMiddleware({ children }: AuthMiddlewareProps) {
  const admin = localStorage.getItem("admin");

  // ✅ Redirect to login if not logged in
  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
