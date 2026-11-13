export interface ThemeTokens {
  id: string;
  name: string;
  slug: string;
  category: string;
  tagline: string;
  layout: "corporate-sidebar" | "floating-island" | "compact-dock" | "dark-marine" | "luxury-editorial";
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  bodyBg: string;
  radius: string;
  cardClass: string;
  buttonClass: string;
  badgeClass: string;
  headerClass: string;
  fontHeading: string;
}

export const BUILTIN_THEMES: Record<string, ThemeTokens> = {
  "aqua-professional": {
    id: "aqua-professional",
    name: "Aqua Professional",
    slug: "aqua-professional",
    category: "Corporate & B2B",
    tagline: "Clean, structured enterprise SaaS sidebar layout with crisp borders & data hierarchy",
    layout: "corporate-sidebar",
    primary: "#0284c7", // Sky 600
    secondary: "#f0f9ff", // Sky 50
    accent: "#0369a1", // Sky 700
    surface: "#ffffff",
    bodyBg: "#f8fafc", // Slate 50
    radius: "0.75rem",
    cardClass: "rounded-xl border border-slate-200 bg-white shadow-xs p-5 transition-all",
    buttonClass: "rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-sky-700",
    badgeClass: "rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-semibold px-2.5 py-0.5 text-xs",
    headerClass: "bg-white border-b border-slate-200 text-slate-900",
    fontHeading: "font-sans font-bold",
  },

  "fresh-aqua": {
    id: "fresh-aqua",
    name: "Fresh Aqua",
    slug: "fresh-aqua",
    category: "Modern Residential & Wellness",
    tagline: "Soft organic floating island header with pastel teal curves and wellness aesthetics",
    layout: "floating-island",
    primary: "#0d9488", // Teal 600
    secondary: "#f0fdfa", // Teal 50
    accent: "#14b8a6", // Teal 500
    surface: "#ffffff",
    bodyBg: "#f7fefc", // Tinted mint-white
    radius: "1.5rem",
    cardClass: "rounded-3xl border border-teal-100/80 bg-white/90 backdrop-blur-sm shadow-md shadow-teal-900/5 p-6 transition-all hover:shadow-lg",
    buttonClass: "rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-600/25 hover:from-teal-700 hover:to-emerald-600",
    badgeClass: "rounded-full bg-teal-100/70 text-teal-800 font-bold px-3 py-1 text-xs",
    headerClass: "rounded-2xl border border-teal-200/60 bg-white/80 backdrop-blur-md shadow-sm text-teal-950",
    fontHeading: "font-sans font-black tracking-tight",
  },

  "aqua-express": {
    id: "aqua-express",
    name: "Aqua Express",
    slug: "aqua-express",
    category: "High-Speed Logistics",
    tagline: "Compact tactical high-contrast layout with top action dock for quick route monitoring",
    layout: "compact-dock",
    primary: "#2563eb", // Royal Blue
    secondary: "#eff6ff", // Blue 50
    accent: "#f59e0b", // Amber Warning Accent
    surface: "#ffffff",
    bodyBg: "#f1f5f9", // Slate 100
    radius: "0.375rem",
    cardClass: "rounded-md border-2 border-slate-300 bg-white p-4 shadow-none hover:border-blue-500 transition-all",
    buttonClass: "rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white hover:bg-blue-700 active:scale-95",
    badgeClass: "rounded-sm bg-blue-100 border border-blue-400 font-mono font-bold text-blue-900 px-2 py-0.5 text-xs uppercase",
    headerClass: "bg-slate-900 border-b-2 border-blue-500 text-white",
    fontHeading: "font-mono font-bold tracking-tight",
  },

  "ocean-premium": {
    id: "ocean-premium",
    name: "Ocean Premium",
    slug: "ocean-premium",
    category: "Deep Marine & Packaged Mineral",
    tagline: "Deep sapphire marine header with glowing cyan accents and high-contrast glass cards",
    layout: "dark-marine",
    primary: "#0284c7", // Bright Sky
    secondary: "#082f49", // Deep Navy
    accent: "#06b6d4", // Glowing Cyan
    surface: "#ffffff",
    bodyBg: "#0f172a", // Deep Slate / Dark Theme
    radius: "1rem",
    cardClass: "rounded-2xl border border-slate-800 bg-slate-900/95 text-white shadow-xl shadow-cyan-950/30 p-6 backdrop-blur-md hover:border-cyan-500/50 transition-all",
    buttonClass: "rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-sky-500",
    badgeClass: "rounded-full bg-cyan-950 border border-cyan-400/40 text-cyan-300 font-bold px-3 py-0.5 text-xs",
    headerClass: "bg-slate-950 border-b border-cyan-900/40 text-white shadow-md",
    fontHeading: "font-sans font-bold tracking-wide",
  },

  "pure-luxury": {
    id: "pure-luxury",
    name: "Pure Luxury",
    slug: "pure-luxury",
    category: "Alkaline & Prestige Glass Cans",
    tagline: "Refined obsidian and champagne gold aesthetic with editorial typography and gold hairline trims",
    layout: "luxury-editorial",
    primary: "#042f2e", // Deep Obsidian Emerald
    secondary: "#fef3c7", // Champagne Gold light
    accent: "#d97706", // Warm Gold
    surface: "#ffffff",
    bodyBg: "#fafaf9", // Warm Stone
    radius: "0.5rem",
    cardClass: "rounded-lg border border-amber-900/15 bg-white p-6 shadow-xs relative overflow-hidden transition-all hover:border-amber-600/40",
    buttonClass: "rounded-none border border-amber-600 bg-emerald-950 px-6 py-2.5 text-xs font-serif font-bold uppercase tracking-widest text-amber-200 hover:bg-emerald-900 shadow-xs",
    badgeClass: "rounded-none border border-amber-600/50 bg-amber-50 text-amber-900 font-serif font-bold px-2.5 py-0.5 text-[11px] uppercase tracking-wider",
    headerClass: "bg-emerald-950 border-b border-amber-600/30 text-amber-100",
    fontHeading: "font-serif font-bold tracking-wider",
  },
};
