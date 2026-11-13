import { Link, Outlet } from "react-router-dom";
import { Truck, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function DeliveryStaffLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-14 border-b bg-white px-4 flex items-center justify-between">
        <Link to="/staff/deliveries" className="flex items-center gap-2 font-bold text-sky-700">
          <Truck className="h-5 w-5" /> Delivery Staff Portal
        </Link>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-600">{user?.full_name}</span>
          <button onClick={() => void logout()} className="text-rose-600 font-semibold flex items-center gap-1">
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 max-w-4xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}

