import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { useTenantTheme } from "@/themes/theme-provider/TenantThemeProvider";

export function CustomerDashboardPage() {
  const { companyName } = useTenantTheme();
  const { data } = useQuery({
    queryKey: ["customer-dashboard"],
    queryFn: async () => (await apiClient.get("/customer/dashboard")).data.data as {
      full_name: string; customer_code: string; month_bottles: number; bottle_balance: number; outstanding_balance: number;
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Welcome, {data?.full_name || "Customer"}</h1>
      <p className="mt-1 text-sm text-slate-500">{companyName} · {data?.customer_code}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">This Month's Water Supply</div>
          <div className="mt-2 text-2xl font-bold" style={{ color: "var(--jp-primary)" }}>{data?.month_bottles ?? 0} Jars</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Empty Bottles With You</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{data?.bottle_balance ?? 0}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Pending Balance</div>
          <div className="mt-2 text-2xl font-bold text-rose-600">₹{data?.outstanding_balance ?? 0}</div>
        </div>
      </div>
    </div>
  );
}

