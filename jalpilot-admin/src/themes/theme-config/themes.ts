export interface ThemeTokens {
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  layout: "sidebar" | "topnav" | "compact";
  radius: string;
}

export const BUILTIN_THEMES: Record<string, ThemeTokens> = {
  "aqua-professional": { primary: "#0284c7", secondary: "#e0f2fe", accent: "#0369a1", surface: "#ffffff", layout: "sidebar", radius: "0.5rem" },
  "ocean-premium": { primary: "#0f172a", secondary: "#cffafe", accent: "#06b6d4", surface: "#f8fafc", layout: "topnav", radius: "0.75rem" },
  "fresh-aqua": { primary: "#0d9488", secondary: "#ccfbf1", accent: "#14b8a6", surface: "#ffffff", layout: "sidebar", radius: "1rem" },
  "aqua-express": { primary: "#2563eb", secondary: "#dbeafe", accent: "#f59e0b", surface: "#ffffff", layout: "compact", radius: "0.375rem" },
  "pure-luxury": { primary: "#1e293b", secondary: "#f1f5f9", accent: "#d97706", surface: "#ffffff", layout: "topnav", radius: "0.75rem" },
};

