import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function RoleGuard({
  requirePlatformRole,
  children,
}: {
  requirePlatformRole?: string;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requirePlatformRole && user.platform_role !== requirePlatformRole) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <>{children}</>;
}

