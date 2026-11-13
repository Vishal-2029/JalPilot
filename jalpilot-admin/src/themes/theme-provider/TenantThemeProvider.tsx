import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/services/api-client";
import { BUILTIN_THEMES, ThemeTokens } from "@/themes/theme-config/themes";

interface TenantThemeContextValue {
  companyName: string;
  logoUrl?: string;
  themeSlug: string;
  tokens: ThemeTokens;
  setThemeSlug: (slug: string) => Promise<void>;
}

const ThemeContext = createContext<TenantThemeContextValue>({
  companyName: "JalPilot Water Portal",
  themeSlug: "aqua-professional",
  tokens: BUILTIN_THEMES["aqua-professional"],
  setThemeSlug: async () => {},
});

export function TenantThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeSlug, setThemeSlugState] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("theme");
    if (fromUrl && BUILTIN_THEMES[fromUrl]) return fromUrl;
    const fromStorage = localStorage.getItem("jp_active_theme");
    if (fromStorage && BUILTIN_THEMES[fromStorage]) return fromStorage;
    return "aqua-professional";
  });

  const [companyName, setCompanyName] = useState<string>("JalPilot Water Portal");
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);

  const activeTokens = BUILTIN_THEMES[themeSlug] || BUILTIN_THEMES["aqua-professional"];

  const setThemeSlug = async (slug: string) => {
    if (!BUILTIN_THEMES[slug]) return;
    setThemeSlugState(slug);
    localStorage.setItem("jp_active_theme", slug);

    // Save active theme to backend
    try {
      await apiClient.post("/admin/themes/set-active", { theme_slug: slug });
    } catch {
      // Offline fallback or non-admin session
    }
  };

  // Sync with backend on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTheme = params.get("theme");
    if (urlTheme && BUILTIN_THEMES[urlTheme]) {
      setThemeSlugState(urlTheme);
      localStorage.setItem("jp_active_theme", urlTheme);
      return;
    }

    const tenantSlug = params.get("tenant") || localStorage.getItem("jp_tenant_slug");
    if (tenantSlug) {
      apiClient.get("/public/tenant-context", { params: { slug: tenantSlug } })
        .then((res) => {
          const d = res.data.data;
          if (d.company_name) setCompanyName(d.company_name);
          if (d.logo_url) setLogoUrl(d.logo_url);
          if (d.theme_slug && BUILTIN_THEMES[d.theme_slug]) {
            setThemeSlugState(d.theme_slug);
            localStorage.setItem("jp_active_theme", d.theme_slug);
          }
        })
        .catch(() => {});
    }

    // Attempt to fetch active theme for logged in user (admin or customer)
    apiClient.get("/admin/themes/active")
      .then((res) => {
        const d = res.data?.data;
        if (d?.theme_slug && BUILTIN_THEMES[d.theme_slug]) {
          setThemeSlugState(d.theme_slug);
          localStorage.setItem("jp_active_theme", d.theme_slug);
        }
      })
      .catch(() => {
        apiClient.get("/customer/themes/active")
          .then((res) => {
            const d = res.data?.data;
            if (d?.theme_slug && BUILTIN_THEMES[d.theme_slug]) {
              setThemeSlugState(d.theme_slug);
              localStorage.setItem("jp_active_theme", d.theme_slug);
            }
          })
          .catch(() => {});
      });
  }, []);

  // Update CSS Variables and data-theme on root
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--jp-primary", activeTokens.primary);
    root.style.setProperty("--jp-secondary", activeTokens.secondary);
    root.style.setProperty("--jp-accent", activeTokens.accent);
    root.style.setProperty("--jp-surface", activeTokens.surface);
    root.style.setProperty("--jp-radius", activeTokens.radius);
    root.setAttribute("data-theme", themeSlug);
  }, [activeTokens, themeSlug]);

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
