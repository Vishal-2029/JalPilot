import { Link, Outlet, useLocation } from "react-router-dom";
import { Droplets, LayoutDashboard, Truck, Receipt, CreditCard, CalendarOff, LogOut } from "lucide-react";
import { useTenantTheme } from "@/themes/theme-provider/TenantThemeProvider";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/customer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/customer/deliveries", label: "Deliveries & Bottles", icon: Truck },
  { to: "/customer/expenses", label: "My Expenses", icon: Receipt },
  { to: "/customer/payments", label: "Payments", icon: CreditCard },
  { to: "/customer/leave-requests", label: "Leave Requests", icon: CalendarOff },
];

export function CustomerLayout() {
  const { companyName } = useTenantTheme();
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5 font-bold text-lg" style={{ color: "var(--jp-primary)" }}>
          <Droplets className="h-5 w-5" />
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
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition"
                style={active ? { backgroundColor: "var(--jp-secondary)", color: "var(--jp-primary)" } : undefined}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-700 truncate">{user?.full_name}</div>
          <button onClick={() => void logout()} className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50">
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

