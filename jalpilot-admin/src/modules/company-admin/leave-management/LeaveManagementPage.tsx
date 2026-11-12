import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { PageHeader } from "@/components/common/PageHeader";

export function LeaveManagementPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-leaves"],
    queryFn: async () => (await apiClient.get("/admin/leave-requests")).data.data as Array<{
      id: string; customer_name: string; start_date: string; end_date: string; reason: string; request_status: string;
    }>,
  });

  const decide = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "approve" | "reject" }) =>
      apiClient.post(`/admin/leave-requests/${id}/${action}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-leaves"] }),
  });

  return (
    <div>
      <PageHeader title="Customer Leave Requests" description="Approving a leave request automatically pauses scheduled deliveries" />
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Dates</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {(data || []).map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-3 font-medium">{l.customer_name}</td>
                <td className="px-4 py-3">{l.start_date} → {l.end_date}</td>
                <td className="px-4 py-3 text-slate-600">{l.reason}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold">{l.request_status}</span></td>
                <td className="px-4 py-3 text-right space-x-3">
                  {l.request_status === "PENDING" && (
                    <>
                      <button onClick={() => decide.mutate({ id: l.id, action: "approve" })} className="text-xs font-semibold text-emerald-600 hover:underline">Approve</button>
                      <button onClick={() => decide.mutate({ id: l.id, action: "reject" })} className="text-xs font-semibold text-rose-600 hover:underline">Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

