import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/services/api-client";
import { BUILTIN_THEMES, ThemeTokens } from "@/themes/theme-config/themes";

interface TenantThemeContextValue {
  companyName: string;
  logoUrl?: string;
  themeSlug: string;
  tokens: ThemeTokens;
  setThemeSlug: (slug: string) => void;
}

const ThemeContext = createContext<TenantThemeContextValue>({
  companyName: "JalPilot Water Portal",
  themeSlug: "aqua-professional",
  tokens: BUILTIN_THEMES["aqua-professional"],
  setThemeSlug: () => {},
});

export function TenantThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeSlug, setThemeSlugState] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("theme") || localStorage.getItem("jp_active_theme") || "aqua-professional";
  });

  const [companyName, setCompanyName] = useState<string>("JalPilot Water Portal");
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);

  const activeTokens = BUILTIN_THEMES[themeSlug] || BUILTIN_THEMES["aqua-professional"];

  const setThemeSlug = (slug: string) => {
    if (BUILTIN_THEMES[slug]) {
      setThemeSlugState(slug);
      localStorage.setItem("jp_active_theme", slug);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tenantSlug = params.get("tenant") || localStorage.getItem("jp_tenant_slug");
    if (!tenantSlug) return;
    localStorage.setItem("jp_tenant_slug", tenantSlug);

    apiClient.get("/public/tenant-context", { params: { slug: tenantSlug } })
      .then((res) => {
        const d = res.data.data;
        if (d.company_name) setCompanyName(d.company_name);
        if (d.logo_url) setLogoUrl(d.logo_url);
        if (d.theme_slug && BUILTIN_THEMES[d.theme_slug]) {
          setThemeSlugState(d.theme_slug);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--jp-primary", activeTokens.primary);
    root.style.setProperty("--jp-secondary", activeTokens.secondary);
    root.style.setProperty("--jp-accent", activeTokens.accent);
    root.style.setProperty("--jp-surface", activeTokens.surface);
    root.style.setProperty("--jp-radius", activeTokens.radius);
  }, [activeTokens]);

  return (
    <ThemeContext.Provider
      value={{
        companyName,
        logoUrl,
        themeSlug,
        tokens: activeTokens,
        setThemeSlug,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTenantTheme() {
  return useContext(ThemeContext);
}
