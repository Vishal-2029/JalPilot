import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { PageHeader } from "@/components/common/PageHeader";

export function SupportTicketsPage() {
  const { data } = useQuery({
    queryKey: ["sa-tickets"],
    queryFn: async () => (await apiClient.get("/super-admin/support-tickets")).data.data as Array<{
      id: string; subject: string; priority: string; status: string; created_at: string;
    }>,
  });
  return (
    <div>
      <PageHeader title="Support Tickets" description="Tenant support requests across the platform" />
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
        {(data || []).length === 0 ? <p className="text-sm text-slate-500">No support tickets found.</p> : (data || []).map((t) => (
          <div key={t.id} className="flex justify-between border-b py-2 text-sm">
            <span className="font-medium">{t.subject}</span>
            <span className="text-xs text-slate-500">{t.priority} · {t.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuditLogsPage() {
  const { data } = useQuery({
    queryKey: ["sa-audit"],
    queryFn: async () => (await apiClient.get("/super-admin/audit-logs")).data.data as Array<{
      id: string; action: string; module: string; created_at: string;
    }>,
  });
  return (
    <div>
      <PageHeader title="Platform Audit Logs" description="Immutable security and administrative audit trail" />
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
        {(data || []).length === 0 ? <p className="text-sm text-slate-500">No audit entries yet.</p> : (data || []).map((l) => (
          <div key={l.id} className="flex justify-between border-b py-2 text-sm">
            <span><strong>{l.module}</strong>: {l.action}</span>
            <span className="text-xs text-slate-500">{l.created_at}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

