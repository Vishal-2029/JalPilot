import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/services/api-client";
import { BUILTIN_THEMES, ThemeTokens } from "@/themes/theme-config/themes";

interface TenantBranding {
  companyName: string;
  logoUrl?: string;
  themeSlug: string;
  tokens: ThemeTokens;
}

const ThemeContext = createContext<TenantBranding>({
  companyName: "JalPilot Water Portal",
  themeSlug: "aqua-professional",
  tokens: BUILTIN_THEMES["aqua-professional"],
});

export function TenantThemeProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<TenantBranding>({
    companyName: "JalPilot Water Portal",
    themeSlug: "aqua-professional",
    tokens: BUILTIN_THEMES["aqua-professional"],
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("tenant") || localStorage.getItem("jp_tenant_slug");
    if (!slug) return;
    localStorage.setItem("jp_tenant_slug", slug);

    apiClient.get("/public/tenant-context", { params: { slug } }).then((res) => {
      const d = res.data.data;
      const base = BUILTIN_THEMES[d.theme_slug] || BUILTIN_THEMES["aqua-professional"];
      const tokens: ThemeTokens = {
        ...base,
        ...(d.theme_config || {}),
        primary: d.primary_color || d.theme_config?.primary || base.primary,
        secondary: d.secondary_color || d.theme_config?.secondary || base.secondary,
      };
      setBranding({
        companyName: d.company_name,
        logoUrl: d.logo_url,
        themeSlug: d.theme_slug,
        tokens,
      });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--jp-primary", branding.tokens.primary);
    root.style.setProperty("--jp-secondary", branding.tokens.secondary);
    root.style.setProperty("--jp-accent", branding.tokens.accent);
    root.style.setProperty("--jp-surface", branding.tokens.surface);
    root.style.setProperty("--jp-radius", branding.tokens.radius);
  }, [branding]);

  return <ThemeContext.Provider value={branding}>{children}</ThemeContext.Provider>;
}

export function useTenantTheme() {
  return useContext(ThemeContext);
}

