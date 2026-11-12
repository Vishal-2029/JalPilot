import React, { createContext, useContext, useState } from "react";
import { apiClient } from "@/services/api-client";

export interface AuthUser {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  tenant_id?: string;
  platform_role?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem("jp_admin_user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  });

  const handleSetUser = (u: AuthUser | null) => {
    setUser(u);
    if (u) localStorage.setItem("jp_admin_user", JSON.stringify(u));
    else localStorage.removeItem("jp_admin_user");
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      handleSetUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

