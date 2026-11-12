import { useQuery } from "@tanstack/react-query";
import { Building2, Users, IndianRupee, ShieldAlert } from "lucide-react";
import { apiClient } from "@/services/api-client";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";

export function SuperAdminDashboardPage() {
  const { data } = useQuery({
    queryKey: ["sa-dashboard"],
    queryFn: async () => (await apiClient.get("/super-admin/dashboard")).data.data as {
      total_companies: number; active_companies: number; trial_companies: number;
      suspended_companies: number; total_customers: number; total_revenue: number;
    },
  });

  return (
    <div>
      <PageHeader title="Platform Overview" description="Centralized SaaS metrics across all water supply tenants" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Companies" value={data?.total_companies ?? 0} subtitle={`${data?.active_companies ?? 0} active · ${data?.trial_companies ?? 0} trial`} icon={<Building2 className="h-5 w-5" />} />
        <StatCard title="Total Customers" value={data?.total_customers ?? 0} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Platform Revenue" value={`₹${data?.total_revenue ?? 0}`} icon={<IndianRupee className="h-5 w-5" />} />
        <StatCard title="Suspended Companies" value={data?.suspended_companies ?? 0} icon={<ShieldAlert className="h-5 w-5" />} />
      </div>
    </div>
  );
}

