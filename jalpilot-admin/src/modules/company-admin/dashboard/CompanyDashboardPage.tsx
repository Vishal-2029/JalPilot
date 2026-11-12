import { useQuery } from "@tanstack/react-query";
import { Users, Truck, IndianRupee, Clock } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { apiClient } from "@/services/api-client";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";

export function CompanyDashboardPage() {
  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => (await apiClient.get("/admin/dashboard")).data.data as {
      total_customers: number; today_deliveries: number; pending_deliveries: number;
      today_collection: number; outstanding_balance: number; pending_leaves: number;
    },
  });

  const chartData = [
    { name: "Today Deliveries", value: data?.today_deliveries ?? 0 },
    { name: "Pending", value: data?.pending_deliveries ?? 0 },
    { name: "Leave Requests", value: data?.pending_leaves ?? 0 },
  ];

  return (
    <div>
      <PageHeader title="Company Dashboard" description="Daily water supply, collections, and pending operations" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Customers" value={data?.total_customers ?? 0} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Today's Deliveries" value={data?.today_deliveries ?? 0} subtitle={`${data?.pending_deliveries ?? 0} pending`} icon={<Truck className="h-5 w-5" />} />
        <StatCard title="Today's Collection" value={`₹${data?.today_collection ?? 0}`} icon={<IndianRupee className="h-5 w-5" />} />
        <StatCard title="Outstanding Balance" value={`₹${data?.outstanding_balance ?? 0}`} subtitle={`${data?.pending_leaves ?? 0} pending leaves`} icon={<Clock className="h-5 w-5" />} />
      </div>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Operations Snapshot</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#0284c7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

