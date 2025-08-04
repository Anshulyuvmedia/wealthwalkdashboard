import { Routes, Route } from "react-router-dom";
import { authProtectedRoutes, publicRoutes } from "./routes";
import AuthMiddleware from "./routes/route";
import React from "react";

export default function App(): React.ReactNode {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Routes>
        {authProtectedRoutes.map((route, idx) => (
          <Route
            key={idx}
            path={route.path}
            element={
              <AuthMiddleware>{route.component}</AuthMiddleware>
            }
          />
        ))}

        {publicRoutes.map((route, idx) => (
          <Route key={idx} path={route.path} element={route.component} />
        ))}
      </Routes>
    </div>
  );
}
