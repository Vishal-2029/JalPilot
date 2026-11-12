import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { PageHeader } from "@/components/common/PageHeader";

export function SettingsPage() {
  const { data: company } = useQuery({
    queryKey: ["admin-company"],
    queryFn: async () => (await apiClient.get("/admin/company")).data.data as {
      company_name: string; slug: string; email: string; phone: string; status: string; currency: string;
    },
  });

  const { data: sub } = useQuery({
    queryKey: ["admin-subscription"],
    queryFn: async () => (await apiClient.get("/admin/subscription")).data.data as {
      plan_name: string; status: string; billing_interval: string; trial_end_date?: string;
    },
  });

  return (
    <div>
      <PageHeader title="Company & Subscription Settings" description="Workspace details and SaaS plan status" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2 text-sm">
          <h3 className="font-bold text-base mb-2">Company Profile</h3>
          <div><strong>Name:</strong> {company?.company_name}</div>
          <div><strong>Slug:</strong> {company?.slug}</div>
          <div><strong>Email:</strong> {company?.email}</div>
          <div><strong>Phone:</strong> {company?.phone}</div>
          <div><strong>Currency:</strong> {company?.currency}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2 text-sm">
          <h3 className="font-bold text-base mb-2">SaaS Subscription</h3>
          <div><strong>Plan:</strong> {sub?.plan_name}</div>
          <div><strong>Status:</strong> {sub?.status}</div>
          <div><strong>Interval:</strong> {sub?.billing_interval}</div>
          {sub?.trial_end_date && <div><strong>Trial Ends:</strong> {sub.trial_end_date}</div>}
        </div>
      </div>
    </div>
  );
}

