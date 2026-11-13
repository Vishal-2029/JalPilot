import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, Truck, CreditCard, Receipt, CalendarOff,
  UserCog, BarChart3, Palette, Settings, Droplets, LogOut, ChevronDown, CheckCircle2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTenantTheme } from "@/themes/theme-provider/TenantThemeProvider";
import { BUILTIN_THEMES } from "@/themes/theme-config/themes";
import { useState } from "react";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/products", label: "Products & Stock", icon: Package },
  { to: "/admin/deliveries", label: "Daily Deliveries", icon: Truck },
  { to: "/admin/payments", label: "Payments & Ledger", icon: CreditCard },
  { to: "/admin/expenses", label: "Expenses", icon: Receipt },
  { to: "/admin/leave-management", label: "Leave Requests", icon: CalendarOff },
  { to: "/admin/staff", label: "Staff", icon: UserCog },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/themes", label: "Theme Marketplace", icon: Palette },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function CompanyAdminLayout() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { companyName, themeSlug, tokens, setThemeSlug } = useTenantTheme();
  const [themeSwitcherOpen, setThemeSwitcherOpen] = useState(false);

  const isDarkMarine = themeSlug === "ocean-premium";
  const isLuxury = themeSlug === "pure-luxury";

  return (
    <div className={`flex min-h-screen ${isDarkMarine ? "bg-slate-950 text-slate-100" : isLuxury ? "bg-stone-50 text-stone-900" : "bg-slate-50 text-slate-900"}`}>
      {/* Dynamic Themed Sidebar */}
      <aside className={`w-64 border-r flex flex-col shrink-0 transition-colors duration-300 ${
        isDarkMarine
          ? "border-slate-800 bg-slate-950 text-slate-200"
          : isLuxury
          ? "border-amber-900/20 bg-emerald-950 text-amber-100"
          : "border-slate-200 bg-white"
      }`}>
        {/* Brand Header */}
        <div className={`flex h-16 items-center gap-2.5 border-b px-5 font-bold text-lg ${
          isDarkMarine ? "border-slate-800" : isLuxury ? "border-amber-900/40" : "border-slate-200"
        }`}>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-xs"
            style={{ backgroundColor: tokens.primary }}
          >
            <Droplets className="h-4 w-4" />
          </div>
          <div className="flex flex-col truncate">
            <span className={`text-sm font-bold truncate ${tokens.fontHeading}`} style={{ color: isDarkMarine ? "#38bdf8" : isLuxury ? "#fef3c7" : tokens.primary }}>
              {companyName}
            </span>
            <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">
              Admin Workspace
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.to);

            let activeStyle = {};
            let activeClasses = "";

            if (active) {
              if (isDarkMarine) {
                activeClasses = "bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold";
              } else if (isLuxury) {
                activeClasses = "bg-emerald-900/80 text-amber-300 border border-amber-500/30 font-serif font-bold";
              } else {
                activeStyle = { backgroundColor: tokens.secondary, color: tokens.primary };
                activeClasses = "font-bold shadow-xs";
              }
            } else {
              activeClasses = isDarkMarine
                ? "text-slate-400 hover:text-white hover:bg-slate-900"
                : isLuxury
                ? "text-emerald-200 hover:text-amber-100 hover:bg-emerald-900/40"
                : "text-slate-600 hover:bg-slate-100";
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                style={activeStyle}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${activeClasses}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className={`border-t p-4 ${isDarkMarine ? "border-slate-800" : isLuxury ? "border-amber-900/40" : "border-slate-200"}`}>
          <div className="flex items-center justify-between">
            <div className="truncate">
              <div className="text-xs font-bold truncate">{user?.full_name}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email || "Company Admin"}</div>
            </div>
            <button
              onClick={() => void logout()}
              title="Logout"
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50/10"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header with Theme Switcher */}
        <header className={`h-16 border-b px-6 flex items-center justify-between shrink-0 transition-colors ${
          isDarkMarine ? "border-slate-800 bg-slate-950/80" : isLuxury ? "border-amber-900/20 bg-white" : "border-slate-200 bg-white"
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active UI Theme:
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${tokens.badgeClass}`}>
              {tokens.name}
            </span>
          </div>

          {/* Interactive Theme Switcher in Admin Header */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setThemeSwitcherOpen(!themeSwitcherOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white shadow-xs hover:bg-slate-50 transition"
              style={{ color: tokens.primary }}
            >
              <Palette className="h-4 w-4" />
              <span>Theme: {tokens.name}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {themeSwitcherOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 z-50 text-slate-900">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Apply Theme Across Portal
                </div>
                <div className="space-y-1">
                  {Object.values(BUILTIN_THEMES).map((t) => (
                    <button
                      key={t.slug}
                      type="button"
                      onClick={() => {
                        void setThemeSlug(t.slug);
                        setThemeSwitcherOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-left transition ${
                        themeSlug === t.slug
                          ? "bg-sky-50 font-bold text-sky-800"
                          : "hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: t.primary }} />
                        <div>
                          <div>{t.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{t.category}</div>
                        </div>
                      </div>
                      {themeSlug === t.slug && <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
