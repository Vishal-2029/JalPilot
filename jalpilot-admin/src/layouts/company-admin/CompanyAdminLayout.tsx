import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, Truck, CreditCard, Receipt, CalendarOff,
  UserCog, BarChart3, Palette, Settings, Droplets, LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5 font-bold text-sky-700 text-lg">
          <Droplets className="h-5 w-5 text-sky-600" />
          <span>JalPilot Admin</span>
        </div>
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-sky-50 text-sky-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-700 truncate">{user?.full_name}</div>
          <button
            onClick={() => void logout()}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
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

