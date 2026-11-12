import { Link, Outlet, useLocation } from "react-router-dom";
import { Building2, LayoutDashboard, Palette, ShieldCheck, LogOut, Ticket, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/super-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/super-admin/companies", label: "Water Companies", icon: Building2 },
  { to: "/super-admin/themes", label: "Theme Catalogue", icon: Palette },
  { to: "/super-admin/support", label: "Support Tickets", icon: Ticket },
  { to: "/super-admin/audit-logs", label: "Audit Logs", icon: FileText },
];

export function SuperAdminLayout() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-64 border-r border-slate-200 bg-slate-900 text-slate-100 flex flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-5 font-bold text-lg">
          <ShieldCheck className="h-5 w-5 text-sky-400" />
          <span>JalPilot Super Admin</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-sky-600 text-white" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-800 p-4">
          <div className="text-xs text-slate-400 truncate">{user?.full_name}</div>
          <button
            onClick={() => void logout()}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-300 hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

