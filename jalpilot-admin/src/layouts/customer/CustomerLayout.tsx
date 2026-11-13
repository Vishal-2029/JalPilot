import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Droplets,
  LayoutDashboard,
  Truck,
  Receipt,
  CreditCard,
  CalendarOff,
  LogOut,
  Palette,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { useTenantTheme } from "@/themes/theme-provider/TenantThemeProvider";
import { BUILTIN_THEMES } from "@/themes/theme-config/themes";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const navItems = [
  { to: "/customer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/customer/deliveries", label: "Deliveries & Bottles", icon: Truck },
  { to: "/customer/expenses", label: "My Expenses", icon: Receipt },
  { to: "/customer/payments", label: "Payments", icon: CreditCard },
  { to: "/customer/leave-requests", label: "Leave Requests", icon: CalendarOff },
];

export function CustomerLayout() {
  const { companyName, themeSlug, tokens, setThemeSlug } = useTenantTheme();
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [themeSwitcherOpen, setThemeSwitcherOpen] = useState(false);

  // Quick theme selector component available across all themes
  const ThemeSwitcherPill = () => (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setThemeSwitcherOpen(!themeSwitcherOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-white/90 backdrop-blur-xs text-slate-700 shadow-xs hover:bg-white transition"
      >
        <Palette className="h-3.5 w-3.5 text-sky-600" />
        <span className="font-semibold">{tokens.name}</span>
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      {themeSwitcherOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 z-50">
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Switch Portal UI/UX Theme
          </div>
          <div className="space-y-1">
            {Object.values(BUILTIN_THEMES).map((t) => (
              <button
                key={t.slug}
                onClick={() => {
                  setThemeSlug(t.slug);
                  setThemeSwitcherOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-left transition ${
                  themeSlug === t.slug
                    ? "bg-slate-100 font-bold text-slate-900"
                    : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: t.primary }} />
                  <div>
                    <div>{t.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{t.category}</div>
                  </div>
                </div>
                {themeSlug === t.slug && <span className="text-[10px] text-sky-600 font-bold">Active</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  /* ========================================================================= */
  /* LAYOUT 1: FLOATING ISLAND (Fresh Aqua)                                    */
  /* ========================================================================= */
  if (tokens.layout === "floating-island") {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: tokens.bodyBg }}>
        {/* Floating rounded island navbar */}
        <header className="sticky top-4 z-40 px-4 sm:px-6">
          <div className={`mx-auto max-w-6xl ${tokens.headerClass} px-5 py-3 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: tokens.primary }}>
                <Droplets className="h-5 w-5" />
              </div>
              <div>
                <span className={`text-base font-black ${tokens.fontHeading}`} style={{ color: tokens.primary }}>
                  {companyName}
                </span>
                <span className="ml-2 text-[10px] uppercase font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                  Wellness Portal
                </span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                      active
                        ? "bg-teal-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-teal-700 hover:bg-teal-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2.5">
              <ThemeSwitcherPill />
              <button
                onClick={() => void logout()}
                className="p-2 rounded-full hover:bg-rose-50 text-rose-600 transition"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mobile sub-bar */}
          <div className="md:hidden flex overflow-x-auto gap-2 py-2 px-2 mt-2">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                    active ? "bg-teal-600 text-white" : "bg-white text-slate-700 shadow-xs"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    );
  }

  /* ========================================================================= */
  /* LAYOUT 2: COMPACT TACTICAL DOCK (Aqua Express)                            */
  /* ========================================================================= */
  if (tokens.layout === "compact-dock") {
    return (
      <div className="min-h-screen flex flex-col font-mono" style={{ backgroundColor: tokens.bodyBg }}>
        {/* Tactical High-Contrast Top Bar */}
        <header className="bg-slate-900 border-b-2 border-blue-500 text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-bold text-sm tracking-wider uppercase text-blue-400">
              {companyName} // ROUTE-DISPATCH
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeSwitcherPill />
            <button
              onClick={() => void logout()}
              className="rounded-sm bg-rose-900/40 border border-rose-500/50 px-2 py-1 text-[11px] font-mono text-rose-300 hover:bg-rose-900"
            >
              [EXIT]
            </button>
          </div>
        </header>

        {/* Action tabs dock */}
        <div className="bg-white border-b-2 border-slate-300 px-4 py-1.5 flex overflow-x-auto gap-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-1 text-xs font-mono font-bold uppercase transition ${
                  active
                    ? "bg-blue-600 text-white rounded-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                &gt; {item.label}
              </Link>
            );
          })}
        </div>

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    );
  }

  /* ========================================================================= */
  /* LAYOUT 3: DARK MARINE (Ocean Premium)                                     */
  /* ========================================================================= */
  if (tokens.layout === "dark-marine") {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        {/* Sapphire Oceanic Glass Navbar */}
        <header className="sticky top-0 z-40 border-b border-cyan-900/40 bg-slate-950/90 backdrop-blur-md px-4 sm:px-8 py-3.5">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                <Droplets className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-base text-white tracking-wide">{companyName}</span>
                <span className="ml-2 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300">
                  Mineral Reserve
                </span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      active
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <ThemeSwitcherPill />
              <button
                onClick={() => void logout()}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </div>
          </div>

          {/* Mobile nav bar */}
          <div className="md:hidden flex overflow-x-auto gap-2 pt-2 border-t border-slate-900 mt-2">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                    active ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    );
  }

  /* ========================================================================= */
  /* LAYOUT 4: LUXURY EDITORIAL (Pure Luxury)                                  */
  /* ========================================================================= */
  if (tokens.layout === "luxury-editorial") {
    return (
      <div className="min-h-screen flex flex-col font-serif" style={{ backgroundColor: tokens.bodyBg }}>
        {/* Prestige Obsidian & Champagne Gold Header */}
        <header className="bg-emerald-950 border-b border-amber-500/30 text-amber-100 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 border border-amber-400/50 flex items-center justify-center text-amber-300">
                <Droplets className="h-4 w-4" />
              </div>
              <div>
                <span className="font-serif font-bold text-lg tracking-wider text-amber-100 uppercase">
                  {companyName}
                </span>
                <div className="text-[9px] uppercase tracking-widest text-amber-400/80 font-sans">
                  Private Water Reserve Concierge
                </div>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-widest font-sans font-semibold">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`pb-1 transition ${
                      active
                        ? "text-amber-300 border-b-2 border-amber-400"
                        : "text-emerald-300 hover:text-amber-200"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <ThemeSwitcherPill />
              <button
                onClick={() => void logout()}
                className="text-xs uppercase tracking-widest font-sans text-amber-300/80 hover:text-amber-200 flex items-center gap-1"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="md:hidden flex overflow-x-auto gap-4 pt-3 border-t border-emerald-900/60 mt-2 text-xs font-sans">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`whitespace-nowrap ${active ? "text-amber-300 font-bold" : "text-emerald-300"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    );
  }

  /* ========================================================================= */
  /* LAYOUT 5: CORPORATE SIDEBAR (Aqua Professional - Default)                 */
  /* ========================================================================= */
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5 font-bold text-lg text-sky-700">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white shadow-xs">
            <Droplets className="h-4 w-4" />
          </div>
          <span className="truncate">{companyName}</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-sky-50 text-sky-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4 space-y-3">
          <div className="text-xs font-medium text-slate-700 truncate">{user?.full_name}</div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <ThemeSwitcherPill />
            <button
              onClick={() => void logout()}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Enterprise Water Account
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcherPill />
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
