import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";

export function ReportsPage() {
  const { data } = useQuery({
    queryKey: ["admin-reports-summary"],
    queryFn: async () => (await apiClient.get("/admin/reports/summary")).data.data as {
      monthly_bottles_supplied: number; monthly_collections: number; monthly_expenses: number; total_outstanding: number;
    },
  });
  return (
    <div>
      <PageHeader title="Reports & Analytics" description="Monthly water supply, collections, expenses, and receivables" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Monthly Bottles Supplied" value={data?.monthly_bottles_supplied ?? 0} />
        <StatCard title="Monthly Collections" value={`₹${data?.monthly_collections ?? 0}`} />
        <StatCard title="Monthly Expenses" value={`₹${data?.monthly_expenses ?? 0}`} />
        <StatCard title="Total Outstanding" value={`₹${data?.total_outstanding ?? 0}`} />
      </div>
    </div>
  );
}

