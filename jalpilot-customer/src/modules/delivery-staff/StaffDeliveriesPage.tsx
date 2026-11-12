import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";

export function StaffDeliveriesPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["staff-deliveries"],
    queryFn: async () => (await apiClient.get("/staff/deliveries")).data.data as Array<{
      id: string; customer_name: string; customer_phone: string; delivery_date: string; delivery_status: string;
    }>,
  });

  const markDelivered = useMutation({
    mutationFn: async (id: string) => apiClient.patch(`/staff/deliveries/${id}/status`, { status: "DELIVERED" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff-deliveries"] }),
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Today's Assigned Deliveries</h1>
      <div className="space-y-3">
        {(data || []).map((d) => (
          <div key={d.id} className="rounded-xl border bg-white p-4 flex items-center justify-between">
            <div>
              <div className="font-bold">{d.customer_name}</div>
              <div className="text-xs text-slate-500">{d.customer_phone} · {d.delivery_date}</div>
            </div>
            {d.delivery_status === "DELIVERED" ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">DELIVERED</span>
            ) : (
              <button onClick={() => markDelivered.mutate(d.id)} className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white">
                Mark Delivered
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

