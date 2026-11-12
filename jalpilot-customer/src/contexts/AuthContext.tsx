import React, { createContext, useContext, useState } from "react";
import { apiClient } from "@/services/api-client";

export interface PortalUser {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  tenant_id?: string;
}

interface AuthContextValue {
  user: PortalUser | null;
  setUser: (u: PortalUser | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PortalUser | null>(() => {
    const raw = localStorage.getItem("jp_portal_user");
    return raw ? (JSON.parse(raw) as PortalUser) : null;
  });

  const handleSetUser = (u: PortalUser | null) => {
    setUser(u);
    if (u) localStorage.setItem("jp_portal_user", JSON.stringify(u));
    else localStorage.removeItem("jp_portal_user");
  };

  const logout = async () => {
    try { await apiClient.post("/auth/logout"); } finally { handleSetUser(null); }
  };

  return <AuthContext.Provider value={{ user, setUser: handleSetUser, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

