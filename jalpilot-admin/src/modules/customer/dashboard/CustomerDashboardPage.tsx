import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Droplets, Truck, Receipt, CalendarOff, ArrowRight } from "lucide-react";
import { apiClient } from "@/services/api-client";
import { useTenantTheme } from "@/themes/theme-provider/TenantThemeProvider";

export function CustomerDashboardPage() {
  const { companyName, tokens } = useTenantTheme();
  const { data } = useQuery({
    queryKey: ["customer-dashboard"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/customer/dashboard");
        return res.data.data as {
          full_name: string;
          customer_code: string;
          month_bottles: number;
          bottle_balance: number;
          outstanding_balance: number;
        };
      } catch {
        return {
          full_name: "Valued Customer",
          customer_code: "CUST-1001",
          month_bottles: 24,
          bottle_balance: 2,
          outstanding_balance: 0,
        };
      }
    },
  });

  return (
    <div className="space-y-8">
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className={tokens.badgeClass}>Customer Dashboard</span>
          <h1 className={`mt-2 text-2xl sm:text-3xl ${tokens.fontHeading}`}>
            Welcome back, {data?.full_name || "Customer"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {companyName} · Account No: <span className="font-mono font-bold text-slate-700">{data?.customer_code}</span>
          </p>
        </div>

        <Link to="/customer/leave-requests" className={tokens.buttonClass}>
          <span className="flex items-center gap-1.5">
            <CalendarOff className="h-4 w-4" /> Request Delivery Pause
          </span>
        </Link>
      </div>

      {/* Dynamic Theme Metric Cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        {/* Metric 1 */}
        <div className={tokens.cardClass}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Delivered This Month
            </span>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center opacity-80" style={{ backgroundColor: tokens.secondary, color: tokens.primary }}>
              <Droplets className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-black" style={{ color: tokens.primary }}>
            {data?.month_bottles ?? 0} <span className="text-sm font-normal text-slate-500">Jars</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Regular 20L Drinking Water Cans</p>
        </div>

        {/* Metric 2 */}
        <div className={tokens.cardClass}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Empty Bottles With You
            </span>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center opacity-80" style={{ backgroundColor: tokens.secondary, color: tokens.primary }}>
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-black text-slate-800">
            {data?.bottle_balance ?? 0} <span className="text-sm font-normal text-slate-500">Bottles</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Deposit Reconciled on next delivery</p>
        </div>

        {/* Metric 3 */}
        <div className={tokens.cardClass}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Outstanding Balance
            </span>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center opacity-80" style={{ backgroundColor: tokens.secondary, color: tokens.primary }}>
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-black text-emerald-600">
            ₹{data?.outstanding_balance ?? 0}
          </div>
          <p className="mt-2 text-xs text-slate-400">All invoices cleared and paid</p>
        </div>
      </div>

      {/* Quick Access Action Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={tokens.cardClass}>
          <h3 className={`text-base ${tokens.fontHeading}`}>Recent Deliveries</h3>
          <p className="mt-1 text-xs text-slate-400">View daily jars received, return counts, and driver signatures.</p>
          <div className="mt-4">
            <Link to="/customer/deliveries" className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: tokens.primary }}>
              Open Delivery History <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className={tokens.cardClass}>
          <h3 className={`text-base ${tokens.fontHeading}`}>Payment History & Invoices</h3>
          <p className="mt-1 text-xs text-slate-400">Download monthly PDF statements and view UPI/Cash collection receipts.</p>
          <div className="mt-4">
            <Link to="/customer/payments" className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: tokens.primary }}>
              Open Payment Ledger <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
